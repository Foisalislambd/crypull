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
        description: data.description?.en,
        priceUsd: data.market_data?.current_price?.usd || 0,
        marketCap: data.market_data?.market_cap?.usd,
        marketCapRank: data.market_cap_rank,
        fdv: data.market_data?.fully_diluted_valuation?.usd,
        circulatingSupply: data.market_data?.circulating_supply,
        totalSupply: data.market_data?.total_supply,
        maxSupply: data.market_data?.max_supply,
        volume24h: data.market_data?.total_volume?.usd,
        priceChange24h: data.market_data?.price_change_24h,
        priceChangePercentage24h: data.market_data?.price_change_percentage_24h,
        priceChangePercentage7d: data.market_data?.price_change_percentage_7d,
        ath: data.market_data?.ath?.usd,
        athDate: data.market_data?.ath_date?.usd,
        atl: data.market_data?.atl?.usd,
        atlDate: data.market_data?.atl_date?.usd,
        links: {
          website: data.links?.homepage?.[0],
          twitter: data.links?.twitter_screen_name ? `https://twitter.com/${data.links.twitter_screen_name}` : undefined,
          telegram: data.links?.telegram_channel_identifier ? `https://t.me/${data.links.telegram_channel_identifier}` : undefined,
          discord: data.links?.chat_url?.find((url: string) => url.includes('discord')),
          github: data.links?.repos_url?.github?.[0],
        },
        source: this.name,
        lastUpdated: Date.now(),
      };
    } catch (e) {
      return null;
    }
  }
}