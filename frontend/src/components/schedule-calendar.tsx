'use client';

import { useRef, useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin, { DropArg } from '@fullcalendar/interaction';
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
  extendedProps: {
    employeeId: string;
    shiftName: string;
  };
}

interface Props {
  storeId: string;
}

const LEVEL_COLORS: Record<number, string> = {
  1: '#3b82f6',
  2: '#10b981',
  3: '#f59e0b',
};

export function ScheduleCalendar({ storeId }: Props) {
  const calendarRef = useRef<FullCalendar>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [storeId]);

  async function loadData() {
    setLoading(true);
    try {
      const [empRes, schedRes] = await Promise.all([
        api.get(`/api/employees?storeId=${storeId}`),
        api.get(`/api/schedules/store/${storeId}`),
      ]);
      setEmployees(empRes.data);

      const schedEvents: ScheduleEvent[] = schedRes.data.map((s: any) => ({
        id: s.id,
        title: `${s.employee.name} - ${s.shiftName}`,
        start: `${s.date.split('T')[0]}T${s.shiftStart}:00`,
        end: `${s.date.split('T')[0]}T${s.shiftEnd}:00`,
        backgroundColor: LEVEL_COLORS[s.employee.level] || '#6b7280',
        borderColor: LEVEL_COLORS[s.employee.level] || '#6b7280',
        extendedProps: { employeeId: s.employeeId, shiftName: s.shiftName },
      }));
      setEvents(schedEvents);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleEventDrop(info: any) {
    const event = info.event;
    const startStr = event.start?.toISOString?.() || event.start;
    const endStr = event.end?.toISOString?.() || event.end;
    const dateStr = startStr.split('T')[0];
    const shiftStart = startStr.split('T')[1]?.substring(0, 5);
    const shiftEnd = endStr.split('T')[1]?.substring(0, 5);

    try {
      await api.put(`/api/schedules/${event.id}`, {
        shiftStart,
        shiftEnd,
      });
      await loadData();
    } catch (err: any) {
      if (err.response?.status === 422) {
        const alertsData = err.response.data.alerts;
        setAlerts(alertsData || []);
      }
      info.revert();
    }
  }

  async function handleDateSelect(info: any) {
    const employeeId = prompt('ID do funcionario:');
    if (!employeeId) return;

    const dateStr = info.startStr.split('T')[0];
    const shiftStart = info.startStr.split('T')[1]?.substring(0, 5) || '08:00';
    const shiftEnd = info.endStr.split('T')[1]?.substring(0, 5) || '12:00';

    try {
      await api.post('/api/schedules', {
        employeeId,
        date: dateStr,
        shiftStart,
        shiftEnd,
        shiftName: 'Turno',
      });
      await loadData();
    } catch (err: any) {
      if (err.response?.status === 422) {
        setAlerts(err.response.data.alerts || []);
      }
    }
  }

  async function handleEventClick(info: any) {
    if (confirm('Remover esta escala?')) {
      try {
        await api.delete(`/api/schedules/${info.event.id}`);
        await loadData();
      } catch (err) {
        console.error('Error deleting:', err);
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
        droppable={true}
        events={events}
        eventDrop={handleEventDrop}
        select={handleDateSelect}
        eventClick={handleEventClick}
        slotMinTime="06:00:00"
        slotMaxTime="22:00:00"
        allDaySlot={false}
        height="auto"
      />

      {alerts.length > 0 && (
        <CoverageAlertModal
          alerts={alerts}
          onClose={() => setAlerts([])}
        />
      )}
    </>
  );
}
