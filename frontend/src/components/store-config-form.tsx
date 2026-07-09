'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { api } from '@/lib/api';
import { useState } from 'react';

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
  onSave: () => void;
}

export function StoreConfigForm({ store, onSave }: Props) {
  const [saving, setSaving] = useState(false);

  const { register, control, handleSubmit, formState: { errors } } = useForm<StoreFormData>({
    defaultValues: {
      name: store?.name || '',
      address: store?.address || '',
      numberOfCheckouts: store?.numberOfCheckouts || 1,
      shiftConfig: store?.shiftConfig || [
        { name: 'Abertura', start: '08:00', end: '12:00' },
        { name: 'Almoco', start: '12:00', end: '14:00' },
        { name: 'Fechamento', start: '14:00', end: '18:00' },
      ],
      peakHours: store?.peakHours || [
        { start: '12:00', end: '14:00', minCoverage: 80 },
      ],
    },
  });

  const { fields: shiftFields, append: appendShift, remove: removeShift } = useFieldArray({
    control,
    name: 'shiftConfig',
  });

  const { fields: peakFields, append: appendPeak, remove: removePeak } = useFieldArray({
    control,
    name: 'peakHours',
  });

  async function onSubmit(data: StoreFormData) {
    setSaving(true);
    try {
      if (store) {
        await api.put(`/api/stores/${store.id}`, data);
      } else {
        await api.post('/api/stores', data);
      }
      onSave();
    } catch (err) {
      console.error('Error saving store:', err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-4">Dados da Loja</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome da Loja
            </label>
            <input
              {...register('name', { required: true })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Endereco
            </label>
            <input
              {...register('address')}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Numero de Caixas
            </label>
            <input
              type="number"
              min={1}
              {...register('numberOfCheckouts', { required: true, min: 1 })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Turnos (Shift Config)</h3>
          <button
            type="button"
            onClick={() => appendShift({ name: '', start: '08:00', end: '12:00' })}
            className="px-3 py-1.5 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
          >
            + Adicionar Turno
          </button>
        </div>
        <div className="space-y-3">
          {shiftFields.map((field, index) => (
            <div key={field.id} className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
              <input
                {...register(`shiftConfig.${index}.name`, { required: true })}
                placeholder="Nome do turno"
                className="flex-1 px-3 py-2 border rounded-lg text-sm"
              />
              <input
                type="time"
                {...register(`shiftConfig.${index}.start`, { required: true })}
                className="px-3 py-2 border rounded-lg text-sm"
              />
              <span className="text-gray-400">ate</span>
              <input
                type="time"
                {...register(`shiftConfig.${index}.end`, { required: true })}
                className="px-3 py-2 border rounded-lg text-sm"
              />
              <button
                type="button"
                onClick={() => removeShift(index)}
                className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
              >
                X
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Horarios de Pico</h3>
          <button
            type="button"
            onClick={() => appendPeak({ start: '12:00', end: '14:00', minCoverage: 80 })}
            className="px-3 py-1.5 text-sm bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100"
          >
            + Adicionar Pico
          </button>
        </div>
        <div className="space-y-3">
          {peakFields.map((field, index) => (
            <div key={field.id} className="flex items-center gap-3 bg-orange-50 p-3 rounded-lg">
              <input
                type="time"
                {...register(`peakHours.${index}.start`, { required: true })}
                className="px-3 py-2 border rounded-lg text-sm"
              />
              <span className="text-gray-400">ate</span>
              <input
                type="time"
                {...register(`peakHours.${index}.end`, { required: true })}
                className="px-3 py-2 border rounded-lg text-sm"
              />
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Cobertura min:</span>
                <input
                  type="number"
                  min={0}
                  max={100}
                  {...register(`peakHours.${index}.minCoverage`, { required: true, min: 0, max: 100 })}
                  className="w-20 px-3 py-2 border rounded-lg text-sm"
                />
                <span className="text-sm text-gray-600">%</span>
              </div>
              <button
                type="button"
                onClick={() => removePeak(index)}
                className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
              >
                X
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {saving ? 'Salvando...' : 'Salvar Configuracao'}
        </button>
      </div>
    </form>
  );
}
