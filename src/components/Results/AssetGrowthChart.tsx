import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import type { SimulationResult } from '@/types';

export default function AssetGrowthChart({ data }: { data: SimulationResult }) {
    // 데이터 변환
    const chartData = data.scenarios.median.yearlyData.map((yearData, index) => ({
        age: yearData.age,
        worst: data.scenarios.worst.yearlyData[index]?.assets || 0,
        median: yearData.assets,
        best: data.scenarios.best.yearlyData[index]?.assets || 0,
    }));

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('ko-KR', { notation: "compact", maximumFractionDigits: 1 }).format(value);
    };

    return (
        <div className="w-full h-[300px] sm:h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorMedian" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorBest" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorWorst" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="age" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                    <YAxis tickFormatter={formatCurrency} tick={{ fontSize: 12 }} tickLine={false} axisLine={false} width={40} />
                    <Tooltip
                        formatter={(value) => new Intl.NumberFormat('ko-KR').format(Number(value))}
                        labelFormatter={(label) => `${label}세`}
                    />
                    <Legend />
                    <Area type="monotone" dataKey="best" stroke="#10b981" fillOpacity={1} fill="url(#colorBest)" name="최선" />
                    <Area type="monotone" dataKey="median" stroke="#3b82f6" fillOpacity={1} fill="url(#colorMedian)" name="평균" />
                    <Area type="monotone" dataKey="worst" stroke="#ef4444" fillOpacity={1} fill="url(#colorWorst)" name="최악" />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
