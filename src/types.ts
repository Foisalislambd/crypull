// Base Types for unified response

export interface PriceData {
  symbol: string;
  priceUsd: number;
  source: string;
  lastUpdated: number;
}

export interface TokenInfo {
  name: string;
  symbol: string;
  address?: string;
  network?: string;
  priceUsd: number;
  marketCap?: number;
  fdv?: number; // Fully Diluted Valuation
  volume24h?: number;
  liquidityUsd?: number;
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