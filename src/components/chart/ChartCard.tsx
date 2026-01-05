import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
} from 'recharts';

type ChartType = 'line' | 'bar';

interface ChartCardProps {
  title: string;
  data: any[];
  dataKey: string;
  xKey: string;
  chartType?: ChartType;
  color?: string;
  height?: number;
}

 const chartData = [
  { name: 'Jan', users: 120 },
  { name: 'Feb', users: 210 },
  { name: 'Mar', users: 180 },
  { name: 'Apr', users: 260 },
  { name: 'May', users: 300 },
];

const ChartCard: React.FC<ChartCardProps> = ({
  title,
  data,
  dataKey,
  xKey,
  chartType = 'line',
  color = '#1c1c1cff',
  height = 250,
}) => {
  return (
    <div className="rounded-2xl shadow-md p-4 bg-white m-2">
      <h5 className="text-lg font-semibold mb-3">{title}</h5>
      <ResponsiveContainer width="100%" height={height}>
        {chartType === 'line' ? (
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xKey} />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              strokeWidth={1}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          </AreaChart>
        ) : (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="1 1" />
            <XAxis dataKey={xKey} />
            <YAxis />
            <Tooltip />
            <Bar dataKey={dataKey} fill={color} />
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
};

export default ChartCard;