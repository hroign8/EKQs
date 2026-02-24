import 'dotenv/config'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // ─── Voting Categories ─────────────────────────────────────
  const categories = await Promise.all([
    prisma.votingCategory.upsert({
      where: { slug: 'peoplesChoice' },
      update: {},
      create: { slug: 'peoplesChoice', name: "People's Choice" },
    }),
    prisma.votingCategory.upsert({
      where: { slug: 'bestTalent' },
      update: {},
      create: { slug: 'bestTalent', name: 'Best Talent' },
    }),
    prisma.votingCategory.upsert({
      where: { slug: 'bestEveningWear' },
      update: {},
      create: { slug: 'bestEveningWear', name: 'Best Evening Wear' },
    }),
    prisma.votingCategory.upsert({
      where: { slug: 'missPhotogenic' },
      update: {},
      create: { slug: 'missPhotogenic', name: 'Miss Photogenic' },
    }),
  ])

  console.log(`✅ Created ${categories.length} voting categories`)

  // ─── Voting Packages ───────────────────────────────────────
  const packagesData = [
    { slug: 'starter', name: 'STARTER', votes: 1, price: 0.30 },
    { slug: 'bronze', name: 'BRONZE', votes: 5, price: 1.35 },
    { slug: 'silver', name: 'SILVER', votes: 10, price: 2.70 },
    { slug: 'gold', name: 'GOLD', votes: 30, price: 8.10 },
    { slug: 'platinum', name: 'PLATINUM', votes: 50, price: 13.50 },
    { slug: 'diamond', name: 'DIAMOND', votes: 100, price: 27 },
    { slug: 'elite', name: 'ELITE', votes: 200, price: 54 },
    { slug: 'champion', name: 'CHAMPION', votes: 500, price: 135 },
    { slug: 'legend', name: 'LEGEND', votes: 1000, price: 270 },
    { slug: 'ultimate', name: 'ULTIMATE', votes: 5000, price: 1350 },
  ]

  for (const pkg of packagesData) {
    await prisma.votingPackage.upsert({
      where: { slug: pkg.slug },
      update: {},
      create: pkg,
    })
  }

  console.log(`✅ Created ${packagesData.length} voting packages`)

  // ─── Contestants ───────────────────────────────────────────
  const contestantsData = [
    {
      name: 'Amara Okonkwo',
      country: 'Eritrea',
      gender: 'Male',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face',
      description: 'An environmental activist and model working to protect African wildlife. Amara founded a nonprofit that has planted over 50,000 trees across Nigeria.',
      rank: 3,
    },
    {
      name: 'Marie Dubois',
      country: 'Eritrea',
      gender: 'Female',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face',
      description: "A medical student specializing in pediatric care. Marie volunteers with Doctors Without Borders and dreams of opening a children's hospital in rural France.",
      rank: 5,
    },
    {
      name: 'Isabella Rodriguez',
      country: 'Eritrea',
      gender: 'Female',
      image: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&h=400&fit=crop&crop=face',
      description: "A passionate advocate for education and women's empowerment. Isabella holds a degree in International Relations and works with UNESCO.",
      rank: 1,
    },
    {
      name: 'Elena Vasquez',
      country: 'Eritrea',
      gender: 'Male',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
      description: 'A software engineer and tech entrepreneur empowering young girls in STEM. Elena founded a coding bootcamp that has trained over 1,000 women.',
      rank: 4,
    },
    {
      name: 'Sophia Chen',
      country: 'Eritrea',
      gender: 'Female',
      image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&h=400&fit=crop&crop=face',
      description: 'A marine biologist dedicated to ocean conservation. Sophia leads beach cleanup initiatives and educates communities about sustainable fishing.',
      rank: 2,
    },
    {
      name: 'Yuki Tanaka',
      country: 'Eritrea',
      gender: 'Male',
      image: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=400&h=400&fit=crop&crop=face',
      description: 'A classical pianist and music teacher providing free lessons to underprivileged children. Yuki has performed in concert halls across Asia.',
      rank: 6,
    },
  ]

  for (const contestant of contestantsData) {
    const existing = await prisma.contestant.findFirst({
      where: { name: contestant.name },
    })
    if (!existing) {
      await prisma.contestant.create({ data: contestant })
    }
  }

  console.log(`✅ Created ${contestantsData.length} contestants`)

  // ─── Event ─────────────────────────────────────────────────
  const existingEvent = await prisma.event.findFirst({ where: { isActive: true } })
  if (!existingEvent) {
    await prisma.event.create({
      data: {
        name: 'Eritrean Kings & Queens',
        tagline: 'Celebrating Excellence & Beauty',
        startDate: '22/03/2026',
        endDate: '22/03/2026',
        votingStart: '01/02/2026',
        votingEnd: '21/03/2026',
        isActive: true,
        votingOpen: true,
        votePrice: 0.30,
      },
    })
    console.log('✅ Created event')
  }

  // ─── Ticket Types ─────────────────────────────────────────
  const ticketTypesData = [
    {
      name: 'VVIP',
      price: 50,
      features: [
        'Premium front-row seating',
        'Backstage access',
        'Meet & greet with contestants',
        'Exclusive gift bag',
        'Priority entry',
        'Complimentary drinks',
      ],
      icon: 'crown',
      popular: true,
      sortOrder: 1,
    },
    {
      name: 'VIP',
      price: 30,
      features: [
        'Reserved seating',
        'Early entry',
        'Event program',
        'Commemorative badge',
        'Refreshments included',
      ],
      icon: 'star',
      sortOrder: 2,
    },
    {
      name: 'General',
      price: 10,
      features: [
        'General admission',
        'Event access',
        'Standing area',
        'Complimentary refreshments',
      ],
      icon: 'ticket',
      sortOrder: 3,
    },
  ]

  for (const ticket of ticketTypesData) {
    const existing = await prisma.ticketType.findFirst({
      where: { name: ticket.name },
    })
    if (!existing) {
      await prisma.ticketType.create({ data: ticket })
    }
  }

  console.log(`✅ Created ${ticketTypesData.length} ticket types`)

  console.log('🎉 Seeding complete!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
