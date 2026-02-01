import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  User, Mail, Building2, Bell, Moon, Sun, Globe, Shield,
  Download, Trash2, Key, CreditCard, Smartphone, Monitor,
  CheckCircle2, AlertCircle, Clock, ChevronRight
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const MotionDiv = motion.div as any;
const MotionButton = motion.button as any;

export const SettingsTab: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sms: false,
    weekly: true
  });

  const userInfo = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    company: 'Retail Ventures Inc.',
    role: 'Location Analyst',
    memberSince: 'January 2024',
    plan: 'Professional',
    usage: {
      analyses: 247,
      reports: 89,
      locations: 1429
    }
  };

  const systemInfo = {
    os: navigator.platform,
    browser: navigator.userAgent.split(' ').slice(-2).join(' '),
    screen: `${window.screen.width}x${window.screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    language: navigator.language
  };

  return (
    <div className="space-y-8">
      {/* User Profile Section */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-8 shadow-sm">
        <div className="flex items-center gap-6 mb-8">
          <MotionDiv
            whileHover={{ scale: 1.1, rotate: 5 }}
            className="w-20 h-20 bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-teal-500/30 cursor-pointer"
          >
            {userInfo.name.charAt(0)}
          </MotionDiv>
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-1 break-words">{userInfo.name}</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-2 break-words truncate">{userInfo.email}</p>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 bg-teal-100 dark:bg-teal-500/20 text-teal-700 dark:text-teal-400 rounded-lg text-xs font-bold whitespace-nowrap">
                {userInfo.plan}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 break-words">Member since {userInfo.memberSince}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-4">
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
              <User className="w-4 h-4" />
              Full Name
            </label>
            <input
              type="text"
              defaultValue={userInfo.name}
              className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
            />
          </div>
          <div className="space-y-4">
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email Address
            </label>
            <input
              type="email"
              defaultValue={userInfo.email}
              className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
            />
          </div>
          <div className="space-y-4">
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Company
            </label>
            <input
              type="text"
              defaultValue={userInfo.company}
              className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Usage Statistics */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-8 shadow-sm">
        <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6">Usage Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: 'Analyses Run', value: userInfo.usage.analyses, icon: Building2 },
            { label: 'Reports Generated', value: userInfo.usage.reports, icon: Download },
            { label: 'Locations Analyzed', value: userInfo.usage.locations, icon: Globe }
          ].map((stat, idx) => (
            <div key={stat.label} className="p-6 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-teal-100 dark:bg-teal-500/20 rounded-lg">
                  <stat.icon className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                </div>
                <div className="text-sm font-bold text-slate-600 dark:text-slate-400">{stat.label}</div>
              </div>
              <div className="text-3xl font-black text-slate-900 dark:text-white">{stat.value.toLocaleString()}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Preferences */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-8 shadow-sm">
        <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6">Preferences</h3>
        <div className="space-y-6">
          <div className="flex items-center justify-between py-4 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              {theme === 'light' ? <Sun className="w-5 h-5 text-slate-600 dark:text-slate-400" /> : <Moon className="w-5 h-5 text-slate-600 dark:text-slate-400" />}
              <div>
                <div className="font-bold text-slate-900 dark:text-white">Theme</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Current: {theme === 'light' ? 'Light' : 'Dark'}</div>
              </div>
            </div>
            <button
              onClick={toggleTheme}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors flex items-center gap-2 flex-shrink-0 whitespace-nowrap"
            >
              {theme === 'light' ? <Moon className="w-4 h-4 text-slate-700 dark:text-slate-300 flex-shrink-0" /> : <Sun className="w-4 h-4 text-slate-700 dark:text-slate-300 flex-shrink-0" />}
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Switch to {theme === 'light' ? 'Dark' : 'Light'}</span>
            </button>
          </div>

          {[
            { key: 'email', label: 'Email Notifications', desc: 'Receive updates via email' },
            { key: 'push', label: 'Push Notifications', desc: 'Browser push notifications' },
            { key: 'sms', label: 'SMS Alerts', desc: 'Text message updates' },
            { key: 'weekly', label: 'Weekly Digest', desc: 'Summary report every Monday' }
          ].map(pref => (
            <div key={pref.key} className="flex items-center justify-between py-4 border-b border-slate-200 dark:border-slate-700 last:border-0">
              <div>
                <div className="font-bold text-slate-900 dark:text-white">{pref.label}</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">{pref.desc}</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications[pref.key as keyof typeof notifications]}
                  onChange={(e) => setNotifications({ ...notifications, [pref.key]: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 dark:bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 dark:peer-focus:ring-teal-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* System Information */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-8 shadow-sm">
        <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2">
          <Monitor className="w-5 h-5 text-teal-600 dark:text-teal-400" />
          System Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { label: 'Operating System', value: systemInfo.os, icon: Monitor },
            { label: 'Browser', value: systemInfo.browser, icon: Globe },
            { label: 'Screen Resolution', value: systemInfo.screen, icon: Smartphone },
            { label: 'Timezone', value: systemInfo.timezone, icon: Clock },
            { label: 'Language', value: systemInfo.language, icon: Globe }
          ].map((info, idx) => (
            <div key={info.label} className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
              <info.icon className="w-5 h-5 text-slate-600 dark:text-slate-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1 break-words">{info.label}</div>
                <div className="text-sm font-semibold text-slate-900 dark:text-white break-words">{info.value}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Account Actions */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-8 shadow-sm">
        <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6">Account Management</h3>
        <div className="space-y-3">
          {[
            { label: 'Change Password', icon: Key, action: () => { } },
            { label: 'Export Account Data', icon: Download, action: () => { } },
            { label: 'Billing & Subscription', icon: CreditCard, action: () => { } },
            { label: 'Privacy Settings', icon: Shield, action: () => { } },
            { label: 'Delete Account', icon: Trash2, action: () => { }, danger: true }
          ].map((action, idx) => (
            <MotionButton
              key={action.label}
              onClick={action.action}
              whileHover={{ scale: 1.02, x: 4 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${action.danger
                  ? 'border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/20 text-red-700 dark:text-red-400'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-900 dark:text-white'
                }`}
            >
              <div className="flex items-center gap-3">
                <action.icon className={`w-5 h-5 ${action.danger ? 'text-red-600 dark:text-red-400' : 'text-slate-600 dark:text-slate-400'}`} />
                <span className="font-semibold">{action.label}</span>
              </div>
              <ChevronRight className="w-5 h-5 opacity-50" />
            </MotionButton>
          ))}
        </div>
      </div>
    </div>
  );
};
