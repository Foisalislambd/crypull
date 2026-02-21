import { ICryptoProvider, PriceData, SearchResult, TokenInfo } from '../types.js';

export class CryptoCompareProvider implements ICryptoProvider {
  name = 'CryptoCompare';
  private baseUrl = 'https://min-api.cryptocompare.com/data';

  async search(query: string): Promise<SearchResult[]> {
    // CryptoCompare search is a bit heavy (fetches all coins), so we mock or skip for basic search
    // Returning empty array and letting other providers handle search is better for perf.
    return [];
  }

  async getPrice(symbol: string): Promise<PriceData | null> {
    try {
      const sym = symbol.toUpperCase();
      const res = await fetch(`${this.baseUrl}/price?fsym=${sym}&tsyms=USD`);
      if (!res.ok) return null;
      const data = await res.json();
      
      if (data.Response === 'Error' || !data.USD) return null;

      return {
        symbol: sym,
        priceUsd: data.USD,
        source: this.name,
        lastUpdated: Date.now(),
      };
    } catch (e) {
      return null;
    }
  }

  async getTokenInfo(symbol: string): Promise<TokenInfo | null> {
    try {
      const sym = symbol.toUpperCase();
      const res = await fetch(`${this.baseUrl}/pricemultifull?fsyms=${sym}&tsyms=USD`);
      if (!res.ok) return null;
      const data = await res.json();
      
      if (!data.RAW || !data.RAW[sym] || !data.RAW[sym].USD) return null;
      const raw = data.RAW[sym].USD;

      return {
        name: sym, // CryptoCompare doesn't give full name in this endpoint
        symbol: sym,
        priceUsd: raw.PRICE || 0,
        marketCap: raw.MKTCAP,
        volume24h: raw.TOTALVOLUME24HTO,
        source: this.name,
        lastUpdated: Date.now(),
      };
    } catch (e) {
      return null;
    }
  }
}