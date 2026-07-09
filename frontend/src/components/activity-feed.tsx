'use client';

interface ActivityLog {
  id: string;
  userName: string;
  action: string;
  entityType: string;
  createdAt: string;
}

interface Props {
  logs: ActivityLog[];
}

const ACTION_LABELS: Record<string, string> = {
  CREATE_SCHEDULE: 'Criou escala',
  UPDATE_SCHEDULE: 'Atualizou escala',
  DELETE_SCHEDULE: 'Removeu escala',
  CREATE_EMPLOYEE: 'Cadastrou funcionario',
  UPDATE_EMPLOYEE: 'Atualizou funcionario',
  DELETE_EMPLOYEE: 'Removeu funcionario',
  APPROVE_SWAP: 'Aprovou troca de turno',
  CREATE_STORE: 'Criou loja',
  UPDATE_STORE: 'Atualizou loja',
};

export function ActivityFeed({ logs }: Props) {
  if (logs.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-4">Atividades Recentes</h3>
        <p className="text-gray-400 text-center py-8">
          Nenhuma atividade registrada
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Atividades Recentes</h3>
        <span className="text-xs text-gray-400">Atualizado a cada 30s</span>
      </div>
      <div className="space-y-3">
        {logs.map((log) => (
          <div key={log.id} className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
              <span className="text-blue-600 text-xs font-bold">
                {log.userName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-900">
                <span className="font-medium">{log.userName}</span>{' '}
                {ACTION_LABELS[log.action] || log.action}{' '}
                <span className="text-gray-500">{log.entityType.toLowerCase()}</span>
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                {new Date(log.createdAt).toLocaleString('pt-BR')}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
