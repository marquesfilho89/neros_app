'use client';

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line,
} from 'recharts';

interface Props {
  hourlyDistribution: Record<string, number>;
}

export function DashboardCharts({ hourlyDistribution }: Props) {
  const data = Object.entries(hourlyDistribution).map(([hour, count]) => ({
    hour,
    operators: count,
  }));

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-lg font-semibold mb-4">
        Media de Caixas Alocados por Hora
      </h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="hour"
              tick={{ fontSize: 12 }}
              interval={0}
              angle={-45}
              textAnchor="end"
            />
            <YAxis allowDecimals={false} />
            <Tooltip
              formatter={(value: number) => [`${value} operadores`, 'Caixas']}
            />
            <Bar dataKey="operators" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
