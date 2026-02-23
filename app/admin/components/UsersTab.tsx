'use client'

import { useState } from 'react'
import { Users, Crown, BadgeCheck, XCircle, ShieldBan, Shield, Search, Download } from 'lucide-react'

export type AdminUser = {
  id: string
  name: string
  email: string
  emailVerified: boolean
  image: string | null
  role: string
  banned: boolean
  createdAt: string
  _count: {
    votes: number
    tickets: number
  }
}

interface UsersTabProps {
  usersList: AdminUser[]
  onBanUser: (id: string, banned: boolean) => void
  onExportUsers: () => void
}

export default function UsersTab({ usersList, onBanUser, onExportUsers }: UsersTabProps) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'verified' | 'unverified' | 'banned'>('all')

  const filtered = usersList.filter(u => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
    if (!matchesSearch) return false
    if (filter === 'verified') return u.emailVerified && !u.banned
    if (filter === 'unverified') return !u.emailVerified && !u.banned
    if (filter === 'banned') return u.banned
    return true
  })

  const totalVerified = usersList.filter(u => u.emailVerified).length
  const totalBanned = usersList.filter(u => u.banned).length

  return (
    <div className="bg-white rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="bg-burgundy-900 px-4 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-xl font-bold text-white flex items-center gap-2 sm:gap-3">
            <Crown className="w-5 h-5 text-gold-500" />
            <span>Registered Users</span>
          </h2>
          <p className="text-xs sm:text-sm text-burgundy-200 mt-0.5 sm:mt-1">All sign-ups and account activity</p>
        </div>
        <button
          onClick={onExportUsers}
          className="flex items-center gap-2 px-4 py-2.5 bg-white/10 text-white rounded-full font-medium text-sm hover:bg-white/20 transition-colors self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 p-4 sm:p-6 bg-gray-50 border-b border-gray-100">
        <div className="bg-white rounded-xl p-3 sm:p-4">
          <div className="text-lg sm:text-2xl font-black text-burgundy-900">{usersList.length}</div>
          <div className="text-xs text-gray-500 font-medium">Total Users</div>
        </div>
        <div className="bg-white rounded-xl p-3 sm:p-4">
          <div className="text-lg sm:text-2xl font-black text-green-600">{totalVerified}</div>
          <div className="text-xs text-gray-500 font-medium">Verified</div>
        </div>
        <div className="bg-white rounded-xl p-3 sm:p-4">
          <div className="text-lg sm:text-2xl font-black text-amber-600">{usersList.length - totalVerified}</div>
          <div className="text-xs text-gray-500 font-medium">Unverified</div>
        </div>
        <div className="bg-white rounded-xl p-3 sm:p-4">
          <div className="text-lg sm:text-2xl font-black text-red-600">{totalBanned}</div>
          <div className="text-xs text-gray-500 font-medium">Banned</div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="p-4 sm:p-6 border-b border-gray-100 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gold-500"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {(['all', 'verified', 'unverified', 'banned'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-2 rounded-full text-xs font-semibold capitalize transition-all ${
                filter === f
                  ? 'bg-burgundy-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 font-medium">No users found</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="px-4 sm:px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-4 sm:px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Joined</th>
                <th className="px-4 sm:px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Votes</th>
                <th className="px-4 sm:px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Role</th>
                <th className="px-4 sm:px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 sm:px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(user => (
                <tr key={user.id} className={`hover:bg-gray-50 transition-colors ${user.banned ? 'opacity-60' : ''}`}>
                  <td className="px-4 sm:px-6 py-3">
                    <div className="flex items-center gap-3">
                      {user.image ? (
                        <img src={user.image} alt={user.name} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-burgundy-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-burgundy-900">{user.name.charAt(0).toUpperCase()}</span>
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="font-semibold text-gray-900 truncate">{user.name}</div>
                        <div className="text-xs text-gray-500 truncate">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 py-3 text-gray-500 hidden md:table-cell whitespace-nowrap">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 sm:px-6 py-3 hidden sm:table-cell">
                    <span className="font-semibold text-burgundy-900">{user._count.votes}</span>
                  </td>
                  <td className="px-4 sm:px-6 py-3 hidden sm:table-cell">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      user.role === 'admin' ? 'bg-gold-100 text-gold-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 sm:px-6 py-3">
                    {user.banned ? (
                      <span className="flex items-center gap-1 text-xs font-semibold text-red-600">
                        <XCircle className="w-3.5 h-3.5" /> Banned
                      </span>
                    ) : user.emailVerified ? (
                      <span className="flex items-center gap-1 text-xs font-semibold text-green-600">
                        <BadgeCheck className="w-3.5 h-3.5" /> Verified
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs font-semibold text-amber-600">
                        <XCircle className="w-3.5 h-3.5" /> Unverified
                      </span>
                    )}
                  </td>
                  <td className="px-4 sm:px-6 py-3 text-right">
                    {user.role !== 'admin' && (
                      <button
                        onClick={() => onBanUser(user.id, !user.banned)}
                        title={user.banned ? 'Unban user' : 'Ban user'}
                        className={`p-1.5 rounded-lg transition-colors ${
                          user.banned
                            ? 'text-green-600 hover:bg-green-50'
                            : 'text-red-500 hover:bg-red-50'
                        }`}
                      >
                        {user.banned ? <Shield className="w-4 h-4" /> : <ShieldBan className="w-4 h-4" />}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
