export default function AdPlaceholder({ slot }: { slot: string }) {
    return (
        <div className="my-8 w-full flex justify-center">
            <div className="w-full max-w-[728px] h-[90px] bg-muted/50 border border-dashed border-muted-foreground/20 rounded flex items-center justify-center text-sm text-muted-foreground">
                광고 ({slot}) 표시 영역
                {/* Actual AdSense Code */}
                {/* <ins className="adsbygoogle"
             style={{ display: 'block' }}
             data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
             data-ad-slot={slot}
             data-ad-format="auto"
             data-full-width-responsive="true"></ins>
        <script>
             (adsbygoogle = window.adsbygoogle || []).push({});
        </script> */}
            </div>
        </div>
    );
}
