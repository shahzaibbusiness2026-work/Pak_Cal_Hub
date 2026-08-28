'use client';

import React, { useState, useEffect } from 'react';
import {
  Database,
  ShieldCheck,
  Fuel,
  Coins,
  Building2,
  Receipt,
  Zap,
  RefreshCw,
  Save,
  CheckCircle2,
  AlertCircle,
  Edit2,
  TrendingUp,
  Server,
  Activity,
  Bell,
  Check,
  X,
  Clock,
  Radio,
  KeyRound,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { formatPKR } from '../../lib/utils/formatters';

interface MarketRate {
  id?: string;
  key: string;
  category: string;
  label: string;
  value: number;
  unit: string;
  updatedAt?: string;
  updatedBy?: string;
  notes?: string;
}

interface DatabaseStatus {
  connected: boolean;
  driver: string;
  host: string;
  reason?: string;
  hasPlaceholder?: boolean;
  counts: {
    marketRates: number;
    salaryScales: number;
    taxSlabs: number;
    pensionRules: number;
  };
  fallbackActive: boolean;
  error?: string;
}

interface SyncLog {
  id: string;
  type: string;
  status: string;
  oldValue?: string;
  newValue?: string;
  message: string;
  source?: string;
  createdAt: string;
}

interface GovtDraft {
  id: string;
  government: string;
  year: string;
  title: string;
  notificationNo: string;
  effectiveDate: string;
  status: string;
  detectedAt: string;
}

interface SystemNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export default function AdminDashboardPage() {
  const [secretKey] = useState('pakcalc2026');
  const [dbStatus, setDbStatus] = useState<DatabaseStatus | null>(null);
  const [rates, setRates] = useState<MarketRate[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<number>(0);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [seedStatus, setSeedStatus] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'rates' | 'automation' | 'salary' | 'tax' | 'status'>('rates');

  // Supabase quick connect password state
  const [dbPasswordInput, setDbPasswordInput] = useState('');
  const [connectingDb, setConnectingDb] = useState(false);
  const [connectMessage, setConnectMessage] = useState<{ text: string; isError: boolean } | null>(null);

  // Automation state
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([]);
  const [govtDrafts, setGovtDrafts] = useState<GovtDraft[]>([]);
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [automationStats, setAutomationStats] = useState<any>(null);
  const [syncInProgress, setSyncInProgress] = useState<string | null>(null);

  // Load Status and Rates
  const loadData = async () => {
    setLoading(true);
    try {
      const [healthRes, ratesRes, autoRes] = await Promise.all([
        fetch('/api/admin/health'),
        fetch('/api/admin/rates'),
        fetch('/api/admin/automation'),
      ]);

      if (healthRes.ok) {
        const healthData = await healthRes.json();
        setDbStatus(healthData);
      }

      if (ratesRes.ok) {
        const ratesData = await ratesRes.json();
        if (ratesData.success && ratesData.rates) {
          setRates(ratesData.rates);
        }
      }

      if (autoRes.ok) {
        const autoData = await autoRes.json();
        if (autoData.success) {
          setSyncLogs(autoData.logs || []);
          setGovtDrafts(autoData.drafts || []);
          setNotifications(autoData.notifications || []);
          setAutomationStats(autoData.stats);
        }
      }
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleConnectSupabase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dbPasswordInput.trim()) {
      setConnectMessage({ text: 'Please enter your Supabase database password.', isError: true });
      return;
    }

    setConnectingDb(true);
    setConnectMessage(null);
    try {
      const res = await fetch('/api/admin/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: dbPasswordInput.trim(), secretKey }),
      });

      const data = await res.json();
      if (data.success) {
        setConnectMessage({ text: data.message, isError: false });
        setDbPasswordInput('');
        loadData();
      } else {
        setConnectMessage({ text: data.error || 'Connection failed', isError: true });
      }
    } catch (err: any) {
      setConnectMessage({ text: err.message, isError: true });
    } finally {
      setConnectingDb(false);
    }
  };

  const handleSaveRate = async (rate: MarketRate) => {
    setSaveStatus('Saving...');
    try {
      const res = await fetch('/api/admin/rates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: rate.key,
          value: Number(editValue),
          label: rate.label,
          unit: rate.unit,
          category: rate.category,
          secretKey,
          adminUser: 'Admin Portal',
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSaveStatus(`Saved ${rate.label} = ${editValue} ${rate.unit}`);
        setEditingKey(null);
        loadData();
      } else {
        setSaveStatus(`Error: ${data.error}`);
      }
    } catch (err: any) {
      setSaveStatus(`Error: ${err.message}`);
    }
    setTimeout(() => setSaveStatus(null), 4000);
  };

  const handleTriggerSync = async (service: string) => {
    setSyncInProgress(service);
    try {
      const res = await fetch('/api/admin/automation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'TRIGGER_SYNC', service, secretKey, adminUser: 'Admin Portal' }),
      });
      const data = await res.json();
      if (data.success) {
        setSaveStatus(`Live sync completed for ${service.toUpperCase()}`);
        loadData();
      }
    } catch (err: any) {
      setSaveStatus(`Sync Error: ${err.message}`);
    } finally {
      setSyncInProgress(null);
      setTimeout(() => setSaveStatus(null), 4000);
    }
  };

  const handleApproveDraft = async (draftId: string) => {
    try {
      const res = await fetch('/api/admin/automation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'APPROVE_GOVT_DRAFT', draftId, secretKey }),
      });
      const data = await res.json();
      if (data.success) {
        setSaveStatus('Government Gazette draft approved and published successfully!');
        loadData();
      }
    } catch (e) {}
  };

  const handleRejectDraft = async (draftId: string) => {
    try {
      const res = await fetch('/api/admin/automation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'REJECT_GOVT_DRAFT', draftId, secretKey }),
      });
      const data = await res.json();
      if (data.success) {
        setSaveStatus('Draft rejected.');
        loadData();
      }
    } catch (e) {}
  };

  const handleDismissNotification = async (notificationId: string) => {
    try {
      await fetch('/api/admin/automation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'DISMISS_NOTIFICATION', notificationId, secretKey }),
      });
      loadData();
    } catch (e) {}
  };

  const handleSeedDatabase = async () => {
    if (!confirm('This will seed/refresh all default master tables in Supabase PostgreSQL. Continue?')) {
      return;
    }
    setSeedStatus('Seeding database in progress...');
    try {
      const res = await fetch('/api/admin/seed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secretKey }),
      });
      const data = await res.json();
      if (data.success) {
        setSeedStatus('Success: Database seeded successfully with all tables!');
        loadData();
      } else {
        setSeedStatus(`Seed Failed: ${data.error}`);
      }
    } catch (err: any) {
      setSeedStatus(`Error: ${err.message}`);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-6 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="rounded-md bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center gap-1">
              <Database className="h-3.5 w-3.5" />
              Supabase PostgreSQL Control Center
            </span>
            <span className="text-xs text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md font-mono flex items-center gap-1">
              <Radio className="h-3 w-3 text-emerald-600 animate-pulse" />
              Live Data &amp; Cron Pipeline
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Admin Database &amp; Automation Control
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            Manage live market rates, fuel price feeds, government civil service pay tables, and automated sync jobs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Status</span>
          </button>

          <button
            onClick={handleSeedDatabase}
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-700 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-800"
          >
            <Database className="h-3.5 w-3.5" />
            <span>1-Click Database Seed</span>
          </button>
        </div>
      </div>

      {/* Database Quick-Connect Banner (If not yet connected) */}
      {!dbStatus?.connected && (
        <div className="rounded-2xl border border-amber-300 bg-gradient-to-r from-amber-50 to-orange-50 p-6 dark:border-amber-900/60 dark:from-amber-950/40 dark:to-orange-950/20 shadow-xs space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300">
                <KeyRound className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  Connect Supabase PostgreSQL Database
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                  Host: <code className="font-mono font-bold text-amber-900 dark:text-amber-300">aws-0-ap-northeast-2.pooler.supabase.com</code> (Project ID: <code>pwurutzomtjwaansduup</code>)
                </p>
                {dbStatus?.reason && (
                  <p className="text-xs text-amber-800 dark:text-amber-400 font-semibold mt-1">
                    Current Diagnosis: {dbStatus.reason}
                  </p>
                )}
              </div>
            </div>
          </div>

          <form onSubmit={handleConnectSupabase} className="flex flex-col sm:flex-row gap-3 pt-1">
            <input
              type="password"
              value={dbPasswordInput}
              onChange={(e) => setDbPasswordInput(e.target.value)}
              placeholder="Paste your Supabase database password here..."
              className="flex-1 rounded-xl border border-amber-300 bg-white px-4 py-2.5 text-xs sm:text-sm font-medium text-slate-900 shadow-xs focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
            <button
              type="submit"
              disabled={connectingDb}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white px-5 py-2.5 text-xs font-bold shadow-xs shrink-0 disabled:opacity-50"
            >
              {connectingDb ? <RefreshCw className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              <span>{connectingDb ? 'Testing Connection...' : 'Connect & Test Database'}</span>
            </button>
          </form>

          {connectMessage && (
            <div className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${connectMessage.isError ? 'bg-red-100 text-red-800 border border-red-200' : 'bg-emerald-100 text-emerald-800 border border-emerald-200'}`}>
              {connectMessage.isError ? <AlertCircle className="h-4 w-4 shrink-0" /> : <CheckCircle2 className="h-4 w-4 shrink-0" />}
              <span>{connectMessage.text}</span>
            </div>
          )}
        </div>
      )}

      {/* Notifications Alert Banner */}
      {notifications.filter((n) => !n.isRead).length > 0 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4 dark:border-amber-900/50 dark:bg-amber-950/30 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-amber-900 dark:text-amber-300">
            <span className="flex items-center gap-1.5">
              <Bell className="h-4 w-4" />
              Active System Notifications ({notifications.filter((n) => !n.isRead).length})
            </span>
          </div>
          <div className="space-y-1.5">
            {notifications.filter((n) => !n.isRead).slice(0, 3).map((n) => (
              <div key={n.id} className="flex items-center justify-between text-xs text-amber-800 dark:text-amber-200 bg-white/70 dark:bg-slate-900/60 p-2.5 rounded-xl">
                <div>
                  <span className="font-bold">{n.title}: </span>
                  <span>{n.message}</span>
                </div>
                <button
                  onClick={() => handleDismissNotification(n.id)}
                  className="text-[11px] font-semibold text-amber-700 hover:text-amber-900 ml-2"
                >
                  Dismiss
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Database Connection Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 flex items-center gap-4">
          <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${dbStatus?.connected ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'}`}>
            <Server className="h-6 w-6" />
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Database Status</div>
            <div className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5 mt-0.5">
              {dbStatus?.connected ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span className="text-emerald-700 dark:text-emerald-400">Supabase PostgreSQL Connected</span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  <span>Hybrid Fallback Active</span>
                </>
              )}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              {dbStatus?.connected ? 'Pooler Port 6543 (ap-northeast-2)' : 'Local JSON Data System'}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Live Syncs Executed</div>
          <div className="text-2xl font-black font-mono text-slate-900 dark:text-white mt-1 tabular-nums">
            {automationStats?.totalSyncs || syncLogs.length} Syncs
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
            {automationStats?.successfulSyncs || syncLogs.filter((l) => l.status === 'SUCCESS').length} Successful updates
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Pending Govt Approvals</div>
          <div className="text-2xl font-black font-mono text-slate-900 dark:text-white mt-1 tabular-nums">
            {automationStats?.pendingDrafts || govtDrafts.filter((d) => d.status === 'PENDING_REVIEW').length} Drafts
          </div>
          <div className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold mt-1">
            Human-in-the-loop verification
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Active Market Rates</div>
          <div className="text-2xl font-black font-mono text-slate-900 dark:text-white mt-1 tabular-nums">
            {rates.length > 0 ? rates.length : dbStatus?.counts.marketRates || 17} Items
          </div>
          <div className="text-[11px] text-purple-600 dark:text-purple-400 font-semibold mt-1">
            Petrol, Gold, SBP Forex
          </div>
        </div>
      </div>

      {seedStatus && (
        <div className={`p-4 rounded-xl text-xs font-semibold flex items-center gap-2 ${seedStatus.includes('Success') ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-amber-50 text-amber-800 border border-amber-200'}`}>
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{seedStatus}</span>
        </div>
      )}

      {saveStatus && (
        <div className="p-4 rounded-xl text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-blue-600" />
          <span>{saveStatus}</span>
        </div>
      )}

      {/* Main Open Dashboard Content */}
      <div className="space-y-6">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3 dark:border-slate-800">
          <button
            onClick={() => setActiveTab('rates')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'rates'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-300'
            }`}
          >
            <Fuel className="h-3.5 w-3.5" />
            <span>Fuel &amp; Market Rates</span>
          </button>

          <button
            onClick={() => setActiveTab('automation')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'automation'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-300'
            }`}
          >
            <Activity className="h-3.5 w-3.5" />
            <span>Automation &amp; Data Pipeline</span>
          </button>

          <button
            onClick={() => setActiveTab('salary')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'salary'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-300'
            }`}
          >
            <Building2 className="h-3.5 w-3.5" />
            <span>Government BPS Scales</span>
          </button>

          <button
            onClick={() => setActiveTab('tax')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'tax'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-300'
            }`}
          >
            <Receipt className="h-3.5 w-3.5" />
            <span>FBR Tax Slabs</span>
          </button>

          <button
            onClick={() => setActiveTab('status')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'status'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-300'
            }`}
          >
            <Database className="h-3.5 w-3.5" />
            <span>Database Connection &amp; Instructions</span>
          </button>
        </div>

        {/* TAB 1: Fuel & Market Rates */}
        {activeTab === 'rates' && (
          <div className="rounded-2xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
            <div className="border-b border-slate-100 bg-slate-50/70 px-6 py-4 dark:border-slate-800 dark:bg-slate-800/50 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Fuel className="h-4 w-4 text-emerald-700" />
                  <span>Live Commodity &amp; Market Rates Manager</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">Click "Edit Rate" on any item to update prices across all website calculators immediately.</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                <thead className="border-b border-slate-100 bg-slate-50/40 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-800/30">
                  <tr>
                    <th className="px-6 py-3">Item / Commodity</th>
                    <th className="px-6 py-3">Category</th>
                    <th className="px-6 py-3">Current Price</th>
                    <th className="px-6 py-3">Unit</th>
                    <th className="px-6 py-3">Source &amp; Verification</th>
                    <th className="px-6 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {rates.map((rate) => {
                    const isEditing = editingKey === rate.key;
                    return (
                      <tr key={rate.key} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                        <td className="px-6 py-3.5 font-bold text-slate-900 dark:text-white">
                          {rate.label}
                          <span className="block text-[10px] font-mono text-slate-400 font-normal">{rate.key}</span>
                        </td>
                        <td className="px-6 py-3.5">
                          <span className="capitalize rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                            {rate.category}
                          </span>
                        </td>
                        <td className="px-6 py-3.5 font-bold font-mono text-slate-900 dark:text-white tabular-nums text-sm">
                          {isEditing ? (
                            <input
                              type="number"
                              step="0.01"
                              value={editValue}
                              onChange={(e) => setEditValue(parseFloat(e.target.value) || 0)}
                              className="w-28 rounded-lg border border-emerald-500 bg-white px-2 py-1 text-xs font-bold font-mono text-slate-900 dark:bg-slate-800 dark:text-white"
                              autoFocus
                            />
                          ) : (
                            formatPKR(rate.value)
                          )}
                        </td>
                        <td className="px-6 py-3.5 font-medium text-slate-500">{rate.unit}</td>
                        <td className="px-6 py-3.5 text-slate-500 max-w-xs truncate">{rate.notes || 'Official Feed Verified'}</td>
                        <td className="px-6 py-3.5 text-right">
                          {isEditing ? (
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleSaveRate(rate)}
                                className="inline-flex items-center gap-1 rounded-lg bg-emerald-700 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-emerald-800"
                              >
                                <Save className="h-3 w-3" />
                                <span>Save</span>
                              </button>
                              <button
                                onClick={() => setEditingKey(null)}
                                className="rounded-lg border border-slate-200 px-2.5 py-1 text-[11px] font-medium text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setEditingKey(rate.key);
                                setEditValue(rate.value);
                              }}
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-800 dark:text-emerald-400"
                            >
                              <Edit2 className="h-3 w-3" />
                              <span>Edit Rate</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: Automation & Data Pipeline */}
        {activeTab === 'automation' && (
          <div className="space-y-6">
            {/* Pipeline Trigger Bar */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Activity className="h-4 w-4 text-emerald-700" />
                    <span>Live Scheduled Synchronization Pipelines</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">Automated by Vercel Cron. You can also trigger manual updates instantly below.</p>
                </div>
                <div className="text-xs text-slate-500 flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  <span>Last Sync: {automationStats?.lastSyncTime ? new Date(automationStats.lastSyncTime).toLocaleTimeString() : 'Recent'}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
                <button
                  onClick={() => handleTriggerSync('fuel')}
                  disabled={Boolean(syncInProgress)}
                  className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-500 transition-all text-xs font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <Fuel className="h-5 w-5 text-emerald-700 mb-1" />
                  <span>Sync Fuel Prices</span>
                  <span className="text-[10px] text-slate-400 font-normal mt-0.5">OGRA RON-92/HSD</span>
                </button>

                <button
                  onClick={() => handleTriggerSync('gold')}
                  disabled={Boolean(syncInProgress)}
                  className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-500 transition-all text-xs font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <Coins className="h-5 w-5 text-amber-600 mb-1" />
                  <span>Sync Gold Rates</span>
                  <span className="text-[10px] text-slate-400 font-normal mt-0.5">Sarafa 24K / 22K</span>
                </button>

                <button
                  onClick={() => handleTriggerSync('currency')}
                  disabled={Boolean(syncInProgress)}
                  className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-500 transition-all text-xs font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <TrendingUp className="h-5 w-5 text-blue-600 mb-1" />
                  <span>Sync Currencies</span>
                  <span className="text-[10px] text-slate-400 font-normal mt-0.5">SBP Interbank Closing</span>
                </button>

                <button
                  onClick={() => handleTriggerSync('electricity')}
                  disabled={Boolean(syncInProgress)}
                  className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-500 transition-all text-xs font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <Zap className="h-5 w-5 text-purple-600 mb-1" />
                  <span>Sync Electricity</span>
                  <span className="text-[10px] text-slate-400 font-normal mt-0.5">NEPRA National Tariff</span>
                </button>

                <button
                  onClick={() => handleTriggerSync('all')}
                  disabled={Boolean(syncInProgress)}
                  className="flex flex-col items-center justify-center p-3 rounded-xl bg-emerald-700 text-white hover:bg-emerald-800 transition-all text-xs font-bold shadow-xs"
                >
                  <RefreshCw className={`h-5 w-5 mb-1 ${syncInProgress ? 'animate-spin' : ''}`} />
                  <span>Sync All Pipelines</span>
                  <span className="text-[10px] text-emerald-200 font-normal mt-0.5">Master Trigger</span>
                </button>
              </div>
            </div>

            {/* Government Notification Review & Approval Panel */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-blue-600" />
                    <span>Civil Service Gazette Review &amp; Approval Workflow</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Government salary &amp; pension gazettes are staged in <code>PENDING_REVIEW</code> status to prevent unverified rate changes.
                  </p>
                </div>
              </div>

              {govtDrafts.length === 0 ? (
                <div className="p-4 rounded-xl bg-slate-50 text-xs text-slate-500 dark:bg-slate-800 text-center">
                  No pending government drafts awaiting review.
                </div>
              ) : (
                <div className="space-y-3">
                  {govtDrafts.map((draft) => (
                    <div key={draft.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">{draft.title}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${draft.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' : draft.status === 'REJECTED' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'}`}>
                            {draft.status}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-1 flex flex-wrap items-center gap-3">
                          <span>OM: {draft.notificationNo}</span>
                          <span>Govt: {draft.government.toUpperCase()}</span>
                          <span>Effective: {draft.effectiveDate}</span>
                          <span>Detected: {new Date(draft.detectedAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {draft.status === 'PENDING_REVIEW' && (
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => handleApproveDraft(draft.id)}
                            className="inline-flex items-center gap-1 bg-emerald-700 hover:bg-emerald-800 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-xs"
                          >
                            <Check className="h-3.5 w-3.5" />
                            <span>Approve &amp; Publish</span>
                          </button>
                          <button
                            onClick={() => handleRejectDraft(draft.id)}
                            className="inline-flex items-center gap-1 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300"
                          >
                            <X className="h-3.5 w-3.5" />
                            <span>Reject</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Real-time Sync Logs Table */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
              <div className="border-b border-slate-100 bg-slate-50/70 px-6 py-4 dark:border-slate-800 dark:bg-slate-800/50">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  Live Data Pipeline Audit Logs (Last 20 Executions)
                </h2>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                  <thead className="border-b border-slate-100 bg-slate-50/40 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-800/30">
                    <tr>
                      <th className="px-6 py-3">Timestamp</th>
                      <th className="px-6 py-3">Service</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3">Old Value ➔ New Value</th>
                      <th className="px-6 py-3">Sync Message</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {syncLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 font-mono text-[11px]">
                        <td className="px-6 py-3 text-slate-400 whitespace-nowrap">
                          {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </td>
                        <td className="px-6 py-3 uppercase font-bold text-slate-800 dark:text-slate-200">
                          {log.type}
                        </td>
                        <td className="px-6 py-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${log.status === 'SUCCESS' ? 'bg-emerald-100 text-emerald-800' : log.status === 'PENDING_REVIEW' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'}`}>
                            {log.status}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-slate-500 whitespace-nowrap">
                          {log.oldValue && log.newValue ? `${log.oldValue} ➔ ${log.newValue}` : '—'}
                        </td>
                        <td className="px-6 py-3 text-slate-600 dark:text-slate-300 font-sans text-xs">
                          {log.message}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Government BPS Scales */}
        {activeTab === 'salary' && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="h-5 w-5 text-emerald-700" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Government Civil Servants BPS Pay Scale Matrix
              </h2>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              The database stores all 15 government salary scale combinations covering <strong>Federal, Punjab, Sindh, KPK, and Balochistan</strong> across <strong>2024-25, 2025-26, and 2026-27 (RBPS-2026)</strong>.
            </p>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-600 dark:text-slate-300 space-y-2 font-mono">
              <div>✓ Model: GovernmentSalaryScale (Federal, Punjab, Sindh, KPK, Balochistan)</div>
              <div>✓ Model: BpsScale (BPS 1 to 22 minPay, increment, maxPay, frozen HRA, conveyance, medical)</div>
              <div>✓ Model: AdhocRelief (7% ARA-2026, 25% ARA-2024, Special Allowances / DRA)</div>
            </div>
          </div>
        )}

        {/* TAB 4: FBR Tax Slabs */}
        {activeTab === 'tax' && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Receipt className="h-5 w-5 text-red-600" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Federal Board of Revenue (FBR) Tax Brackets
              </h2>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Stored under the <code>TaxSlab</code> table for Salaried and Non-Salaried individuals across <strong>Tax Year 2027 (Finance Act 2026)</strong>, <strong>Tax Year 2026</strong>, and <strong>Tax Year 2025</strong>.
            </p>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-600 dark:text-slate-300 space-y-1.5 font-mono">
              <div>• TY 2027 Slab 1: Rs. 0 - 600,000 (0% Exempt)</div>
              <div>• TY 2027 Slab 2: Rs. 600,000 - 1,200,000 (1% on excess)</div>
              <div>• TY 2027 Slab 3: Rs. 1,200,000 - 2,200,000 (Rs. 6,000 + 11%)</div>
              <div>• TY 2027 Slab 4: Rs. 2,200,000 - 3,200,000 (Rs. 116,000 + 23%)</div>
              <div>• TY 2027 Slab 5: Rs. 3,200,000 - 4,100,000 (Rs. 346,000 + 30%)</div>
              <div>• TY 2027 Slab 6: Rs. 4,100,000+ (Rs. 616,000 + 35%)</div>
            </div>
          </div>
        )}

        {/* TAB 5: Database Connection & Instructions */}
        {activeTab === 'status' && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-6">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Database className="h-5 w-5 text-emerald-700" />
                <span>Supabase PostgreSQL Integration Guide</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">Your Supabase Project ID: <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-emerald-700 font-bold">pwurutzomtjwaansduup</code> (Region: <code>ap-northeast-2</code>)</p>
            </div>

            <div className="space-y-4 text-xs text-slate-600 dark:text-slate-300">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 space-y-2">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">Option A: Quick Connect in Dashboard</h3>
                <p>Scroll to the top of this page, paste your Supabase password into the connection box, and click <strong>"Connect &amp; Test Database"</strong>.</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 space-y-2">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">Option B: Manual .env Configuration</h3>
                <p>Open <code>.env</code> in your project root and paste your database password in place of <code>[YOUR-PASSWORD]</code>:</p>
                <pre className="p-3 rounded-lg bg-slate-900 text-emerald-400 font-mono text-[11px] overflow-x-auto">
DATABASE_URL="postgresql://postgres.pwurutzomtjwaansduup:[YOUR-PASSWORD]@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.pwurutzomtjwaansduup:[YOUR-PASSWORD]@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres"
                </pre>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 space-y-2">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">Create Tables &amp; Seed</h3>
                <p>After saving the password, click the <strong>"1-Click Database Seed"</strong> button at the top to populate all tables!</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
