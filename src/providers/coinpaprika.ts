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
        description: data.description,
        priceUsd: data.quotes?.USD?.price || 0,
        marketCap: data.quotes?.USD?.market_cap,
        marketCapRank: data.rank,
        circulatingSupply: data.circulating_supply,
        totalSupply: data.total_supply,
        maxSupply: data.max_supply,
        volume24h: data.quotes?.USD?.volume_24h,
        priceChangePercentage24h: data.quotes?.USD?.percent_change_24h,
        priceChangePercentage7d: data.quotes?.USD?.percent_change_7d,
        ath: data.quotes?.USD?.ath_price,
        athDate: data.quotes?.USD?.ath_date,
        links: {
          website: data.links?.website?.[0],
          twitter: data.links?.twitter?.[0],
          discord: data.links?.discord?.[0],
          github: data.links?.source_code?.[0],
        },
        source: this.name,
        lastUpdated: Date.now(),
      };
    } catch (e) {
      return null;
    }
  }
}