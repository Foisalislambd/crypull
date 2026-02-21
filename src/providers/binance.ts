import { ICryptoProvider, PriceData, SearchResult, TokenInfo } from '../types.js';

export class BinanceProvider implements ICryptoProvider {
  name = 'Binance';
  private baseUrl = 'https://api.binance.com/api/v3';

  async search(query: string): Promise<SearchResult[]> {
    try {
      // Binance doesn't have a direct "search" that returns symbols nicely for our format
      // We can fetch exchangeInfo, but it's large. For speed, we return a mock match if they query
      // or we just return an empty array and rely on other providers for search.
      // But let's try a quick hack: if query is short, construct a symbol.
      const symbol = query.toUpperCase();
      const res = await fetch(`${this.baseUrl}/ticker/price?symbol=${symbol}USDT`);
      if (res.ok) {
        return [{
          id: `${symbol}USDT`,
          name: symbol,
          symbol: symbol,
          source: this.name
        }];
      }
      return [];
    } catch (e) {
      return [];
    }
  }

  async getPrice(symbol: string): Promise<PriceData | null> {
    try {
      let querySymbol = symbol.toUpperCase();
      if (!querySymbol.endsWith('USDT') && !querySymbol.endsWith('BUSD') && !querySymbol.endsWith('BTC')) {
        querySymbol += 'USDT';
      }

      const res = await fetch(`${this.baseUrl}/ticker/price?symbol=${querySymbol}`);
      if (!res.ok) return null;
      const data = await res.json();

      return {
        symbol: symbol.toUpperCase(),
        priceUsd: parseFloat(data.price) || 0,
        source: this.name,
        lastUpdated: Date.now(),
      };
    } catch (e) {
      return null;
    }
  }

  async getTokenInfo(symbol: string): Promise<TokenInfo | null> {
    try {
      let querySymbol = symbol.toUpperCase();
      if (!querySymbol.endsWith('USDT') && !querySymbol.endsWith('BUSD') && !querySymbol.endsWith('BTC')) {
        querySymbol += 'USDT';
      }

      const res = await fetch(`${this.baseUrl}/ticker/24hr?symbol=${querySymbol}`);
      if (!res.ok) return null;
      const data = await res.json();

      return {
        name: symbol.toUpperCase(),
        symbol: symbol.toUpperCase(),
        priceUsd: parseFloat(data.lastPrice) || 0,
        volume24h: parseFloat(data.quoteVolume) || 0, // Quote volume in USDT roughly = USD volume
        source: this.name,
        lastUpdated: Date.now(),
      };
    } catch (e) {
      return null;
    }
  }
}