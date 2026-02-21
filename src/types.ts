// Base Types for unified response

export interface PriceData {
  symbol: string;
  priceUsd: number;
  source: string;
  lastUpdated: number;
}

export interface TokenLinks {
  website?: string;
  twitter?: string;
  telegram?: string;
  discord?: string;
  github?: string;
  [key: string]: string | undefined;
}

export interface DexPairInfo {
  dexId: string;
  url: string;
  pairAddress: string;
  baseTokenSymbol: string;
  quoteTokenSymbol: string;
  priceUsd: number;
  volume24h?: number;
  liquidityUsd?: number;
}

export interface TrendingCoin {
  id: string;
  name: string;
  symbol: string;
  marketCapRank?: number;
  priceUsd?: number;
  priceChange24h?: number;
  volume24h?: number;
}

export interface GlobalMarketData {
  totalMarketCapUsd: number;
  totalVolume24hUsd: number;
  bitcoinDominancePercentage: number;
  ethereumDominancePercentage: number;
  activeCryptocurrencies: number;
  lastUpdated: number;
}

export interface ChartData {
  prices: number[];
  timestamps: number[];
  minPrice: number;
  maxPrice: number;
}

export interface SentimentData {
  value: number;       // 0 to 100
  classification: string; // "Extreme Fear", "Fear", "Neutral", "Greed", "Extreme Greed"
  lastUpdated: number;
}

export interface GasData {
  network: string;
  low: number;
  average: number;
  high: number;
  baseFee?: number;
}

export interface TokenInfo {
  name: string;
  symbol: string;
  address?: string;
  network?: string;
  description?: string;
  priceUsd: number;
  marketCap?: number;
  marketCapRank?: number;
  fdv?: number; // Fully Diluted Valuation
  circulatingSupply?: number;
  totalSupply?: number;
  maxSupply?: number;
  volume24h?: number;
  liquidityUsd?: number;
  
  // Price Changes
  priceChange24h?: number;
  priceChangePercentage24h?: number;
  priceChangePercentage7d?: number;
  
  // All Time High / Low
  ath?: number;
  athDate?: string;
  atl?: number;
  atlDate?: string;

  links?: TokenLinks;

  // Trading Pairs (mainly for DEX data)
  pairs?: DexPairInfo[];
  
  source: string;
  lastUpdated: number;
}

export interface SearchResult {
  id?: string; // id or address
  name: string;
  symbol: string;
  network?: string;
  source: string;
}

export interface ICryptoProvider {
  name: string;
  getPrice(symbol: string): Promise<PriceData | null>;
  getTokenInfo(address: string, network?: string): Promise<TokenInfo | null>;
  search(query: string): Promise<SearchResult[]>;
}