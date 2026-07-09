'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { api } from '@/lib/api';
import { useState, useEffect } from 'react';

interface ShiftItem {
  name: string;
  start: string;
  end: string;
}

interface PeakItem {
  start: string;
  end: string;
  minCoverage: number;
}

interface StoreFormData {
  name: string;
  address: string;
  numberOfCheckouts: number;
  shiftConfig: ShiftItem[];
  peakHours: PeakItem[];
}

interface Props {
  store?: any;
  onSave: (store: any) => void;
  onCancel?: () => void;
}

export function StoreConfigForm({ store, onSave, onCancel }: Props) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const { register, control, handleSubmit, reset } = useForm<StoreFormData>({
    defaultValues: getDefaults(store),
  });

  useEffect(() => {
    reset(getDefaults(store));
  }, [store, reset]);

  function getDefaults(s?: any): StoreFormData {
    return {
      name: s?.name || '',
      address: s?.address || '',
      numberOfCheckouts: s?.numberOfCheckouts || 1,
      shiftConfig: s?.shiftConfig?.length ? s.shiftConfig : [
        { name: 'Abertura', start: '08:00', end: '12:00' },
        { name: 'Almoco', start: '12:00', end: '14:00' },
        { name: 'Fechamento', start: '14:00', end: '18:00' },
      ],
      peakHours: s?.peakHours?.length ? s.peakHours : [
        { start: '12:00', end: '14:00', minCoverage: 80 },
      ],
    };
  }

  const { fields: shiftFields, append: appendShift, remove: removeShift } = useFieldArray({
    control, name: 'shiftConfig',
  });
  const { fields: peakFields, append: appendPeak, remove: removePeak } = useFieldArray({
    control, name: 'peakHours',
  });

  async function onSubmit(data: StoreFormData) {
    setSaving(true);
    setError('');
    try {
      const payload = {
        ...data,
        numberOfCheckouts: Number(data.numberOfCheckouts),
      };
      let res;
      if (store) {
        res = await api.put(`/api/stores/${store.id}`, payload);
      } else {
        res = await api.post('/api/stores', payload);
      }
      onSave(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message?.[0] || err.response?.data?.message || 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Dados da Loja</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Loja</label>
            <input {...register('name', { required: true })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Endereco</label>
            <input {...register('address')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Numero de Caixas</label>
            <input type="number" min={1}
              {...register('numberOfCheckouts', { required: true, min: 1, valueAsNumber: true })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Turnos</h3>
          <button type="button" onClick={() => appendShift({ name: '', start: '08:00', end: '12:00' })}
            className="px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100">
            + Adicionar Turno
          </button>
        </div>
        <div className="space-y-2">
          {shiftFields.map((field, index) => (
            <div key={field.id} className="flex items-center gap-2 bg-gray-50 p-3 rounded-lg">
              <input {...register(`shiftConfig.${index}.name`, { required: true })}
                placeholder="Nome" className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm" />
              <input type="time" {...register(`shiftConfig.${index}.start`, { required: true })}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
              <span className="text-gray-400 text-sm">ate</span>
              <input type="time" {...register(`shiftConfig.${index}.end`, { required: true })}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
              <button type="button" onClick={() => removeShift(index)}
                className="p-2 text-red-500 hover:bg-red-50 rounded-lg text-sm">Remover</button>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Horarios de Pico</h3>
          <button type="button" onClick={() => appendPeak({ start: '12:00', end: '14:00', minCoverage: 80 })}
            className="px-3 py-1.5 text-sm font-medium text-orange-600 bg-orange-50 rounded-lg hover:bg-orange-100">
            + Adicionar Pico
          </button>
        </div>
        <div className="space-y-2">
          {peakFields.map((field, index) => (
            <div key={field.id} className="flex items-center gap-2 bg-orange-50 p-3 rounded-lg">
              <input type="time" {...register(`peakHours.${index}.start`, { required: true })}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
              <span className="text-gray-400 text-sm">ate</span>
              <input type="time" {...register(`peakHours.${index}.end`, { required: true })}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
              <div className="flex items-center gap-1">
                <span className="text-sm text-gray-600">Min:</span>
                <input type="number" min={0} max={100}
                  {...register(`peakHours.${index}.minCoverage`, { required: true, min: 0, max: 100, valueAsNumber: true })}
                  className="w-16 px-2 py-2 border border-gray-300 rounded-lg text-sm" />
                <span className="text-sm text-gray-600">%</span>
              </div>
              <button type="button" onClick={() => removePeak(index)}
                className="p-2 text-red-500 hover:bg-red-50 rounded-lg text-sm">Remover</button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-end gap-3">
        {onCancel && (
          <button type="button" onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
            Cancelar
          </button>
        )}
        <button type="submit" disabled={saving}
          className="px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50">
          {saving ? 'Salvando...' : 'Salvar'}
        </button>
      </div>
    </form>
  );
}
