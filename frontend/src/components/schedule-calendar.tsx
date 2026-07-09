'use client';

import { useRef, useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { api } from '@/lib/api';
import { CoverageAlertModal } from './coverage-alert-modal';

interface Employee {
  id: string;
  name: string;
  matricula: string;
  level: number;
}

interface ScheduleEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  backgroundColor: string;
  borderColor: string;
  textColor: string;
  extendedProps: { employeeId: string; shiftName: string };
}

interface Props {
  storeId: string;
  employees: Employee[];
  onRefresh: () => void;
}

const LEVEL_COLORS: Record<number, { bg: string; text: string }> = {
  1: { bg: '#3b82f6', text: '#ffffff' },
  2: { bg: '#10b981', text: '#ffffff' },
  3: { bg: '#f59e0b', text: '#ffffff' },
};

export function ScheduleCalendar({ storeId, employees, onRefresh }: Props) {
  const calendarRef = useRef<FullCalendar>(null);
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [modalDate, setModalDate] = useState('');
  const [modalStart, setModalStart] = useState('');
  const [modalEnd, setModalEnd] = useState('');
  const [modalShiftName, setModalShiftName] = useState('Turno');
  const [modalEmployeeId, setModalEmployeeId] = useState('');

  useEffect(() => {
    if (storeId) loadEvents();
  }, [storeId]);

  async function loadEvents() {
    setLoading(true);
    try {
      const res = await api.get(`/api/schedules/store/${storeId}`);
      const schedEvents: ScheduleEvent[] = res.data.map((s: any) => {
        const colors = LEVEL_COLORS[s.employee?.level] || { bg: '#6b7280', text: '#ffffff' };
        return {
          id: s.id,
          title: `${s.employee?.name || '?'} - ${s.shiftName}`,
          start: `${s.date.split('T')[0]}T${s.shiftStart}:00`,
          end: `${s.date.split('T')[0]}T${s.shiftEnd}:00`,
          backgroundColor: colors.bg,
          borderColor: colors.bg,
          textColor: colors.text,
          extendedProps: { employeeId: s.employeeId, shiftName: s.shiftName },
        };
      });
      setEvents(schedEvents);
    } catch (err) {
      console.error('Error loading schedules:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleEventDrop(info: any) {
    const startStr = info.event.start?.toISOString?.() || info.event.start;
    const endStr = info.event.end?.toISOString?.() || info.event.end;
    const shiftStart = startStr.split('T')[1]?.substring(0, 5);
    const shiftEnd = endStr.split('T')[1]?.substring(0, 5);
    try {
      await api.put(`/api/schedules/${info.event.id}`, { shiftStart, shiftEnd });
      await loadEvents();
    } catch (err: any) {
      if (err.response?.status === 422) setAlerts(err.response.data.alerts || []);
      info.revert();
    }
  }

  function openNewSchedule(info: any) {
    const dateStr = info.startStr.split('T')[0];
    const start = info.startStr.split('T')[1]?.substring(0, 5) || '08:00';
    const end = info.endStr.split('T')[1]?.substring(0, 5) || '12:00';
    setModalDate(dateStr);
    setModalStart(start);
    setModalEnd(end);
    setModalShiftName('Turno');
    setModalEmployeeId(employees[0]?.id || '');
    setShowModal(true);
  }

  async function confirmSchedule() {
    if (!modalEmployeeId) return;
    try {
      await api.post('/api/schedules', {
        employeeId: modalEmployeeId,
        date: modalDate,
        shiftStart: modalStart,
        shiftEnd: modalEnd,
        shiftName: modalShiftName,
      });
      setShowModal(false);
      await loadEvents();
      onRefresh();
    } catch (err: any) {
      if (err.response?.status === 422) setAlerts(err.response.data.alerts || []);
    }
  }

  async function handleEventClick(info: any) {
    if (confirm('Remover esta escala?')) {
      try {
        await api.delete(`/api/schedules/${info.event.id}`);
        await loadEvents();
        onRefresh();
      } catch (err) {
        console.error(err);
      }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <>
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek',
        }}
        locale="pt-br"
        initialView="timeGridWeek"
        editable={true}
        selectable={true}
        events={events}
        eventDrop={handleEventDrop}
        select={openNewSchedule}
        eventClick={handleEventClick}
        slotMinTime="06:00:00"
        slotMaxTime="22:00:00"
        allDaySlot={false}
        height="auto"
      />

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Nova Escala</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Funcionario</label>
                <select value={modalEmployeeId} onChange={(e) => setModalEmployeeId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>{emp.name} ({emp.matricula})</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Inicio</label>
                  <input type="time" value={modalStart} onChange={(e) => setModalStart(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fim</label>
                  <input type="time" value={modalEnd} onChange={(e) => setModalEnd(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Turno</label>
                <input value={modalShiftName} onChange={(e) => setModalShiftName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
                Cancelar
              </button>
              <button onClick={confirmSchedule}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {alerts.length > 0 && (
        <CoverageAlertModal alerts={alerts} onClose={() => setAlerts([])} />
      )}
    </>
  );
}
