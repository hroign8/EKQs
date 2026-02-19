import 'dotenv/config'
import { MongoClient, ObjectId } from 'mongodb'

/**
 * Migrate data from PostgreSQL to MongoDB.
 *
 * Requires two environment variables:
 *   PG_DATABASE_URL   – the old PostgreSQL connection string
 *   DATABASE_URL      – the new MongoDB connection string (already in .env)
 *
 * Usage:
 *   PG_DATABASE_URL="postgresql://postgres:51235@localhost:5432/ekqs?schema=public" npx tsx prisma/migrate-pg-to-mongo.ts
 *
 * This script:
 *  1. Reads all data from the PostgreSQL tables
 *  2. Maps old cuid IDs → new MongoDB ObjectIds
 *  3. Inserts all data into MongoDB collections with corrected references
 */

const PG_URL = process.env.PG_DATABASE_URL
const MONGO_URL = process.env.DATABASE_URL

if (!PG_URL) {
  console.error('❌ PG_DATABASE_URL environment variable is required.')
  console.error('   Usage: PG_DATABASE_URL="postgresql://..." npx tsx prisma/migrate-pg-to-mongo.ts')
  process.exit(1)
}

if (!MONGO_URL) {
  console.error('❌ DATABASE_URL (MongoDB) environment variable is required.')
  process.exit(1)
}

// Table → Mongo collection mapping (matches @@map in schema)
const COLLECTIONS = {
  user: 'user',
  session: 'session',
  account: 'account',
  verification: 'verification',
  contestant: 'contestant',
  voting_category: 'voting_category',
  voting_package: 'voting_package',
  vote: 'vote',
  event: 'event',
  ticket_type: 'ticket_type',
  ticket_purchase: 'ticket_purchase',
  pesapal_transaction: 'pesapal_transaction',
  contact_message: 'contact_message',
  notification: 'notification',
  subscriber: 'subscriber',
} as const

async function main() {
  console.log('🔄 Starting PostgreSQL → MongoDB migration...\n')

  // ─── Connect to PostgreSQL ─────────────────────────────────
  // pg is a devDependency / optional – import dynamically so the migration script
  // works even though pg was removed from main dependencies.
  const pg = await import('pg')
  const pool = new pg.default.Pool({ connectionString: PG_URL })
  console.log('✅ Connected to PostgreSQL')

  // ─── Connect to MongoDB ────────────────────────────────────
  const mongo = new MongoClient(MONGO_URL!)
  await mongo.connect()
  const dbName = new URL(MONGO_URL!).pathname.slice(1) || 'ekqs'
  const db = mongo.db(dbName)
  console.log(`✅ Connected to MongoDB (database: ${dbName})\n`)

  // ─── Helper: Fetch all rows from a PG table ───────────────
  async function fetchAll(table: string) {
    const { rows } = await pool.query(`SELECT * FROM "${table}"`)
    return rows
  }

  // ─── Read all data from PostgreSQL ─────────────────────────
  const pgData: Record<string, Record<string, unknown>[]> = {}
  for (const table of Object.keys(COLLECTIONS)) {
    try {
      pgData[table] = await fetchAll(table)
      console.log(`  📖 Read ${pgData[table].length} rows from PG table "${table}"`)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err)
      // Table might not exist if it was never used
      if (message.includes('does not exist') || message.includes('relation')) {
        pgData[table] = []
        console.log(`  ⚠️  PG table "${table}" not found, skipping`)
      } else {
        throw err
      }
    }
  }

  console.log('')

  // ─── Build ID mapping: old cuid → new ObjectId ────────────
  const idMap = new Map<string, string>()

  // Generate ObjectIds for all entities that have an id field
  for (const table of Object.keys(COLLECTIONS)) {
    for (const row of pgData[table]) {
      if (row.id && typeof row.id === 'string' && !idMap.has(row.id)) {
        idMap.set(row.id, new ObjectId().toHexString())
      }
    }
  }

  console.log(`🔑 Generated ${idMap.size} new ObjectIds for ID mapping\n`)

  // ─── Helper: Map an old ID to new ObjectId ─────────────────
  function mapId(oldId: string | null | undefined): InstanceType<typeof ObjectId> | null {
    if (!oldId) return null
    const newId = idMap.get(oldId)
    if (!newId) {
      console.warn(`  ⚠️  No mapping found for ID: ${oldId}`)
      return null
    }
    return new ObjectId(newId)
  }

  // ─── Helper: convert PG row to Mongo document ─────────────
  // Renames 'id' → '_id' and maps all known FK fields to ObjectIds
  const fkFields = new Set([
    'userId', 'contestantId', 'categoryId', 'packageId', 'ticketTypeId',
  ])

  function toMongoDoc(row: Record<string, unknown>): Record<string, unknown> {
    const doc: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(row)) {
      if (key === 'id') {
        doc['_id'] = mapId(value as string)
      } else if (fkFields.has(key) && typeof value === 'string') {
        doc[key] = mapId(value)?.toHexString() ?? value
      } else {
        doc[key] = value
      }
    }
    return doc
  }

  // ─── Insert data into MongoDB ──────────────────────────────
  for (const [table, collectionName] of Object.entries(COLLECTIONS)) {
    const rows = pgData[table]
    if (rows.length === 0) {
      console.log(`  ⏭️  Skipping empty collection "${collectionName}"`)
      continue
    }

    const collection = db.collection(collectionName)

    // Drop existing data in collection to make migration idempotent
    await collection.deleteMany({})

    const docs = rows.map(toMongoDoc)
    await collection.insertMany(docs)
    console.log(`  ✅ Inserted ${docs.length} documents into "${collectionName}"`)
  }

  console.log('')
  console.log('🎉 Migration complete!')
  console.log('')
  console.log('Next steps:')
  console.log('  1. Run: npx prisma generate')
  console.log('  2. Run: npx prisma db push')
  console.log('  3. Start your app: npm run dev')

  await pool.end()
  await mongo.close()
}

main().catch((e) => {
  console.error('❌ Migration failed:', e)
  process.exit(1)
})
