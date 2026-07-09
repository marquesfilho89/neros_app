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
  const [store, setStore] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stores, setStores] = useState<any[]>([]);
  const [selectedStoreId, setSelectedStoreId] = useState<string>('');

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    loadStores();
  }, []);

  async function loadStores() {
    try {
      const response = await api.get('/api/stores');
      setStores(response.data);
      if (params.id !== 'new' && response.data.length > 0) {
        const found = response.data.find((s: any) => s.id === params.id);
        if (found) {
          setStore(found);
          setSelectedStoreId(found.id);
        }
      } else if (params.id === 'new' || response.data.length === 0) {
        setSelectedStoreId('');
      }
    } catch (err) {
      console.error('Error loading stores:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleStoreSelect(e: React.ChangeEvent<HTMLSelectElement>) {
    const id = e.target.value;
    setSelectedStoreId(id);
    if (id) {
      try {
        const response = await api.get(`/api/stores/${id}`);
        setStore(response.data);
      } catch (err) {
        console.error('Error loading store:', err);
      }
    } else {
      setStore(null);
    }
  }

  function handleSave() {
    loadStores();
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold text-gray-900">Neros</h1>
              <span className="text-sm text-gray-500">Configuracao da Loja</span>
            </div>
            <div className="flex items-center gap-4">
              <a href="/admin/dashboard" className="text-sm text-blue-600 hover:text-blue-800">
                Dashboard
              </a>
              <a href="/escala" className="text-sm text-blue-600 hover:text-blue-800">
                Escala
              </a>
              <span className="text-sm text-gray-500">{user?.name}</span>
              <button onClick={logout} className="text-sm text-red-600 hover:text-red-800">
                Sair
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Selecionar Loja
          </label>
          <div className="flex gap-3">
            <select
              value={selectedStoreId}
              onChange={handleStoreSelect}
              className="flex-1 px-3 py-2 border rounded-lg"
            >
              <option value="">Nova Loja</option>
              {stores.map((s: any) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s._count?.employees || 0} funcionarios)
                </option>
              ))}
            </select>
          </div>
        </div>

        <StoreConfigForm
          key={selectedStoreId || 'new'}
          store={store}
          onSave={handleSave}
        />
      </main>
    </div>
  );
}
