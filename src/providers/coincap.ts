import { ICryptoProvider, PriceData, SearchResult, TokenInfo } from '../types.js';

export class CoinCapProvider implements ICryptoProvider {
  name = 'CoinCap';
  private baseUrl = 'https://api.coincap.io/v2';

  async search(query: string): Promise<SearchResult[]> {
    try {
      const res = await fetch(`${this.baseUrl}/assets?search=${query}&limit=10`);
      if (!res.ok) return [];
      const data = await res.json();
      
      return (data.data || []).map((coin: any) => ({
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
      
      const searchRes = await this.search(id);
      const match = searchRes.find(s => s.symbol.toLowerCase() === id || s.id === id);
      if (match && match.id) {
        id = match.id;
      }

      const res = await fetch(`${this.baseUrl}/assets/${id}`);
      if (!res.ok) return null;
      const data = await res.json();
      const asset = data.data;

      if (!asset) return null;

      return {
        name: asset.name,
        symbol: asset.symbol.toUpperCase(),
        priceUsd: parseFloat(asset.priceUsd) || 0,
        marketCap: parseFloat(asset.marketCapUsd),
        volume24h: parseFloat(asset.volumeUsd24Hr),
        source: this.name,
        lastUpdated: Date.now(),
      };
    } catch (e) {
      return null;
    }
  }
}