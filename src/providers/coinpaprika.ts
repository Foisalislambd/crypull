import { ICryptoProvider, PriceData, SearchResult, TokenInfo } from '../types.js';

export class CoinpaprikaProvider implements ICryptoProvider {
  name = 'Coinpaprika';
  private baseUrl = 'https://api.coinpaprika.com/v1';

  async search(query: string): Promise<SearchResult[]> {
    try {
      const res = await fetch(`${this.baseUrl}/search?q=${query}&c=currencies&limit=10`);
      if (!res.ok) return [];
      const data = await res.json();
      
      return (data.currencies || []).map((coin: any) => ({
        id: coin.id,
        name: coin.name,
        symbol: coin.symbol.toUpperCase(),
        source: this.name,
      }));
    } catch (e) {
      return [];
    }
  }

  async getPrice(symbolOrId: string): Promise<PriceData | null> {
    const info = await this.getTokenInfo(symbolOrId);
    if (!info) return null;
    return {
      symbol: info.symbol,
      priceUsd: info.priceUsd,
      source: this.name,
      lastUpdated: info.lastUpdated,
    };
  }

  async getTokenInfo(symbolOrId: string): Promise<TokenInfo | null> {
    try {
      let id = symbolOrId.toLowerCase();
      
      // If it doesn't look like a coinpaprika id (e.g. btc-bitcoin), search for it
      if (!id.includes('-')) {
        const searchRes = await this.search(id);
        const match = searchRes.find(s => s.symbol.toLowerCase() === id || s.id === id);
        if (match && match.id) {
          id = match.id;
        } else if (searchRes.length > 0 && searchRes[0].id) {
          id = searchRes[0].id;
        }
      }

      const res = await fetch(`${this.baseUrl}/tickers/${id}`);
      if (!res.ok) return null;
      const data = await res.json();
      
      return {
        name: data.name,
        symbol: data.symbol.toUpperCase(),
        priceUsd: data.quotes?.USD?.price || 0,
        marketCap: data.quotes?.USD?.market_cap,
        volume24h: data.quotes?.USD?.volume_24h,
        source: this.name,
        lastUpdated: Date.now(),
      };
    } catch (e) {
      return null;
    }
  }
}