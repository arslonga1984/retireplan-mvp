import { ResponsiveContainer, PieChart, Pie, Cell, Legend, Tooltip } from 'recharts';
import type { PortfolioStrategy } from '@/types';

const COLORS = {
    stocks: '#3b82f6',
    bonds: '#10b981',
    gold: '#f59e0b',
    reits: '#8b5cf6',
    cash: '#6b7280',
};

const ASSET_NAMES: Record<string, string> = {
    stocks: '주식',
    bonds: '채권',
    gold: '금',
    reits: '리츠',
    cash: '현금',
};

export default function PortfolioPieChart({ strategy }: { strategy: PortfolioStrategy }) {
    const data = Object.entries(strategy.allocation).map(([key, value]) => ({
        name: ASSET_NAMES[key] || key,
        value,
        color: COLORS[key as keyof typeof COLORS] || '#000000',
    })).filter(item => item.value > 0);

    return (
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="w-full h-[300px] flex-1">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={90}
                            fill="#8884d8"
                            paddingAngle={2}
                            dataKey="value"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip formatter={(val) => `${Number(val)}%`} />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            {/* ETF 리스트 */}
            <div className="flex-1 w-full overflow-auto">
                <h3 className="text-sm font-semibold mb-3">포트폴리오 구성 ETF</h3>
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b text-muted-foreground">
                            <th className="text-left py-2 font-medium">티커</th>
                            <th className="text-left py-2 font-medium">이름</th>
                            <th className="text-right py-2 font-medium">비중</th>
                        </tr>
                    </thead>
                    <tbody>
                        {strategy.etfList.map(etf => (
                            <tr key={etf.ticker} className="border-b last:border-0 hover:bg-muted/50">
                                <td className="py-2 font-medium">{etf.ticker}</td>
                                <td className="py-2 text-muted-foreground truncate max-w-[150px]" title={etf.name}>{etf.name}</td>
                                <td className="py-2 text-right">{etf.weight}%</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
