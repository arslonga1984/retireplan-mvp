import { ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine, Legend } from 'recharts';
import type { ScenarioDetail } from '@/types';
import { formatCurrency } from '@/lib/utils';

interface Props {
    scenario: ScenarioDetail;
    retirementAge: number;
    payoutType: 'perpetual' | 'fixed';
    payoutYears?: number;
}

export default function PayoutChart({ scenario, retirementAge, payoutType, payoutYears }: Props) {
    const postRetirementData = scenario.yearlyData.filter(d => d.age > retirementAge);
    const displayYears = payoutType === 'fixed' ? (payoutYears || 20) : 30;

    const chartData = postRetirementData.slice(0, displayYears).map((d) => ({
        age: d.age,
        monthlyPayoutNominal: d.withdrawalNominal ?? scenario.monthlyPayout,
        monthlyPayoutReal: d.withdrawalReal ?? scenario.monthlyPayout,
        remainingAssets: d.assets,
    }));

    const depletionPoint = chartData.find(d => d.remainingAssets <= 0);
    const depletionAge = depletionPoint?.age;



    return (
        <div className="w-full">
            <div className="mb-4 text-center">
                <p className="text-xl font-bold text-primary">{formatCurrency(scenario.monthlyPayout)}원 / 월</p>
                <p className="text-sm text-muted-foreground">
                    {payoutType === 'perpetual' ? '종신형 (30년 예시)' : `${payoutYears}년 확정 기간형`} 기준 시작 수령액
                </p>
            </div>
            <div className="h-[300px] sm:h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={chartData} margin={{ top: 20, right: 10, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="age" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                        <YAxis yAxisId="left" tickFormatter={formatCurrency} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={55} />
                        <YAxis yAxisId="right" orientation="right" tickFormatter={formatCurrency} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={55} />
                        <Tooltip
                            allowEscapeViewBox={{ x: true, y: true }}
                            formatter={(value, name) => {
                                const labels: Record<string, string> = {
                                    monthlyPayoutNominal: '월 수령액(명목)',
                                    monthlyPayoutReal: '월 수령액(현재가치)',
                                    remainingAssets: '잔여 자산'
                                };
                                return [formatCurrency(Number(value ?? 0)), labels[name as string] || String(name)];
                            }}
                            labelFormatter={(label) => `${label}세`}
                        />
                        <Legend />
                        {depletionAge && (
                            <ReferenceLine
                                x={depletionAge}
                                yAxisId="left"
                                stroke="#dc2626"
                                strokeDasharray="3 3"
                                strokeWidth={2.5}
                                label={{ value: '자산 고갈', position: 'top', fill: '#dc2626', fontSize: 13, fontWeight: 700 }}
                            />
                        )}
                        <Bar yAxisId="left" dataKey="monthlyPayoutNominal" fill="#8884d8" radius={[2, 2, 0, 0]} barSize={12} name="monthlyPayoutNominal" />
                        <Line yAxisId="left" type="monotone" dataKey="monthlyPayoutReal" stroke="#6366f1" strokeWidth={2} dot={false} name="monthlyPayoutReal" />
                        <Line yAxisId="right" type="monotone" dataKey="remainingAssets" stroke="#10b981" strokeWidth={2} dot={false} name="remainingAssets" />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
