import { ICryptoProvider, PriceData, SearchResult, TokenInfo } from '../types.js';

export class CoinGeckoProvider implements ICryptoProvider {
  name = 'CoinGecko';
  private baseUrl = 'https://api.coingecko.com/api/v3';

  async search(query: string): Promise<SearchResult[]> {
    try {
      const res = await fetch(`${this.baseUrl}/search?query=${query}`);
      if (!res.ok) return [];
      const data = await res.json();
      return (data.coins || []).slice(0, 10).map((coin: any) => ({
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
    try {
      let id = symbolOrId.toLowerCase();
      
      const searchRes = await this.search(id);
      const match = searchRes.find(s => s.symbol.toLowerCase() === id || s.id === id);
      if (match && match.id) {
        id = match.id;
      }

      const res = await fetch(`${this.baseUrl}/simple/price?ids=${id}&vs_currencies=usd`);
      if (!res.ok) return null;
      const data = await res.json();
      
      if (!data[id] || typeof data[id].usd === 'undefined') return null;

      return {
        symbol: match ? match.symbol : id.toUpperCase(),
        priceUsd: data[id].usd,
        source: this.name,
        lastUpdated: Date.now(),
      };
    } catch (e) {
      return null;
    }
  }

  async getTokenInfo(id: string): Promise<TokenInfo | null> {
    try {
      // By default, assuming id is the coingecko internal ID (like "bitcoin")
      const res = await fetch(`${this.baseUrl}/coins/${id.toLowerCase()}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`);
      if (!res.ok) return null;
      const data = await res.json();
      
      if (data.error) return null;

      return {
        name: data.name,
        symbol: data.symbol.toUpperCase(),
        priceUsd: data.market_data?.current_price?.usd || 0,
        marketCap: data.market_data?.market_cap?.usd,
        fdv: data.market_data?.fully_diluted_valuation?.usd,
        volume24h: data.market_data?.total_volume?.usd,
        source: this.name,
        lastUpdated: Date.now(),
      };
    } catch (e) {
      return null;
    }
  }
}