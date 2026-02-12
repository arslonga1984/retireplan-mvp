import { useEffect } from 'react';

interface MetaHeadProps {
    title?: string;
    description?: string;
    keywords?: string;
    image?: string;
    url?: string;
}

export default function MetaHead({
    title = "퇴직연금 시뮬레이션 - AI 맞춤 포트폴리오 추천 | RetirePlan",
    description = "나의 은퇴 자금은 얼마일까? AI가 분석하는 맞춤형 자산배분 포트폴리오와 상세 시뮬레이션을 무료로 확인하세요.",
    keywords = "퇴직연금, IRP, 연금저축, 포트폴리오, 자산배분, ETF 추천, 노후준비, 은퇴계산기, 투자시뮬레이션",
    image = "/og-image.png",
    url = "https://retireplan.vercel.app"
}: MetaHeadProps) {

    const fullTitle = title.includes("RetirePlan") ? title : `${title} | RetirePlan`;

    useEffect(() => {
        // Update Title
        document.title = fullTitle;

        // Helper to update meta tags
        const updateMeta = (name: string, content: string) => {
            let element = document.querySelector(`meta[name="${name}"]`);
            if (!element) {
                element = document.createElement('meta');
                element.setAttribute('name', name);
                document.head.appendChild(element);
            }
            element.setAttribute('content', content);
        };

        const updateOgMeta = (property: string, content: string) => {
            let element = document.querySelector(`meta[property="${property}"]`);
            if (!element) {
                element = document.createElement('meta');
                element.setAttribute('property', property);
                document.head.appendChild(element);
            }
            element.setAttribute('content', content);
        };

        // Update Meta Tags
        updateMeta('description', description);
        updateMeta('keywords', keywords);

        // Update OG Tags
        updateOgMeta('og:title', fullTitle);
        updateOgMeta('og:description', description);
        updateOgMeta('og:url', url);
        updateOgMeta('og:image', image);

        // Update Twitter Tags
        updateOgMeta('twitter:title', fullTitle);
        updateOgMeta('twitter:description', description);
        updateOgMeta('twitter:url', url);
        updateOgMeta('twitter:image', image);

        // Schema.org
        const scriptId = 'schema-json-ld';
        let script = document.getElementById(scriptId);
        if (!script) {
            script = document.createElement('script');
            script.id = scriptId;
            script.setAttribute('type', 'application/ld+json');
            document.head.appendChild(script);
        }
        script.textContent = JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FinancialCalculator",
            "name": "RetirePlan AI - 퇴직연금 시뮬레이터",
            "description": description,
            "url": url,
            "applicationCategory": "FinanceApplication",
            "operatingSystem": "Web",
            "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "KRW"
            }
        });

    }, [fullTitle, description, keywords, image, url]);

    return null; // Renders nothing visibly
}
