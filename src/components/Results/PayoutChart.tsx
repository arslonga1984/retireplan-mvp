import { ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine } from 'recharts';
import type { ScenarioDetail } from '@/types';

interface Props {
    scenario: ScenarioDetail;
    retirementAge: number;
    payoutType: 'perpetual' | 'fixed';
    payoutYears?: number;
}

export default function PayoutChart({ scenario, retirementAge, payoutType, payoutYears }: Props) {
    // 은퇴 후 데이터만 추출
    const postRetirementData = scenario.yearlyData.filter(d => d.age > retirementAge);

    const displayYears = payoutType === 'fixed' ? (payoutYears || 20) : 30;
    const chartData = postRetirementData.slice(0, displayYears).map((d) => ({
        age: d.age,
        monthlyPayout: scenario.monthlyPayout,
        remainingAssets: d.assets,
    }));

    // 자산 고갈 시점 찾기
    const depletionPoint = chartData.find(d => d.remainingAssets <= 0);
    const depletionAge = depletionPoint?.age;

    const formatCurrency = (value: number) => {
        if (value >= 100000000) return `${(value / 100000000).toFixed(1)}억`;
        if (value >= 10000) return `${(value / 10000).toFixed(0)}만`;
        return String(value);
    };

    return (
        <div className="w-full">
            <div className="mb-4 text-center">
                <p className="text-xl font-bold text-primary">{formatCurrency(scenario.monthlyPayout)}원 / 월</p>
                <p className="text-sm text-muted-foreground">
                    {payoutType === 'perpetual' ? '종신형 (30년 예시)' : `${payoutYears}년 확정 기간형`} 예상 수령액
                </p>
            </div>
            <div className="h-[300px] sm:h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={chartData} margin={{ top: 20, right: 10, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis
                            dataKey="age"
                            tick={{ fontSize: 12 }}
                            tickLine={false}
                            axisLine={false}
                            label={{ value: '나이(세)', position: 'insideBottom', offset: -5, fontSize: 11 }}
                        />
                        <YAxis
                            yAxisId="left"
                            tickFormatter={formatCurrency}
                            tick={{ fontSize: 11 }}
                            tickLine={false}
                            axisLine={false}
                            width={55}
                            label={{ value: '월수령(원)', angle: -90, position: 'insideLeft', offset: 10, fontSize: 10 }}
                        />
                        <YAxis
                            yAxisId="right"
                            orientation="right"
                            tickFormatter={formatCurrency}
                            tick={{ fontSize: 11 }}
                            tickLine={false}
                            axisLine={false}
                            width={55}
                            label={{ value: '잔여자산(원)', angle: 90, position: 'insideRight', offset: 10, fontSize: 10 }}
                        />
                        <Tooltip
                            allowEscapeViewBox={{ x: true, y: true }}
                            formatter={(value, name) => {
                                const label = name === 'monthlyPayout' ? '월 수령액' : '잔여 자산';
                                return [`${new Intl.NumberFormat('ko-KR').format(Number(value ?? 0))}원`, label];
                            }}
                            labelFormatter={(label) => `${label}세`}
                        />
                        {depletionAge && (
                            <ReferenceLine
                                x={depletionAge}
                                yAxisId="left"
                                stroke="#ef4444"
                                strokeDasharray="3 3"
                                label={{ value: '자산 고갈', position: 'insideTopRight', fill: '#ef4444', fontSize: 11 }}
                            />
                        )}
                        <Bar yAxisId="left" dataKey="monthlyPayout" fill="#8884d8" radius={[2, 2, 0, 0]} barSize={16} name="monthlyPayout" />
                        <Line yAxisId="right" type="monotone" dataKey="remainingAssets" stroke="#10b981" strokeWidth={2} dot={false} name="remainingAssets" />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-center text-xs text-muted-foreground">
                <div className="bg-muted p-2 rounded">
                    <span className="block text-sm font-bold text-foreground">{formatCurrency(scenario.monthlyPayout)}원</span>
                    월 수령액
                </div>
                <div className="bg-muted p-2 rounded">
                    <span className="block text-sm font-bold text-foreground">
                        {depletionAge ? `${depletionAge}세` : '고갈 없음'}
                    </span>
                    자산 고갈 시점
                </div>
            </div>
        </div>
    );
}
