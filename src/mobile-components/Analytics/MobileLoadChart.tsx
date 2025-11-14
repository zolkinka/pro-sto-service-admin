import { useMemo } from 'react';
import './MobileLoadChart.css';

export interface ChartDataPoint {
  label: string;
  value: number;
}

interface MobileLoadChartProps {
  data: ChartDataPoint[];
  loading?: boolean;
}

export const MobileLoadChart = ({ data, loading = false }: MobileLoadChartProps) => {
  const maxValue = useMemo(() => {
    if (data.length === 0) return 50;
    const max = Math.max(...data.map((d) => d.value));
    // Округляем до ближайшего десятка вверх
    return Math.ceil(max / 10) * 10 || 50;
  }, [data]);

  // Генерируем метки для оси Y (6 линий: 0, 10, 20, 30, 40, 50)
  const yAxisLabels = useMemo(() => {
    const step = maxValue / 5;
    return Array.from({ length: 6 }, (_, i) => maxValue - i * step);
  }, [maxValue]);

  if (loading) {
    return (
      <div className="mobile-load-chart">
        <div className="mobile-load-chart__header">
          <h3 className="mobile-load-chart__title">Загрузка</h3>
        </div>
        <div className="mobile-load-chart__content">
          <div className="mobile-load-chart__skeleton" />
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="mobile-load-chart">
        <div className="mobile-load-chart__header">
          <h3 className="mobile-load-chart__title">Загрузка</h3>
        </div>
        <div className="mobile-load-chart__empty">Нет данных</div>
      </div>
    );
  }

  return (
    <div className="mobile-load-chart">
      <div className="mobile-load-chart__header">
        <h3 className="mobile-load-chart__title">Загрузка</h3>
      </div>
      <div className="mobile-load-chart__content">
        <div className="mobile-load-chart__chart-wrapper">
          {/* Y-axis */}
          <div className="mobile-load-chart__y-axis">
            {yAxisLabels.map((label, index) => (
              <div key={index} className="mobile-load-chart__y-axis-item">
                <span className="mobile-load-chart__y-axis-label">{Math.round(label)}</span>
                <div className="mobile-load-chart__y-axis-line" />
              </div>
            ))}
          </div>

          {/* Chart bars */}
          <div className="mobile-load-chart__bars-wrapper">
            <div className="mobile-load-chart__bars">
              {data.map((point, index) => {
                // Chart height (253px) - top padding - y-axis spacing
                const chartHeight = 229; // Высота области для столбцов
                const heightPx = maxValue > 0 ? (point.value / maxValue) * chartHeight : 0;
                return (
                  <div key={index} className="mobile-load-chart__bar-container">
                    <div
                      className="mobile-load-chart__bar"
                      style={{ height: heightPx > 0 ? `${heightPx}px` : '0px' }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* X-axis */}
        <div className="mobile-load-chart__x-axis">
          {data.map((point, index) => (
            <div key={index} className="mobile-load-chart__x-axis-label">
              {point.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
