// filename: client/src/components/organisms/DonutChartCard/DonutChartCard.tsx
import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, type ChartData, type ChartOptions } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import styles from './DonutChartCard.module.scss';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

interface ChartDataPoint {
  label: string;
  value: number;
  color: string;
}

interface DonutChartCardProps {
  title: string;
  dataPoints: ChartDataPoint[];
  centerText?: string;
  centerSubText?: string;
}

export const DonutChartCard: React.FC<DonutChartCardProps> = ({
  title,
  dataPoints,
  centerText = '',
  centerSubText = '',
}) => {
  const labels = dataPoints.map((dp) => dp.label);
  const dataValues = dataPoints.map((dp) => dp.value);
  const backgroundColors = dataPoints.map((dp) => dp.color);

  const chartData: ChartData<'doughnut'> = {
    labels,
    datasets: [
      {
        data: dataValues,
        backgroundColor: backgroundColors,
        borderWidth: 0,
        hoverOffset: 4,
      },
    ],
  };

  const chartOptions: ChartOptions<'doughnut'> = {
    cutout: '70%',
    plugins: {
      legend: {
        display: false, // Hide default legend to build a custom CSS legend
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.formattedValue || '';
            return ` ${label}: ${value}`;
          },
        },
      },
    },
    maintainAspectRatio: false,
  };

  const totalValue = dataPoints.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className={styles.chartCard}>
      <h3 className={styles.title}>{title}</h3>
      
      <div className={styles.chartWrapper}>
        <div className={styles.canvasContainer}>
          <Doughnut data={chartData} options={chartOptions} />
          <div className={styles.centerTextContainer}>
            <span className={styles.centerText}>
              {centerText || totalValue}
            </span>
            <span className={styles.centerSubText}>
              {centerSubText || 'Total'}
            </span>
          </div>
        </div>

        {/* Custom HTML Legend */}
        <div className={styles.legendContainer}>
          {dataPoints.map((dp, index) => {
            const percent = totalValue > 0 ? Math.round((dp.value / totalValue) * 100) : 0;
            return (
              <div key={index} className={styles.legendItem}>
                <div className={styles.labelGroup}>
                  <span 
                    className={styles.indicator} 
                    style={{ backgroundColor: dp.color }} 
                  />
                  <span className={styles.legendLabel}>{dp.label}</span>
                </div>
                <div className={styles.valueGroup}>
                  <span className={styles.value}>{dp.value}</span>
                  <span className={styles.percent}>{percent}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
export default DonutChartCard;
