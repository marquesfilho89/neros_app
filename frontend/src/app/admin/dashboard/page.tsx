'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { getUser, logout } from '@/lib/utils';
import { DashboardCharts } from '@/components/dashboard-charts';
import { ActivityFeed } from '@/components/activity-feed';

export default function AdminDashboardPage() {
  const router = useRouter();
  const user = getUser();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.level < 3) { router.push('/login'); return; }
    loadDashboard();
    const interval = setInterval(loadDashboard, 30000);
    return () => clearInterval(interval);
  }, []);

  async function loadDashboard() {
    try {
      const res = await api.get('/api/admin/dashboard-data');
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const levelLabel = 'Gerente';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600" />
      </div>
    );
  }

  const stats = [
    { label: 'Lojas', value: data?.stats?.totalStores || 0, color: 'bg-blue-500' },
    { label: 'Funcionarios', value: data?.stats?.totalEmployees || 0, color: 'bg-emerald-500' },
    { label: 'Alertas', value: data?.stats?.coverageAlertCount || 0, color: 'bg-orange-500' },
    { label: 'Trocas Pendentes', value: data?.stats?.pendingSwaps || 0, color: 'bg-purple-500' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-gray-900">Neros</h1>
            <span className="text-sm text-gray-400">|</span>
            <span className="text-sm text-gray-600">Dashboard</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="/escala" className="text-sm font-medium text-gray-600 hover:text-gray-900">Escala</a>
            <a href="/admin/stores/new" className="text-sm font-medium text-gray-600 hover:text-gray-900">Lojas</a>
            <span className="text-sm text-gray-500">{user?.name} ({levelLabel})</span>
            <button onClick={logout} className="text-sm font-medium text-red-600 hover:text-red-800">Sair</button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((s) => (
            <div key={s.label} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <div className="flex items-center gap-3">
                <div className={`w-2.5 h-2.5 rounded-full ${s.color}`} />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                  <p className="text-xs text-gray-500">{s.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {data?.hourlyDistribution && (
          <div className="mb-8">
            <DashboardCharts hourlyDistribution={data.hourlyDistribution} />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Alertas de Cobertura</h3>
            {data?.coverageAlerts?.length > 0 ? (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {data.coverageAlerts.map((alert: any, i: number) => (
                  <div key={i} className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium text-orange-900">{alert.storeName}</p>
                        <p className="text-xs text-orange-700 mt-0.5">
                          {new Date(alert.date).toLocaleDateString('pt-BR')} | {alert.peakStart}h - {alert.peakEnd}h
                        </p>
                      </div>
                      <span className="text-sm font-bold text-orange-600">{alert.coveragePercent}%</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400 text-center py-8">Nenhum alerta</p>
            )}
          </div>

          <ActivityFeed logs={data?.auditFeed || []} />
        </div>
      </main>
    </div>
  );
}
