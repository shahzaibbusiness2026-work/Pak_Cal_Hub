'use client';

import React, { useState, useEffect } from 'react';
import {
  Database,
  ShieldAlert,
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
  Lock,
  Unlock,
  Plus,
  Edit2,
  TrendingUp,
  Server,
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
  counts: {
    marketRates: number;
    salaryScales: number;
    taxSlabs: number;
    pensionRules: number;
  };
  fallbackActive: boolean;
  error?: string;
}

export default function AdminDashboardPage() {
  const [secretKey, setSecretKey] = useState('pakcalc2026');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState('');

  const [dbStatus, setDbStatus] = useState<DatabaseStatus | null>(null);
  const [rates, setRates] = useState<MarketRate[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<number>(0);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [seedStatus, setSeedStatus] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'rates' | 'salary' | 'tax' | 'electricity' | 'status'>('rates');

  // Load Status and Rates
  const loadData = async () => {
    setLoading(true);
    try {
      const [healthRes, ratesRes] = await Promise.all([
        fetch('/api/admin/health'),
        fetch('/api/admin/rates'),
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
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (secretKey === 'pakcalc2026' || secretKey.length >= 6) {
      setIsAuthenticated(true);
      setAuthError('');
    } else {
      setAuthError('Invalid Admin Key. Default key is "pakcalc2026".');
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

  const handleSeedDatabase = async () => {
    if (!confirm('This will seed/refresh all default master tables (Rates, BPS Scales, Tax Slabs, Pension) in Supabase. Continue?')) {
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
            <span className="text-xs text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md font-mono">
              Prisma ORM
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Admin Database Dashboard
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            Manage live market rates, fuel prices, government BPS salary tables, and FBR tax brackets without writing SQL.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
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

      {/* Database Connection Status Card */}
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
                  <span>PostgreSQL Connected</span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  <span>Hybrid Fallback Active</span>
                </>
              )}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              {dbStatus?.connected ? 'Supabase Connection Pooler' : 'Local JSON Data System'}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Market Commodity Rates</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {rates.length > 0 ? rates.length : dbStatus?.counts.marketRates || 14}
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
            Petrol, Diesel, Gold, Currencies
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Government Salary Scales</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            15 Scales (330 BPS Grades)
          </div>
          <div className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold mt-1">
            Federal + 4 Provinces (2024-2027)
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">FBR Tax Slabs</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            36 Tax Brackets
          </div>
          <div className="text-[11px] text-purple-600 dark:text-purple-400 font-semibold mt-1">
            TY 2027, TY 2026, TY 2025
          </div>
        </div>
      </div>

      {seedStatus && (
        <div className={`p-4 rounded-xl text-xs font-semibold flex items-center gap-2 ${seedStatus.includes('Success') ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-amber-50 text-amber-800 border border-amber-200'}`}>
          <InfoIcon className="h-4 w-4 shrink-0" />
          <span>{seedStatus}</span>
        </div>
      )}

      {saveStatus && (
        <div className="p-4 rounded-xl text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-blue-600" />
          <span>{saveStatus}</span>
        </div>
      )}

      {/* Admin Authentication Gate */}
      {!isAuthenticated ? (
        <div className="max-w-md mx-auto rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900 text-center space-y-5">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 mx-auto">
            <Lock className="h-7 w-7" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Admin Authentication Required</h2>
            <p className="text-xs text-slate-500 mt-1">Enter your Admin Secret Key to modify live database rates</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="password"
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
                placeholder="Enter ADMIN_SECRET_KEY (default: pakcalc2026)"
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-900 shadow-xs focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white text-center"
              />
              {authError && <p className="text-xs text-red-600 mt-1.5 font-medium">{authError}</p>}
            </div>
            <button
              type="submit"
              className="w-full rounded-xl bg-emerald-700 py-2.5 text-sm font-bold text-white shadow-xs hover:bg-emerald-800"
            >
              Unlock Admin Dashboard
            </button>
          </form>
        </div>
      ) : (
        /* Authenticated Control Panel */
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
              <span>Fuel & Market Rates</span>
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
              <span>Database Connection & Instructions</span>
            </button>
          </div>

          {/* TAB 1: Fuel & Market Rates */}
          {activeTab === 'rates' && (
            <div className="rounded-2xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
              <div className="border-b border-slate-100 bg-slate-50/70 px-6 py-4 dark:border-slate-800 dark:bg-slate-800/50 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Fuel className="h-4 w-4 text-emerald-700" />
                    <span>Live Commodity & Market Rates Manager</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">Click "Edit" on any item to update prices across all website calculators immediately.</p>
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
                      <th className="px-6 py-3">Source & Notes</th>
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
                          <td className="px-6 py-3.5 font-bold text-slate-900 dark:text-white">
                            {isEditing ? (
                              <input
                                type="number"
                                step="0.01"
                                value={editValue}
                                onChange={(e) => setEditValue(parseFloat(e.target.value) || 0)}
                                className="w-28 rounded-lg border border-emerald-500 bg-white px-2 py-1 text-xs font-bold text-slate-900 dark:bg-slate-800 dark:text-white"
                                autoFocus
                              />
                            ) : (
                              formatPKR(rate.value)
                            )}
                          </td>
                          <td className="px-6 py-3.5 font-medium text-slate-500">{rate.unit}</td>
                          <td className="px-6 py-3.5 text-slate-500 max-w-xs truncate">{rate.notes || '—'}</td>
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

          {/* TAB 2: Government BPS Scales */}
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

          {/* TAB 3: FBR Tax Slabs */}
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

          {/* TAB 4: Database Connection & Instructions */}
          {activeTab === 'status' && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-6">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Database className="h-5 w-5 text-emerald-700" />
                  <span>Supabase PostgreSQL Integration Guide</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">Your Supabase Project ID: <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-emerald-700 font-bold">pwurutzomtjwaansduup</code></p>
              </div>

              <div className="space-y-4 text-xs text-slate-600 dark:text-slate-300">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 space-y-2">
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">Step 1: Set your Database Password in .env</h3>
                  <p>Open <code>.env</code> in your root directory and replace <code>[YOUR-PASSWORD]</code> with your actual Supabase database password:</p>
                  <pre className="p-3 rounded-lg bg-slate-900 text-emerald-400 font-mono text-[11px] overflow-x-auto">
DATABASE_URL="postgresql://postgres.pwurutzomtjwaansduup:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.pwurutzomtjwaansduup:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"
                  </pre>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 space-y-2">
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">Step 2: Push the Database Schema to Supabase</h3>
                  <p>In your terminal, run this single command to create all 9 tables automatically:</p>
                  <pre className="p-3 rounded-lg bg-slate-900 text-emerald-400 font-mono text-[11px]">
npx prisma db push
                  </pre>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 space-y-2">
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">Step 3: Seed All Initial Data</h3>
                  <p>Click the <strong>"1-Click Database Seed"</strong> button at the top of this dashboard, or run in terminal:</p>
                  <pre className="p-3 rounded-lg bg-slate-900 text-emerald-400 font-mono text-[11px]">
npm run db:seed
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function InfoIcon(props: any) {
  return <AlertCircle {...props} />;
}
