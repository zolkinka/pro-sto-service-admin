import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import type { LoadChartProps } from './LoadChart.types';
import './LoadChart.css';

const LoadChart: React.FC<LoadChartProps> = ({
  data,
  maxCount,
  loading = false,
  className,
  period = 'week',
  date = new Date(),
}) => {
  const [animatedData, setAnimatedData] = useState<number[]>([]);

  // Вычисляем максимальное значение для шкалы Y
  // Округляем до ближайшего кратного 10 вверх
  const getCalculatedMax = () => {
    if (maxCount) return maxCount;
    
    const dataMax = Math.max(...data.map((d) => d.value), 0);
    
    // Если максимум 0, возвращаем 10 как минимум
    if (dataMax === 0) return 10;
    
    // Округляем вверх до ближайшего кратного 10
    return Math.ceil(dataMax / 10) * 10;
  };
  
  const calculatedMax = getCalculatedMax();
  const yAxisValues = [calculatedMax, calculatedMax * 0.8, calculatedMax * 0.6, calculatedMax * 0.4, calculatedMax * 0.2, 0];

  // Анимация появления столбцов
  useEffect(() => {
    if (!loading && data.length > 0) {
      // Сброс анимации
      setAnimatedData(data.map(() => 0));

      // Запуск анимации с задержкой
      const timer = setTimeout(() => {
        setAnimatedData(data.map((d) => d.value));
      }, 50);

      return () => clearTimeout(timer);
    }
  }, [data, loading]);

  // Состояние загрузки
  if (loading) {
    // определяем количество элементов по периоду
    const xCount = period === 'month' ? new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate() : 7;

    return (
      <div className={classNames('load-chart', 'load-chart_loading', className)}>
        <div className="load-chart__y-axis">
          {yAxisValues.map((_, index) => (
            <div key={index} className="load-chart__y-label">
              <div className="load-chart__skeleton load-chart__skeleton_label" />
            </div>
          ))}
        </div>
        <div className="load-chart__content">
          <div className="load-chart__bars">
            {Array.from({ length: xCount }).map((_, index) => (
              <div key={index} className="load-chart__bar-wrapper">
                <div className="load-chart__skeleton load-chart__skeleton_bar" />
              </div>
            ))}
          </div>
          <div className="load-chart__x-axis">
            {Array.from({ length: xCount }).map((_, index) => (
              <div key={index} className="load-chart__x-label">
                <div className="load-chart__skeleton load-chart__skeleton_x-label" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Пустое состояние
  if (data.length === 0) {
    return (
      <div className={classNames('load-chart', 'load-chart_empty', className)}>
        <div className="load-chart__empty-state">
          <p className="load-chart__empty-text">Нет данных для отображения</p>
        </div>
      </div>
    );
  }

  return (
    <div className={classNames('load-chart', className)}>
      <div className="load-chart__y-axis">
        {yAxisValues.map((value, index) => (
          <div key={index} className="load-chart__y-label">
            {Math.round(value)}
          </div>
        ))}
      </div>
      
      <div className="load-chart__content">
        <div className="load-chart__grid-lines">
          {yAxisValues.map((_, index) => (
            <div key={index} className="load-chart__grid-line" />
          ))}
        </div>
        <div className="load-chart__bars">
          {data.map((point, index) => {
            const height = (animatedData[index] / calculatedMax) * 100;
            
            return (
              <div key={point.label} className="load-chart__bar-wrapper">
                <div
                  className="load-chart__bar"
                  style={{
                    height: `${height}%`,
                    transitionDelay: `${index * 50}ms`,
                  }}
                  title={`${point.label}: ${point.value}`}
                />
              </div>
            );
          })}
        </div>
        
        <div className="load-chart__x-axis">
          {data.map((point) => (
            <div key={point.label} className="load-chart__x-label">
              {point.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LoadChart;
