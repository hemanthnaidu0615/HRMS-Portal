import React, { useState, useEffect } from 'react';
import {
  Bell,
  Mail,
  Smartphone,
  Clock,
  Calendar,
  FileText,
  DollarSign,
  TrendingUp,
  Megaphone,
  Save,
  CheckCircle,
  Moon,
} from 'lucide-react';
import api from '../../utils/api';

interface NotificationPreference {
  id: string;
  notificationType: string;
  emailEnabled: boolean;
  inAppEnabled: boolean;
  smsEnabled: boolean;
  frequency: string;
  quietHoursStart?: string;
  quietHoursEnd?: string;
}

const NotificationPreferencesPage: React.FC = () => {
  const [preferences, setPreferences] = useState<NotificationPreference[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [globalSettings, setGlobalSettings] = useState({
    frequency: 'REALTIME',
    quietHoursStart: '22:00',
    quietHoursEnd: '08:00',
  });

  const notificationCategories = [
    {
      type: 'LEAVE_REQUEST',
      icon: <Calendar className="w-5 h-5" />,
      label: 'Leave Requests',
      description: 'Notifications about leave applications and approvals',
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
    },
    {
      type: 'TIMESHEET_APPROVAL',
      icon: <Clock className="w-5 h-5" />,
      label: 'Timesheet Approvals',
      description: 'Updates on timesheet submissions and approvals',
      color: 'text-orange-500',
      bgColor: 'bg-orange-50',
    },
    {
      type: 'PAYROLL_UPDATE',
      icon: <DollarSign className="w-5 h-5" />,
      label: 'Payroll Updates',
      description: 'Payslip generation and salary updates',
      color: 'text-green-500',
      bgColor: 'bg-green-50',
    },
    {
      type: 'PERFORMANCE_REVIEW',
      icon: <TrendingUp className="w-5 h-5" />,
      label: 'Performance Reviews',
      description: 'Performance evaluation and feedback notifications',
      color: 'text-purple-500',
      bgColor: 'bg-purple-50',
    },
    {
      type: 'SYSTEM_ANNOUNCEMENT',
      icon: <Megaphone className="w-5 h-5" />,
      label: 'System Announcements',
      description: 'Important announcements and updates',
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-50',
    },
    {
      type: 'DOCUMENT_REQUEST',
      icon: <FileText className="w-5 h-5" />,
      label: 'Document Requests',
      description: 'Document upload and approval notifications',
      color: 'text-pink-500',
      bgColor: 'bg-pink-50',
    },
  ];

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      setLoading(true);
      const response = await api.get('/notifications/preferences');
      setPreferences(response.data);

      // Set global settings from first preference if available
      if (response.data.length > 0) {
        const firstPref = response.data[0];
        if (firstPref.quietHoursStart || firstPref.quietHoursEnd) {
          setGlobalSettings({
            frequency: firstPref.frequency || 'REALTIME',
            quietHoursStart: firstPref.quietHoursStart || '22:00',
            quietHoursEnd: firstPref.quietHoursEnd || '08:00',
          });
        }
      }
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch preferences:', error);
      setLoading(false);
    }
  };

  const getPreference = (type: string): NotificationPreference => {
    const existing = preferences.find(p => p.notificationType === type);
    if (existing) return existing;

    return {
      id: '',
      notificationType: type,
      emailEnabled: true,
      inAppEnabled: true,
      smsEnabled: false,
      frequency: globalSettings.frequency,
      quietHoursStart: globalSettings.quietHoursStart,
      quietHoursEnd: globalSettings.quietHoursEnd,
    };
  };

  const updatePreference = (type: string, field: keyof NotificationPreference, value: any) => {
    setPreferences(prev => {
      const existing = prev.find(p => p.notificationType === type);
      if (existing) {
        return prev.map(p =>
          p.notificationType === type ? { ...p, [field]: value } : p
        );
      } else {
        return [
          ...prev,
          {
            id: '',
            notificationType: type,
            emailEnabled: true,
            inAppEnabled: true,
            smsEnabled: false,
            frequency: globalSettings.frequency,
            quietHoursStart: globalSettings.quietHoursStart,
            quietHoursEnd: globalSettings.quietHoursEnd,
            [field]: value,
          },
        ];
      }
    });
    setSaved(false);
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // Prepare preferences with global settings
      const prefsToSave = notificationCategories.map(cat => {
        const pref = getPreference(cat.type);
        return {
          notificationType: cat.type,
          emailEnabled: pref.emailEnabled,
          inAppEnabled: pref.inAppEnabled,
          smsEnabled: pref.smsEnabled,
          frequency: globalSettings.frequency,
          quietHoursStart: globalSettings.quietHoursStart,
          quietHoursEnd: globalSettings.quietHoursEnd,
        };
      });

      await api.put('/notifications/preferences/bulk', prefsToSave);
      setSaved(true);
      setSaving(false);

      // Refresh preferences
      fetchPreferences();

      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Failed to save preferences:', error);
      setSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Notification Preferences</h1>
        <p className="text-gray-600 mt-1">Customize how and when you receive notifications</p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* Global Settings */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Global Settings</h2>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Notification Frequency */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notification Frequency
                </label>
                <select
                  value={globalSettings.frequency}
                  onChange={e => {
                    setGlobalSettings({ ...globalSettings, frequency: e.target.value });
                    setSaved(false);
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="REALTIME">Real-time</option>
                  <option value="DAILY">Daily Digest</option>
                  <option value="WEEKLY">Weekly Summary</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  How often you want to receive notification emails
                </p>
              </div>

              {/* Quiet Hours */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Moon className="w-4 h-4" />
                  Quiet Hours
                </label>
                <div className="flex gap-2 items-center">
                  <input
                    type="time"
                    value={globalSettings.quietHoursStart}
                    onChange={e => {
                      setGlobalSettings({ ...globalSettings, quietHoursStart: e.target.value });
                      setSaved(false);
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <span className="text-gray-500">to</span>
                  <input
                    type="time"
                    value={globalSettings.quietHoursEnd}
                    onChange={e => {
                      setGlobalSettings({ ...globalSettings, quietHoursEnd: e.target.value });
                      setSaved(false);
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  No notifications will be sent during these hours
                </p>
              </div>
            </div>
          </div>

          {/* Notification Categories */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Notification Types</h2>
              <p className="text-sm text-gray-600 mt-1">
                Choose how you want to receive each type of notification
              </p>
            </div>

            <div className="divide-y divide-gray-200">
              {notificationCategories.map(category => {
                const pref = getPreference(category.type);
                return (
                  <div key={category.type} className="p-6">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 ${category.bgColor} rounded-lg flex items-center justify-center ${category.color}`}>
                        {category.icon}
                      </div>

                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{category.label}</h3>
                        <p className="text-sm text-gray-600 mt-1">{category.description}</p>

                        <div className="flex gap-6 mt-4">
                          {/* Email */}
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={pref.emailEnabled}
                              onChange={e =>
                                updatePreference(category.type, 'emailEnabled', e.target.checked)
                              }
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <Mail className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-700">Email</span>
                          </label>

                          {/* In-App */}
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={pref.inAppEnabled}
                              onChange={e =>
                                updatePreference(category.type, 'inAppEnabled', e.target.checked)
                              }
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <Bell className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-700">In-App</span>
                          </label>

                          {/* SMS (UI Only) */}
                          <label className="flex items-center gap-2 cursor-pointer opacity-50">
                            <input
                              type="checkbox"
                              checked={pref.smsEnabled}
                              onChange={e =>
                                updatePreference(category.type, 'smsEnabled', e.target.checked)
                              }
                              disabled
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <Smartphone className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-700">SMS (Coming Soon)</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Save Button */}
          <div className="mt-6 flex justify-end gap-3">
            {saved && (
              <div className="flex items-center gap-2 text-green-600 px-4 py-2">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">Preferences saved!</span>
              </div>
            )}
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Preferences'}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationPreferencesPage;
