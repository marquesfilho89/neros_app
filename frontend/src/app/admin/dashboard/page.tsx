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
    if (!user || user.level < 3) {
      router.push('/login');
      return;
    }
    loadDashboard();
    const interval = setInterval(loadDashboard, 30000);
    return () => clearInterval(interval);
  }, []);

  async function loadDashboard() {
    try {
      const response = await api.get('/api/admin/dashboard-data');
      setData(response.data);
    } catch (err) {
      console.error('Error loading dashboard:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
      </div>
    );
  }

  const stats = [
    { label: 'Lojas', value: data?.stats?.totalStores || 0, color: 'bg-blue-500' },
    { label: 'Funcionarios Ativos', value: data?.stats?.totalEmployees || 0, color: 'bg-green-500' },
    { label: 'Alertas de Cobertura', value: data?.stats?.coverageAlertCount || 0, color: 'bg-orange-500' },
    { label: 'Trocas Pendentes', value: data?.stats?.pendingSwaps || 0, color: 'bg-purple-500' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold text-gray-900">Neros</h1>
              <span className="text-sm text-gray-500">Dashboard</span>
            </div>
            <div className="flex items-center gap-4">
              <a href="/escala" className="text-sm text-blue-600 hover:text-blue-800">
                Escala
              </a>
              <span className="text-sm text-gray-500">{user?.name}</span>
              <button
                onClick={logout}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center gap-4">
                <div className={`w-3 h-3 rounded-full ${stat.color}`} />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-500">{stat.label}</p>
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold mb-4">Alertas de Cobertura</h3>
            {data?.coverageAlerts?.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {data.coverageAlerts.map((alert: any, index: number) => (
                  <div key={index} className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-orange-900">{alert.storeName}</p>
                        <p className="text-sm text-orange-700">
                          {new Date(alert.date).toLocaleDateString('pt-BR')} | {alert.peakStart}h - {alert.peakEnd}h
                        </p>
                      </div>
                      <span className="text-sm font-bold text-orange-600">
                        {alert.coveragePercent}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-8">
                Nenhum alerta no momento
              </p>
            )}
          </div>

          <ActivityFeed logs={data?.auditFeed || []} />
        </div>
      </main>
    </div>
  );
}
