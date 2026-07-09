'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { getUser, logout } from '@/lib/utils';
import { ScheduleCalendar } from '@/components/schedule-calendar';

export default function EscalaPage() {
  const router = useRouter();
  const user = getUser();
  const [stores, setStores] = useState<any[]>([]);
  const [selectedStoreId, setSelectedStoreId] = useState<string>('');
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddEmployee, setShowAddEmployee] = useState(false);

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
      if (response.data.length > 0) {
        setSelectedStoreId(response.data[0].id);
      }
    } catch (err) {
      console.error('Error loading stores:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (selectedStoreId) {
      api.get(`/api/employees?storeId=${selectedStoreId}`).then((res) => {
        setEmployees(res.data);
      }).catch(console.error);
    }
  }, [selectedStoreId]);

  async function handleAddEmployee(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    try {
      await api.post('/api/employees', {
        matricula: form.get('matricula'),
        name: form.get('name'),
        level: parseInt(form.get('level') as string),
        storeId: selectedStoreId,
      });
      setShowAddEmployee(false);
      const res = await api.get(`/api/employees?storeId=${selectedStoreId}`);
      setEmployees(res.data);
    } catch (err) {
      console.error('Error adding employee:', err);
    }
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
              <span className="text-sm text-gray-500">Escala</span>
            </div>
            <div className="flex items-center gap-4">
              {user?.level >= 3 && (
                <>
                  <a href="/admin/dashboard" className="text-sm text-blue-600 hover:text-blue-800">
                    Dashboard
                  </a>
                  <a href="/admin/stores/new" className="text-sm text-blue-600 hover:text-blue-800">
                    Configurar Loja
                  </a>
                </>
              )}
              <span className="text-sm text-gray-500">{user?.name}</span>
              <button onClick={logout} className="text-sm text-red-600 hover:text-red-800">
                Sair
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-4 mb-6 flex-wrap">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Loja
            </label>
            <select
              value={selectedStoreId}
              onChange={(e) => setSelectedStoreId(e.target.value)}
              className="px-3 py-2 border rounded-lg"
            >
              {stores.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1" />

          <button
            onClick={() => setShowAddEmployee(!showAddEmployee)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
          >
            {showAddEmployee ? 'Cancelar' : '+ Funcionario'}
          </button>
        </div>

        {showAddEmployee && (
          <form
            onSubmit={handleAddEmployee}
            className="bg-white rounded-lg shadow-sm border p-4 mb-6 flex items-end gap-4"
          >
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Matricula</label>
              <input name="matricula" required className="px-3 py-2 border rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Nome</label>
              <input name="name" required className="px-3 py-2 border rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Nivel</label>
              <select name="level" className="px-3 py-2 border rounded-lg text-sm">
                <option value="1">Fiscal</option>
                <option value="2">Assistente</option>
                <option value="3">Gerente</option>
              </select>
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
            >
              Adicionar
            </button>
          </form>
        )}

        {employees.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            <span className="text-sm text-gray-500 self-center">Funcionarios:</span>
            {employees.map((emp) => (
              <span
                key={emp.id}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
              >
                {emp.name}
              </span>
            ))}
          </div>
        )}

        {selectedStoreId && (
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <ScheduleCalendar storeId={selectedStoreId} />
          </div>
        )}
      </main>
    </div>
  );
}
