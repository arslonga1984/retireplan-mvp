import type { PortfolioStrategy } from '@/types';

// Korean ETF Ticker Constants (for easier management)
const TICKERS = {
    // US Equities
    US_SP500: { ticker: '360750', name: 'TIGER 미국S&P500' },
    US_NASDAQ100: { ticker: '367380', name: 'ACE 미국나스닥100' },
    US_TOTAL_STOCK: { ticker: '360750', name: 'TIGER 미국S&P500' }, // Proxy
    US_SMALL_VAL: { ticker: '333560', name: 'TIGER 미국S&P500가치주(합성)' }, // Imperfect proxy

    // Global/International Equities
    GLOBAL_STOCK: { ticker: '251350', name: 'KODEX 선진국MSCI World' },
    DEV_STOCK: { ticker: '251350', name: 'KODEX 선진국MSCI World' }, // Proxy
    EMERGING_STOCK: { ticker: '195980', name: 'TIGER 신흥국MSCI(합성 H)' },
    EURO_STOCK: { ticker: '195930', name: 'TIGER 유로스탁스50(합성 H)' },

    // Korean Equities
    KOSPI_200: { ticker: '102110', name: 'TIGER 200' },
    KODEX_200: { ticker: '069500', name: 'KODEX 200' },

    // Bonds
    US_TOTAL_BOND: { ticker: '441610', name: 'KODEX 미국종합채권SRI액티브(H)' },
    US_LONG_TREASURY: { ticker: '453850', name: 'ACE 미국30년국채액티브(H)' },
    US_INTER_TREASURY: { ticker: '305080', name: 'TIGER 미국채10년선물' },
    US_SHORT_TREASURY: { ticker: '462330', name: 'KODEX 미국채울트라30년선물(H)' }, // Placeholder for short term, actually SHY equivalent in KR is rare, usually KOFR or CD.
    // Better Short Term US Proxy in Korea -> SOFR
    US_SOFR: { ticker: '449170', name: 'TIGER 미국달러SOFR금리액티브(합성)' },

    KR_3Y_BOND: { ticker: '114260', name: 'KODEX 국고채3년' },
    KR_10Y_BOND: { ticker: '365340', name: 'KBSTAR KIS국고채30년Enhanced' }, // Using long term for better barbell
    KR_TOTAL_BOND: { ticker: '465640', name: 'KODEX 국고채10년액티브' }, // Proxy

    // Others
    GOLD: { ticker: '411060', name: 'ACE KRX금현물' },
    REITS_US: { ticker: '182480', name: 'TIGER 미국MSCI리츠(합성 H)' },
    REITS_GL: { ticker: '182480', name: 'TIGER 미국MSCI리츠(합성 H)' }, // Proxy
    CASH: { ticker: '423160', name: 'KODEX KOFR금리액티브(합성)' }
};

export const STRATEGIES: PortfolioStrategy[] = [
    // --- Korean Hybrid Strategies (NEW) ---
    {
        id: 'kor_us_6040',
        name: 'Korea-US 60/40 Split',
        nameKo: '한미 60/40 분산형',
        description: '한국과 미국 자산에 절반씩 투자하여 환율 변동성 헤지 및 안정성 추구',
        allocation: { stocks: 60, bonds: 40, gold: 0, cash: 0 },
        expectedReturn: 7.0,
        expectedMDD: 18,
        etfList: [
            { ...TICKERS.KOSPI_200, assetClass: 'stocks', weight: 30 },
            { ...TICKERS.US_SP500, assetClass: 'stocks', weight: 30 },
            { ...TICKERS.KR_3Y_BOND, assetClass: 'bonds', weight: 20 },
            { ...TICKERS.US_TOTAL_BOND, assetClass: 'bonds', weight: 20 },
        ]
    },
    {
        id: 'kor_growth',
        name: 'Korea Focused Growth',
        nameKo: '한국형 성장 포트폴리오',
        description: '국내 대표 우량주(KOSPI 200) 위주의 적극적인 투자',
        allocation: { stocks: 70, bonds: 30, gold: 0, cash: 0 },
        expectedReturn: 7.5,
        expectedMDD: 25,
        etfList: [
            { ...TICKERS.KODEX_200, assetClass: 'stocks', weight: 70 },
            { ...TICKERS.KR_10Y_BOND, assetClass: 'bonds', weight: 30 },
        ]
    },
    {
        id: 'seo_barbell',
        name: 'Seo\'s Barbell Strategy',
        nameKo: '서대리의 바벨 전략 (응용)',
        description: '한국의 성장성(주식)과 미국의 안정성(국채)을 조합한 바벨형 자산배분',
        allocation: { stocks: 50, bonds: 50, gold: 0, cash: 0 },
        expectedReturn: 6.8,
        expectedMDD: 15,
        etfList: [
            { ...TICKERS.KODEX_200, assetClass: 'stocks', weight: 50 },
            { ...TICKERS.US_LONG_TREASURY, assetClass: 'bonds', weight: 50 },
        ]
    },

    // --- Conservative / Low Volatility ---
    {
        id: 'permanent',
        name: 'Permanent Portfolio',
        nameKo: '영구 포트폴리오 (KR ver.)',
        description: '4가지 자산에 균등 분산, 안정적 수익 추구 (한국형)',
        allocation: { stocks: 25, bonds: 25, gold: 25, cash: 25 },
        expectedReturn: 6.0,
        expectedMDD: 15,
        etfList: [
            { ...TICKERS.KOSPI_200, assetClass: 'stocks', weight: 25 },
            { ...TICKERS.KR_10Y_BOND, assetClass: 'bonds', weight: 25 },
            { ...TICKERS.GOLD, assetClass: 'gold', weight: 25 },
            { ...TICKERS.CASH, assetClass: 'cash', weight: 25 },
        ],
    },
    {
        id: 'all_weather',
        name: 'All Weather Portfolio',
        nameKo: '올웨더 포트폴리오 (KR ver.)',
        description: '레이 달리오의 사계절 포트폴리오 (한국 상장 ETF로 구성)',
        allocation: { stocks: 30, bonds: 55, gold: 7.5, cash: 7.5 },
        expectedReturn: 6.5,
        expectedMDD: 18,
        etfList: [
            { ...TICKERS.GLOBAL_STOCK, assetClass: 'stocks', weight: 30 }, // VT proxy
            { ...TICKERS.US_LONG_TREASURY, assetClass: 'bonds', weight: 40 }, // TLT
            { ...TICKERS.US_INTER_TREASURY, assetClass: 'bonds', weight: 15 }, // IEF
            { ...TICKERS.GOLD, assetClass: 'gold', weight: 7.5 }, // GLD
            { ...TICKERS.CASH, assetClass: 'cash', weight: 7.5 }, // DBC proxy (Cash/Commodity)
        ],
    },
    {
        id: 'conservative_income',
        name: 'Conservative Income (20/80)',
        nameKo: '안정형 (채권 중심)',
        description: '원금 보존을 최우선으로 하는 매우 보수적인 전략',
        allocation: { stocks: 20, bonds: 80, gold: 0, cash: 0 },
        expectedReturn: 4.5,
        expectedMDD: 10,
        etfList: [
            { ...TICKERS.US_SP500, assetClass: 'stocks', weight: 20 },
            { ...TICKERS.US_TOTAL_BOND, assetClass: 'bonds', weight: 80 },
        ],
    },
    {
        id: 'golden_butterfly',
        name: 'Golden Butterfly',
        nameKo: '골든 버터플라이',
        description: '영구 포트폴리오의 변형, 주식 비중을 약간 높여 성장성 강화',
        allocation: { stocks: 40, bonds: 40, gold: 20, cash: 0 },
        expectedReturn: 7.0,
        expectedMDD: 20,
        etfList: [
            { ...TICKERS.US_SP500, assetClass: 'stocks', weight: 20 }, // VTI proxy
            { ...TICKERS.US_SMALL_VAL, assetClass: 'stocks', weight: 20 }, // IJS proxy
            { ...TICKERS.US_LONG_TREASURY, assetClass: 'bonds', weight: 20 }, // TLT
            { ...TICKERS.US_SOFR, assetClass: 'bonds', weight: 20 }, // SHY proxy
            { ...TICKERS.GOLD, assetClass: 'gold', weight: 20 },
        ],
    },
    {
        id: 'vanguard_2025',
        name: 'Vanguard Target Retirement 2025',
        nameKo: 'TDF 2025 (은퇴 임박)',
        description: '은퇴가 임박한 투자자를 위한 보수적 자산 배분',
        allocation: { stocks: 35, bonds: 65, gold: 0, cash: 0 },
        expectedReturn: 5.5,
        expectedMDD: 12,
        etfList: [
            { ...TICKERS.GLOBAL_STOCK, assetClass: 'stocks', weight: 21 },
            { ...TICKERS.US_SP500, assetClass: 'stocks', weight: 14 },
            { ...TICKERS.US_TOTAL_BOND, assetClass: 'bonds', weight: 45 },
            { ...TICKERS.KR_3Y_BOND, assetClass: 'bonds', weight: 20 }, // Domestic bond mix
        ],
    },

    // --- Moderate / Balanced ---
    {
        id: 'bogleheads_three',
        name: 'Bogleheads Three-Fund',
        nameKo: '보글헤드 3-Fund',
        description: '미국주식, 해외주식, 채권으로 구성된 가장 고전적인 인덱스 전략',
        allocation: { stocks: 60, bonds: 40, gold: 0, cash: 0 },
        expectedReturn: 7.5,
        expectedMDD: 25,
        etfList: [
            { ...TICKERS.US_SP500, assetClass: 'stocks', weight: 40 }, // VTI proxy
            { ...TICKERS.GLOBAL_STOCK, assetClass: 'stocks', weight: 20 }, // VXUS proxy
            { ...TICKERS.US_TOTAL_BOND, assetClass: 'bonds', weight: 40 }, // BND
        ],
    },
    {
        id: 'sixty_forty',
        name: 'Classic 60/40',
        nameKo: '전통적 60/40',
        description: '주식 60%, 채권 40%의 표준적인 자산 배분',
        allocation: { stocks: 60, bonds: 40, gold: 0, cash: 0 },
        expectedReturn: 7.2,
        expectedMDD: 22,
        etfList: [
            { ...TICKERS.US_SP500, assetClass: 'stocks', weight: 60 },
            { ...TICKERS.US_TOTAL_BOND, assetClass: 'bonds', weight: 40 },
        ],
    },
    {
        id: 'swensen_yale',
        name: 'David Swensen Yale Model',
        nameKo: '예일대 기금 모델',
        description: '다양한 자산군(리츠, 이머징 등)에 분산하여 장기 수익 추구',
        allocation: { stocks: 50, bonds: 30, gold: 0, reits: 20 },
        expectedReturn: 8.0,
        expectedMDD: 28,
        etfList: [
            { ...TICKERS.US_SP500, assetClass: 'stocks', weight: 30 },
            { ...TICKERS.DEV_STOCK, assetClass: 'stocks', weight: 15 },
            { ...TICKERS.EMERGING_STOCK, assetClass: 'stocks', weight: 5 },
            { ...TICKERS.REITS_US, assetClass: 'reits', weight: 20 },
            { ...TICKERS.US_INTER_TREASURY, assetClass: 'bonds', weight: 30 }, // Treasury + TIPS proxy
        ],
    },
    {
        id: 'coffeehouse',
        name: 'Coffeehouse Portfolio',
        nameKo: '커피하우스 포트폴리오',
        description: '다양한 주식 섹터와 가치주에 분산 투자',
        allocation: { stocks: 60, bonds: 40, gold: 0, cash: 0 },
        expectedReturn: 7.8,
        expectedMDD: 26,
        etfList: [
            { ...TICKERS.US_SP500, assetClass: 'stocks', weight: 10 },
            { ...TICKERS.US_SMALL_VAL, assetClass: 'stocks', weight: 10 },
            { ...TICKERS.GLOBAL_STOCK, assetClass: 'stocks', weight: 10 },
            { ...TICKERS.REITS_US, assetClass: 'reits', weight: 10 },
            { ...TICKERS.US_SP500, assetClass: 'stocks', weight: 20 }, // Extra large cap buffer
            { ...TICKERS.US_TOTAL_BOND, assetClass: 'bonds', weight: 40 },
        ]
    },
    {
        id: 'ivy_portfolio',
        name: 'Meb Faber Ivy Portfolio',
        nameKo: '아이비 포트폴리오',
        description: '하버드와 예일 기금을 모방한 5개 자산군 균등 분산',
        allocation: { stocks: 40, bonds: 20, gold: 0, reits: 20, cash: 20 },
        expectedReturn: 7.3,
        expectedMDD: 20,
        etfList: [
            { ...TICKERS.US_SP500, assetClass: 'stocks', weight: 20 },
            { ...TICKERS.GLOBAL_STOCK, assetClass: 'stocks', weight: 20 },
            { ...TICKERS.US_INTER_TREASURY, assetClass: 'bonds', weight: 20 },
            { ...TICKERS.REITS_US, assetClass: 'reits', weight: 20 },
            { ...TICKERS.GOLD, assetClass: 'cash', weight: 20 }, // Commodity proxy
        ]
    },

    // --- Aggressive / Growth ---
    {
        id: 'buffett_90_10',
        name: 'Warren Buffett 90/10',
        nameKo: '워렌 버핏 90/10',
        description: 'S&P 500 인덱스 펀드 90%와 단기 국채 10%',
        allocation: { stocks: 90, bonds: 10, gold: 0, cash: 0 },
        expectedReturn: 9.5,
        expectedMDD: 45,
        etfList: [
            { ...TICKERS.US_SP500, assetClass: 'stocks', weight: 90 },
            { ...TICKERS.US_SOFR, assetClass: 'bonds', weight: 10 },
        ],
    },
    {
        id: 'aggressive_growth',
        name: 'Aggressive Growth (100%)',
        nameKo: '공격형 (주식 100%)',
        description: '최대 수익을 위해 주식에 100% 투자 (높은 변동성 주의)',
        allocation: { stocks: 100, bonds: 0, gold: 0, cash: 0 },
        expectedReturn: 10.0,
        expectedMDD: 50,
        etfList: [
            { ...TICKERS.US_SP500, assetClass: 'stocks', weight: 60 },
            { ...TICKERS.US_NASDAQ100, assetClass: 'stocks', weight: 40 },
        ],
    },
    {
        id: 'rick_ferri_core_four',
        name: 'Rick Ferri Core 4',
        nameKo: '릭 페리 Core 4',
        description: '주식, 채권, 리츠로 구성된 간단하지만 강력한 포트폴리오',
        allocation: { stocks: 60, bonds: 20, gold: 0, reits: 20 },
        expectedReturn: 8.3,
        expectedMDD: 32,
        etfList: [
            { ...TICKERS.US_SP500, assetClass: 'stocks', weight: 48 },
            { ...TICKERS.GLOBAL_STOCK, assetClass: 'stocks', weight: 24 },
            { ...TICKERS.US_TOTAL_BOND, assetClass: 'bonds', weight: 20 },
            { ...TICKERS.REITS_US, assetClass: 'reits', weight: 8 },
        ]
    },
    {
        id: 'vanguard_2065',
        name: 'Vanguard Target Retirement 2065',
        nameKo: 'TDF 2065 (사회초년생)',
        description: '은퇴까지 40년 이상 남은 투자자를 위한 고수익 추구',
        allocation: { stocks: 90, bonds: 10, gold: 0, cash: 0 },
        expectedReturn: 9.8,
        expectedMDD: 48,
        etfList: [
            { ...TICKERS.GLOBAL_STOCK, assetClass: 'stocks', weight: 90 },
            { ...TICKERS.US_TOTAL_BOND, assetClass: 'bonds', weight: 10 },
        ],
    },
];
