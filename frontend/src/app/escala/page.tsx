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
  const [store, setStore] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [empName, setEmpName] = useState('');
  const [empMatricula, setEmpMatricula] = useState('');
  const [empLevel, setEmpLevel] = useState(1);

  useEffect(() => {
    if (!user) { router.push('/login'); return; }
    loadStores();
  }, []);

  async function loadStores() {
    try {
      const res = await api.get('/api/stores');
      setStores(res.data);
      if (res.data.length > 0) {
        setSelectedStoreId(res.data[0].id);
        setStore(res.data[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (selectedStoreId) {
      api.get(`/api/employees?storeId=${selectedStoreId}`).then((r) => setEmployees(r.data)).catch(console.error);
      api.get(`/api/stores/${selectedStoreId}`).then((r) => setStore(r.data)).catch(console.error);
    }
  }, [selectedStoreId]);

  async function handleAddEmployee() {
    if (!empName || !empMatricula) return;
    try {
      await api.post('/api/employees', { matricula: empMatricula, name: empName, level: empLevel, storeId: selectedStoreId });
      setShowAddEmployee(false);
      setEmpName('');
      setEmpMatricula('');
      setEmpLevel(1);
      const res = await api.get(`/api/employees?storeId=${selectedStoreId}`);
      setEmployees(res.data);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao cadastrar');
    }
  }

  async function handleDeleteEmployee(id: string) {
    if (!confirm('Remover funcionario?')) return;
    try {
      await api.delete(`/api/employees/${id}`);
      setEmployees(employees.filter((e) => e.id !== id));
    } catch (err) {
      console.error(err);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600" />
      </div>
    );
  }

  const levelLabel = user?.level === 1 ? 'Fiscal' : user?.level === 2 ? 'Assistente' : 'Gerente';

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-gray-900">Neros</h1>
            <span className="text-sm text-gray-400">|</span>
            <span className="text-sm text-gray-600">Escala</span>
          </div>
          <div className="flex items-center gap-4">
            {user?.level >= 3 && (
              <>
                <a href="/admin/dashboard" className="text-sm font-medium text-gray-600 hover:text-gray-900">Dashboard</a>
                <a href="/admin/stores/new" className="text-sm font-medium text-gray-600 hover:text-gray-900">Lojas</a>
              </>
            )}
            <span className="text-sm text-gray-500">{user?.name} ({levelLabel})</span>
            <button onClick={logout} className="text-sm font-medium text-red-600 hover:text-red-800">Sair</button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-start gap-4 mb-6 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Loja</label>
            <select value={selectedStoreId} onChange={(e) => setSelectedStoreId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white">
              {stores.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          {store && (
            <div className="flex items-center gap-4 pt-5">
              <span className="text-xs text-gray-400">{store.numberOfCheckouts} caixas</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-gray-900">Funcionarios</h2>
                <button onClick={() => setShowAddEmployee(!showAddEmployee)}
                  className="text-xs font-medium text-blue-600 hover:text-blue-800">
                  {showAddEmployee ? 'Cancelar' : '+ Novo'}
                </button>
              </div>

              {showAddEmployee && (
                <div className="mb-3 p-3 bg-blue-50 rounded-lg space-y-2">
                  <input placeholder="Nome" value={empName} onChange={(e) => setEmpName(e.target.value)}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs" />
                  <input placeholder="Matricula" value={empMatricula} onChange={(e) => setEmpMatricula(e.target.value)}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs" />
                  <select value={empLevel} onChange={(e) => setEmpLevel(Number(e.target.value))}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs bg-white">
                    <option value={1}>Fiscal</option>
                    <option value={2}>Assistente</option>
                    <option value={3}>Gerente</option>
                  </select>
                  <button onClick={handleAddEmployee}
                    className="w-full py-1.5 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700">
                    Adicionar
                  </button>
                </div>
              )}

              <div className="space-y-1 max-h-80 overflow-y-auto">
                {employees.length === 0 && (
                  <p className="text-xs text-gray-400 text-center py-4">Nenhum funcionario</p>
                )}
                {employees.map((emp) => {
                  const badgeColor = emp.level === 1 ? 'bg-blue-100 text-blue-700' : emp.level === 2 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700';
                  const levelName = emp.level === 1 ? 'Fiscal' : emp.level === 2 ? 'Assist.' : 'Gerente';
                  return (
                    <div key={emp.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 group">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${badgeColor}`}>
                          {levelName}
                        </span>
                        <span className="text-sm text-gray-900 truncate">{emp.name}</span>
                      </div>
                      <button onClick={() => handleDeleteEmployee(emp.id)}
                        className="text-xs text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity">
                        X
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <ScheduleCalendar
                storeId={selectedStoreId}
                employees={employees}
                onRefresh={() => {
                  api.get(`/api/employees?storeId=${selectedStoreId}`).then((r) => setEmployees(r.data)).catch(console.error);
                }}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
