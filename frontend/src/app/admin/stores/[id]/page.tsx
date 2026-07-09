'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { getUser, logout } from '@/lib/utils';
import { StoreConfigForm } from '@/components/store-config-form';

export default function StoreConfigPage() {
  const params = useParams();
  const router = useRouter();
  const user = getUser();
  const [stores, setStores] = useState<any[]>([]);
  const [store, setStore] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { router.push('/login'); return; }
    loadStores();
  }, []);

  async function loadStores() {
    try {
      const res = await api.get('/api/stores');
      setStores(res.data);
      if (params.id !== 'new') {
        const found = res.data.find((s: any) => s.id === params.id);
        setStore(found || null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function handleSave(saved: any) {
    if (store) {
      setStore(saved);
    } else {
      setStore(saved);
      setStores((prev) => {
        if (!prev.find((s) => s.id === saved.id)) return [...prev, saved];
        return prev;
      });
    }
  }

  const levelLabel = user?.level === 3 ? 'Gerente' : user?.level === 2 ? 'Assistente' : 'Fiscal';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-gray-900">Neros</h1>
            <span className="text-sm text-gray-400">|</span>
            <span className="text-sm text-gray-600">Configuracao</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="/admin/dashboard" className="text-sm font-medium text-gray-600 hover:text-gray-900">Dashboard</a>
            <a href="/escala" className="text-sm font-medium text-gray-600 hover:text-gray-900">Escala</a>
            <span className="text-sm text-gray-500">{user?.name} ({levelLabel})</span>
            <button onClick={logout} className="text-sm font-medium text-red-600 hover:text-red-800">Sair</button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center gap-3 mb-6">
          <select
            value={store?.id || ''}
            onChange={(e) => {
              const id = e.target.value;
              if (id) {
                const found = stores.find((s) => s.id === id);
                setStore(found);
              } else {
                setStore(null);
              }
            }}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
          >
            <option value="">Nova Loja</option>
            {stores.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s._count?.employees || 0} func.)
              </option>
            ))}
          </select>
        </div>

        <StoreConfigForm
          key={store?.id || 'new'}
          store={store}
          onSave={handleSave}
        />
      </main>
    </div>
  );
}
