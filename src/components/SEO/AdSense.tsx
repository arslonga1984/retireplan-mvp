import { useEffect, useRef } from 'react';

interface AdSenseProps {
    slot: string;
    format?: 'auto' | 'rectangle' | 'horizontal' | 'vertical';
    responsive?: boolean;
    className?: string;
}

const ADSENSE_CLIENT = 'ca-pub-XXXXXXXXXX';
const IS_PRODUCTION = typeof window !== 'undefined' && !window.location.hostname.includes('localhost');

export default function AdSense({ slot, format = 'auto', responsive = true, className = '' }: AdSenseProps) {
    const adRef = useRef<HTMLModElement>(null);
    const pushed = useRef(false);

    useEffect(() => {
        if (!IS_PRODUCTION || pushed.current) return;
        try {
            const adsbygoogle = (window as unknown as { adsbygoogle: unknown[] }).adsbygoogle || [];
            adsbygoogle.push({});
            pushed.current = true;
        } catch {
            // AdSense not loaded yet
        }
    }, []);

    if (!IS_PRODUCTION) {
        return (
            <div className={`my-6 w-full flex justify-center ${className}`}>
                <div className="w-full max-w-[728px] h-[90px] bg-muted/50 border border-dashed border-muted-foreground/20 rounded flex items-center justify-center text-xs text-muted-foreground">
                    AD ({slot})
                </div>
            </div>
        );
    }

    return (
        <div className={`my-6 w-full flex justify-center ${className}`}>
            <ins
                ref={adRef}
                className="adsbygoogle"
                style={{ display: 'block' }}
                data-ad-client={ADSENSE_CLIENT}
                data-ad-slot={slot}
                data-ad-format={format}
                data-full-width-responsive={responsive ? 'true' : 'false'}
            />
        </div>
    );
}
