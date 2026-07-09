'use client';

interface CoverageAlert {
  peakStart: string;
  peakEnd: string;
  currentOperators: number;
  requiredOperators: number;
  coveragePercent: number;
  minCoverage: number;
}

interface Props {
  alerts: CoverageAlert[];
  onClose: () => void;
}

export function CoverageAlertModal({ alerts, onClose }: Props) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
            <span className="text-orange-600 text-xl font-bold">!</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              ATENCAO: Cobertura Insuficiente
            </h3>
            <p className="text-sm text-gray-500">
              A escala atual nao atende a cobertura minima nos horarios de pico.
              Ajuste a escala para publicar.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {alerts.map((alert, index) => (
            <div
              key={index}
              className="bg-orange-50 border border-orange-200 rounded-lg p-4"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-orange-900">
                    Horario de Pico: {alert.peakStart}h - {alert.peakEnd}h
                  </p>
                  <p className="text-sm text-orange-700 mt-1">
                    Operadores atuais: <strong>{alert.currentOperators}</strong>
                  </p>
                  <p className="text-sm text-orange-700">
                    Minimo necessario: <strong>{alert.requiredOperators}</strong>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-orange-600">
                    {alert.coveragePercent}%
                  </p>
                  <p className="text-xs text-orange-500">
                    Cobertura (min: {alert.minCoverage}%)
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Entendi
          </button>
        </div>
      </div>
    </div>
  );
}
