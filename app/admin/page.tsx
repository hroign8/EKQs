'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  TrendingUp, Users, Trophy, BarChart3,
  RefreshCw, Download, Settings, Eye,
  Crown, Loader2, DollarSign, Wallet, CreditCard, ArrowUpRight,
} from 'lucide-react'
import { isAdmin } from '@/types'
import type { AdminTab } from './types'

import OverviewTab from './components/OverviewTab'
import ResultsTab from './components/ResultsTab'
import ContestantsTab from './components/ContestantsTab'
import VoteLogTab from './components/VoteLogTab'
import RevenueTab from './components/RevenueTab'
import PackagesTab from './components/PackagesTab'
import SettingsTab from './components/SettingsTab'
import UsersTab from './components/UsersTab'
import AdminModals from './components/AdminModals'
import { useAdminData } from './hooks/useAdminData'

const tabs: { id: AdminTab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'contestants', label: 'Participants' },
  { id: 'results', label: 'Results' },
  { id: 'packages', label: 'Packages' },
  { id: 'revenue', label: 'Revenue' },
  { id: 'users', label: 'Users' },
  { id: 'votelog', label: 'Vote Log' },
  { id: 'settings', label: 'Event Settings' },
]

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview')
  const admin = useAdminData()
  const router = useRouter()

  // ---------------------------------------------------------------------------
  // Auth guards
  // ---------------------------------------------------------------------------
  if (admin.sessionPending) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-burgundy-900" />
      </div>
    )
  }

  if (!admin.session?.user) {
    if (typeof window !== 'undefined') {
      router.push('/admin/login')
    }
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-burgundy-900" />
      </div>
    )
  }

  if (!isAdmin(admin.session.user)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Crown className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-burgundy-900 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-6">
            You do not have administrator privileges. Only admin accounts can access this dashboard.
          </p>
          <button
            onClick={() => router.push('/')}
            className="bg-burgundy-900 hover:bg-burgundy-800 text-white px-6 py-3 rounded-full font-semibold transition-colors"
          >
            Return to Home
          </button>
        </div>
      </div>
    )
  }

  if (admin.dataLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-burgundy-900 mx-auto mb-4" />
          <p className="text-gray-600">Loading admin data...</p>
        </div>
      </div>
    )
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Header */}
      <div className="bg-burgundy-900 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="h-px w-12 bg-gold-500"></div>
              <Crown className="w-6 h-6 text-gold-500" />
              <div className="h-px w-12 bg-gold-500"></div>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Admin Dashboard</h1>
            <p className="text-burgundy-200">Manage contestants, votes, and settings</p>
          </div>

          {/* Action Bar */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            <div className={`flex items-center gap-2 px-4 py-2.5 rounded-full font-medium ${
              admin.votingActive ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
            }`}>
              <div className={`w-2 h-2 rounded-full animate-pulse ${admin.votingActive ? 'bg-green-400' : 'bg-red-400'}`}></div>
              <span>{admin.votingActive ? 'Voting Open' : 'Voting Closed'}</span>
            </div>

            <a
              href="/"
              target="_blank"
              className="flex items-center gap-2 px-4 py-2.5 bg-white/10 rounded-full hover:bg-white/20 transition-colors text-white font-medium"
            >
              <Eye className="w-4 h-4" />
              <span>View Site</span>
            </a>

            <button
              onClick={() => window.location.reload()}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/10 rounded-full hover:bg-white/20 transition-colors text-white font-medium"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>

            <button
              onClick={admin.handleExportCSV}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/10 rounded-full hover:bg-white/20 transition-colors text-white font-medium"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className="flex items-center gap-2 px-4 py-2.5 bg-gold-500 rounded-full hover:bg-gold-400 transition-colors text-burgundy-900 font-semibold"
            >
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Tabs Navigation */}
        <div className="mb-6 sm:mb-8">
          <div className="bg-white rounded-2xl p-1.5 sm:p-2 overflow-x-auto scroll-container">
            <div className="flex gap-1 sm:gap-2 min-w-max" role="tablist">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 sm:px-5 py-2 sm:py-2.5 rounded-full font-medium transition-all text-sm sm:text-base whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-burgundy-900 text-white'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-burgundy-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Revenue Summary Card */}
        <div className="bg-burgundy-900 rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 sm:gap-6 mb-4 sm:mb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gold-500 rounded-2xl flex items-center justify-center flex-shrink-0">
                <Wallet className="w-7 h-7 text-burgundy-900" />
              </div>
              <div>
                <h3 className="text-burgundy-200 text-sm font-medium mb-1">Revenue from Voting</h3>
                <p className="text-2xl sm:text-3xl md:text-4xl font-black text-white">
                  ${admin.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-green-500/20 rounded-full px-4 py-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-green-300 font-medium text-sm">Live Tracking</span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4">
              <div className="flex items-center gap-2 text-burgundy-200 text-xs font-medium mb-2">
                <CreditCard className="w-4 h-4" />
                <span>Transactions</span>
              </div>
              <p className="text-2xl font-black text-white">{admin.voteLogList.length.toLocaleString()}</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-2 text-burgundy-200 text-xs font-medium mb-2">
                <TrendingUp className="w-4 h-4" />
                <span>Votes Sold</span>
              </div>
              <p className="text-2xl font-black text-white">{admin.totalVotesSold.toLocaleString()}</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-2 text-burgundy-200 text-xs font-medium mb-2">
                <DollarSign className="w-4 h-4" />
                <span>Avg Transaction</span>
              </div>
              <p className="text-2xl font-black text-white">${admin.averageTransactionValue.toFixed(2)}</p>
            </div>

            <button
              onClick={() => setActiveTab('revenue')}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-colors text-left group"
            >
              <div className="flex items-center gap-2 text-burgundy-200 text-xs font-medium mb-2">
                <BarChart3 className="w-4 h-4" />
                <span>View Details</span>
              </div>
              <p className="text-2xl font-black text-white flex items-center gap-2">
                Revenue <ArrowUpRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </p>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-5 hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-2.5 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gold-100 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-gold-600" />
              </div>
              <div className="min-w-0">
                <div className="text-lg sm:text-2xl font-black text-burgundy-900 truncate">{admin.overviewData.totalVotes.toLocaleString()}</div>
                <div className="text-xs sm:text-sm text-gray-500">Total Votes</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-5 hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-2.5 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </div>
              <div className="min-w-0">
                <div className="text-lg sm:text-2xl font-black text-burgundy-900 truncate">{admin.overviewData.totalTickets}</div>
                <div className="text-xs sm:text-sm text-gray-500">Ticket Sales</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-5 hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-2.5 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
              </div>
              <div className="min-w-0">
                <div className="text-lg sm:text-2xl font-black text-burgundy-900 truncate">{admin.contestantsList.length}</div>
                <div className="text-xs sm:text-sm text-gray-500">Participants</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-5 hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-2.5 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
              </div>
              <div className="min-w-0">
                <div className="text-lg sm:text-2xl font-black text-burgundy-900 truncate">{admin.categoriesList.length}</div>
                <div className="text-xs sm:text-sm text-gray-500">Categories</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <OverviewTab
            onAddContestant={admin.handleAddContestant}
            onAddCategory={admin.handleAddCategory}
            onExportCSV={admin.handleExportCSV}
            onAddManualVote={admin.handleAddManualVote}
          />
        )}

        {activeTab === 'results' && (
          <ResultsTab
            contestantsList={admin.contestantsList}
            categoriesList={admin.categoriesList}
            selectedCategory={admin.selectedCategory}
            onSelectCategory={admin.setSelectedCategory}
          />
        )}

        {activeTab === 'contestants' && (
          <ContestantsTab
            contestantsList={admin.contestantsList}
            categoriesList={admin.categoriesList}
            onAddContestant={admin.handleAddContestant}
            onEditContestant={admin.handleEditContestant}
            onDeleteContestant={admin.handleDeleteContestant}
          />
        )}

        {activeTab === 'votelog' && (
          <VoteLogTab
            voteLogList={admin.voteLogList}
            onAddManualVote={admin.handleAddManualVote}
            onExportVoteLog={admin.handleExportVoteLog}
            onVerifyPending={admin.handleVerifyPending}
          />
        )}

        {activeTab === 'revenue' && (
          <RevenueTab
            voteLogList={admin.voteLogList}
            packagesList={admin.packagesList}
            onSwitchTab={setActiveTab}
          />
        )}

        {activeTab === 'packages' && (
          <PackagesTab
            packagesList={admin.packagesList}
            onAddPackage={admin.handleAddPackage}
            onEditPackage={admin.handleEditPackage}
            onDeletePackage={admin.handleDeletePackage}
            onTogglePackage={admin.handleTogglePackage}
          />
        )}

        {activeTab === 'users' && (
          <UsersTab
            usersList={admin.usersList}
            onBanUser={admin.handleBanUser}
            onExportUsers={admin.handleExportUsers}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsTab
            categoriesList={admin.categoriesList}
            packagesList={admin.packagesList}
            votingActive={admin.votingActive}
            publicResults={admin.publicResults}
            eventFormData={admin.eventFormData}
            onSetVotingActive={admin.handleToggleVotingActive}
            onSetPublicResults={admin.handleTogglePublicResults}
            onEditEvent={admin.handleEditEvent}
            onAddCategory={admin.handleAddCategory}
            onEditCategory={admin.handleEditCategory}
            onDeleteCategory={admin.handleDeleteCategory}
            onResetVotes={admin.handleResetVotes}
            onExportCSV={admin.handleExportCSV}
            onSwitchTab={setActiveTab}
            onOpenModal={admin.handleOpenModal}
          />
        )}
      </div>

      {/* Modals */}
      <AdminModals
        showModal={admin.showModal}
        modalType={admin.modalType}
        onClose={admin.handleCloseModal}
        formData={admin.formData}
        setFormData={admin.setFormData}
        editingContestant={admin.editingContestant}
        onSaveContestant={admin.handleSaveContestant}
        fileInputRef={admin.fileInputRef}
        isDragging={admin.isDragging}
        isUploading={admin.isUploading}
        uploadProgress={admin.uploadProgress}
        onDragOver={admin.handleDragOver}
        onDragLeave={admin.handleDragLeave}
        onDrop={admin.handleDrop}
        onImageUpload={admin.handleImageUpload}
        categoryFormData={admin.categoryFormData}
        setCategoryFormData={admin.setCategoryFormData}
        editingCategory={admin.editingCategory}
        onSaveCategory={admin.handleSaveCategory}
        voteFormData={admin.voteFormData}
        setVoteFormData={admin.setVoteFormData}
        voteFormPackageId={admin.voteFormPackageId}
        setVoteFormPackageId={admin.setVoteFormPackageId}
        contestantsList={admin.contestantsList}
        categoriesList={admin.categoriesList}
        packagesList={admin.packagesList}
        onSaveManualVote={admin.handleSaveManualVote}
        eventFormData={admin.eventFormData}
        setEventFormData={admin.setEventFormData}
        onSaveEvent={admin.handleSaveEvent}
        packageFormData={admin.packageFormData}
        setPackageFormData={admin.setPackageFormData}
        editingPackage={admin.editingPackage}
        onSavePackage={admin.handleSavePackage}
        advancedSettings={admin.advancedSettings}
        setAdvancedSettings={admin.setAdvancedSettings}
      />
    </div>
  )
}
