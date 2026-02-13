interface Zone {
    label: string;
    min: number;
    max: number;
    color: string;
    bgColor: string;
}

interface Props {
    type: 'return' | 'mdd';
    currentValue: number;
}

const RETURN_ZONES: Zone[] = [
    { label: '안정', min: 3, max: 5, color: 'text-green-600', bgColor: 'bg-green-100 dark:bg-green-900/30' },
    { label: '보통', min: 5, max: 8, color: 'text-blue-600', bgColor: 'bg-blue-100 dark:bg-blue-900/30' },
    { label: '공격', min: 8, max: 15, color: 'text-red-600', bgColor: 'bg-red-100 dark:bg-red-900/30' },
];

const MDD_ZONES: Zone[] = [
    { label: '안정', min: 10, max: 20, color: 'text-green-600', bgColor: 'bg-green-100 dark:bg-green-900/30' },
    { label: '보통', min: 20, max: 35, color: 'text-blue-600', bgColor: 'bg-blue-100 dark:bg-blue-900/30' },
    { label: '공격', min: 35, max: 50, color: 'text-red-600', bgColor: 'bg-red-100 dark:bg-red-900/30' },
];

const RETURN_HINTS: Record<string, string> = {
    '안정': '예금/채권 중심의 보수적 투자',
    '보통': '채권+주식 혼합 투자',
    '공격': '주식 비중이 높은 적극적 투자',
};

const MDD_HINTS: Record<string, string> = {
    '안정': '변동성이 적은 안정적 포트폴리오',
    '보통': '적절한 리스크를 감수하는 투자',
    '공격': '높은 변동성을 감수하는 투자',
};

function getCurrentZone(zones: Zone[], value: number): Zone | undefined {
    return zones.find(z => value >= z.min && value < z.max) || zones[zones.length - 1];
}

export default function SliderZoneGuide({ type, currentValue }: Props) {
    const zones = type === 'return' ? RETURN_ZONES : MDD_ZONES;
    const hints = type === 'return' ? RETURN_HINTS : MDD_HINTS;
    const currentZone = getCurrentZone(zones, currentValue);
    const totalRange = zones[zones.length - 1].max - zones[0].min;

    return (
        <div className="space-y-1.5">
            <div className="flex h-2 rounded-full overflow-hidden">
                {zones.map((zone) => {
                    const width = ((zone.max - zone.min) / totalRange) * 100;
                    return (
                        <div
                            key={zone.label}
                            className={zone.bgColor}
                            style={{ width: `${width}%` }}
                        />
                    );
                })}
            </div>
            <div className="flex justify-between text-[10px] text-muted-foreground">
                {zones.map((zone) => (
                    <span key={zone.label} className={currentZone?.label === zone.label ? `font-bold ${zone.color}` : ''}>
                        {zone.label} ({zone.min}-{zone.max}%)
                    </span>
                ))}
            </div>
            {currentZone && (
                <p className={`text-xs ${currentZone.color} font-medium`}>
                    {hints[currentZone.label]}
                </p>
            )}
        </div>
    );
}
