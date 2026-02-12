import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface Props {
    finalAssets: number;
    monthlyPayout: number;
    payoutType: 'perpetual' | 'fixed';
    payoutYears?: number;
}

export default function PayoutChart({ monthlyPayout, payoutType, payoutYears }: Props) {
    // 간단한 시뮬레이션: 종신형이면 30년, 아니면 지정 기간만큼 데이터 생성
    const years = payoutType === 'fixed' ? (payoutYears || 20) : 30;

    const data = Array.from({ length: years }).map((_, i) => ({
        year: i + 1,
        payout: monthlyPayout,
    }));

    const formatCurrency = (value: number) => {
        if (value >= 100000000) return `${(value / 100000000).toFixed(1)}억`;
        if (value >= 10000) return `${(value / 10000).toFixed(0)}만`;
        return String(value);
    };

    return (
        <div className="w-full h-[300px]">
            <div className="mb-4 text-center">
                <p className="text-xl font-bold text-primary">{formatCurrency(monthlyPayout)}원 / 월</p>
                <p className="text-sm text-muted-foreground">
                    {payoutType === 'perpetual' ? '종신형 (30년 예시)' : `${payoutYears}년 확정 기간형`} 예상 수령액
                </p>
            </div>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 20, right: 20, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="year" tickLine={false} axisLine={false} label={{ value: '연차', position: 'insideBottom', offset: -5 }} />
                    <YAxis tickFormatter={formatCurrency} tickLine={false} axisLine={false} width={60} />
                    <Tooltip
                        cursor={{ fill: 'transparent' }}
                        formatter={(value) => [`${new Intl.NumberFormat('ko-KR').format(Number(value))}원`, '월 수령액']}
                        labelFormatter={(label) => `${label}년차`}
                    />
                    <Bar dataKey="payout" fill="#8884d8" radius={[4, 4, 0, 0]} barSize={20} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
