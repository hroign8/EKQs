'use client'

import type { AdvancedSettings } from '../../types'

interface ToggleProps {
  label: string
  description: string
  checked: boolean
  onChange: () => void
  activeColor?: string
}

function Toggle({ label, description, checked, onChange, activeColor = 'bg-green-500' }: ToggleProps) {
  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
      <div>
        <div className="font-medium text-gray-900">{label}</div>
        <div className="text-sm text-gray-500">{description}</div>
      </div>
      <button
        onClick={onChange}
        aria-pressed={checked}
        aria-label={`${label}: ${checked ? 'on' : 'off'}`}
        className={`relative w-14 h-7 rounded-full transition-colors ${checked ? activeColor : 'bg-gray-300'}`}
      >
        <div className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-7' : 'translate-x-0.5'}`} />
      </button>
    </div>
  )
}

const INPUT_CLS = 'w-full px-4 py-3 bg-gray-50 rounded-xl focus:bg-white focus:ring-2 focus:ring-gold-500 outline-none transition-all'

interface AdvancedSettingsModalProps {
  advancedSettings: AdvancedSettings
  setAdvancedSettings: (settings: AdvancedSettings) => void
  onClose: () => void
}

export default function AdvancedSettingsModal({ advancedSettings, setAdvancedSettings, onClose }: AdvancedSettingsModalProps) {
  const set = (patch: Partial<AdvancedSettings>) => setAdvancedSettings({ ...advancedSettings, ...patch })

  return (
    <>
      <div className="p-6 space-y-6">
        <div>
          <h3 className="text-sm font-semibold text-burgundy-900 uppercase tracking-wide mb-4">System Status</h3>
          <div className="space-y-3">
            <Toggle
              label="Maintenance Mode"
              description="Disable public access temporarily"
              checked={advancedSettings.maintenanceMode}
              onChange={() => set({ maintenanceMode: !advancedSettings.maintenanceMode })}
              activeColor="bg-red-500"
            />
            <Toggle
              label="Debug Mode"
              description="Enable detailed error logging"
              checked={advancedSettings.debugMode}
              onChange={() => set({ debugMode: !advancedSettings.debugMode })}
              activeColor="bg-gold-500"
            />
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-burgundy-900 uppercase tracking-wide mb-4">Notifications</h3>
          <div className="space-y-3">
            <Toggle
              label="Email Notifications"
              description="Send alerts for new votes"
              checked={advancedSettings.emailNotifications}
              onChange={() => set({ emailNotifications: !advancedSettings.emailNotifications })}
            />
            <Toggle
              label="Auto Backup"
              description="Daily automatic data backup"
              checked={advancedSettings.autoBackup}
              onChange={() => set({ autoBackup: !advancedSettings.autoBackup })}
            />
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-burgundy-900 uppercase tracking-wide mb-4">Limits & Security</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Max Votes/User</label>
              <input
                type="number"
                value={advancedSettings.maxVotesPerUser}
                onChange={(e) => set({ maxVotesPerUser: e.target.value })}
                className={INPUT_CLS}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Session Timeout (min)</label>
              <input
                type="number"
                value={advancedSettings.sessionTimeout}
                onChange={(e) => set({ sessionTimeout: e.target.value })}
                className={INPUT_CLS}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">API Rate Limit/min</label>
              <input
                type="number"
                value={advancedSettings.apiRateLimit}
                onChange={(e) => set({ apiRateLimit: e.target.value })}
                className={INPUT_CLS}
              />
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-sm font-semibold text-red-600 uppercase tracking-wide mb-4">Danger Zone</h3>
          <div className="flex flex-wrap gap-3">
            <button className="px-4 py-2.5 bg-red-50 text-red-600 rounded-full font-medium hover:bg-red-100 transition-colors">
              Reset All Votes
            </button>
            <button className="px-4 py-2.5 bg-red-50 text-red-600 rounded-full font-medium hover:bg-red-100 transition-colors">
              Clear Vote Log
            </button>
            <button className="px-4 py-2.5 bg-red-50 text-red-600 rounded-full font-medium hover:bg-red-100 transition-colors">
              Factory Reset
            </button>
          </div>
        </div>
      </div>

      <div className="p-6 border-t border-gray-100 flex items-center justify-end space-x-3">
        <button onClick={onClose} className="px-6 py-3 bg-gray-100 rounded-full font-semibold hover:bg-gray-200 transition-colors">
          Cancel
        </button>
        <button
          onClick={onClose}
          className="px-6 py-3 bg-gold-500 text-burgundy-900 rounded-full font-semibold hover:bg-gold-400 transition-all duration-200 hover:scale-105"
        >
          Save Settings
        </button>
      </div>
    </>
  )
}
