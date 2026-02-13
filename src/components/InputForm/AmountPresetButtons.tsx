import { Button } from '@/components/ui/button';

interface Props {
    presets: { label: string; value: number }[];
    onSelect: (value: number) => void;
}

export default function AmountPresetButtons({ presets, onSelect }: Props) {
    return (
        <div className="flex flex-wrap gap-1.5">
            {presets.map(({ label, value }) => (
                <Button
                    key={value}
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-xs h-7 px-2"
                    onClick={() => onSelect(value)}
                >
                    {label}
                </Button>
            ))}
        </div>
    );
}
