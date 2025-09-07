
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Disease } from '../../types';

interface ChartData {
  name: Disease;
  cases: number;
}

interface DiseaseBreakdownChartProps {
  data: ChartData[];
}

const DiseaseBreakdownChart: React.FC<DiseaseBreakdownChartProps> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
        <XAxis dataKey="name" tick={{ fill: '#9ca3af' }} />
        <YAxis tick={{ fill: '#9ca3af' }} />
        <Tooltip
          contentStyle={{
            backgroundColor: 'rgba(31, 41, 55, 0.8)', // bg-gray-800 with opacity
            borderColor: 'rgba(55, 65, 81, 1)', // border-gray-600
            borderRadius: '0.5rem',
          }}
          labelStyle={{ color: '#f9fafb' }} // text-gray-50
          itemStyle={{ color: '#0ea5e9' }} // text-primary-500
        />
        <Legend />
        <Bar dataKey="cases" fill="#0ea5e9" name="No. of Cases" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default DiseaseBreakdownChart;