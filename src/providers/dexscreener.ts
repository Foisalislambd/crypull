import { ICryptoProvider, PriceData, SearchResult, TokenInfo } from '../types.js';

export class DexScreenerProvider implements ICryptoProvider {
  name = 'DexScreener';
  private baseUrl = 'https://api.dexscreener.com/latest/dex';

  async search(query: string): Promise<SearchResult[]> {
    try {
      const res = await fetch(`${this.baseUrl}/search?q=${query}`);
      if (!res.ok) return [];
      const data = await res.json();
      return (data.pairs || []).slice(0, 10).map((pair: any) => ({
        id: pair.baseToken.address,
        name: pair.baseToken.name,
        symbol: pair.baseToken.symbol.toUpperCase(),
        network: pair.chainId,
        source: this.name,
      }));
    } catch (e) {
      return [];
    }
  }

  async getPrice(address: string): Promise<PriceData | null> {
    const info = await this.getTokenInfo(address);
    if (!info) return null;
    return {
      symbol: info.symbol,
      priceUsd: info.priceUsd,
      source: this.name,
      lastUpdated: info.lastUpdated,
    };
  }

  async getTokenInfo(address: string): Promise<TokenInfo | null> {
    try {
      const res = await fetch(`${this.baseUrl}/tokens/${address}`);
      if (!res.ok) return null;
      const data = await res.json();
      
      if (!data.pairs || data.pairs.length === 0) return null;

      // The first pair is usually the most liquid one
      const pair = data.pairs[0];
      
      return {
        name: pair.baseToken.name,
        symbol: pair.baseToken.symbol.toUpperCase(),
        address: pair.baseToken.address,
        network: pair.chainId,
        priceUsd: parseFloat(pair.priceUsd) || 0,
        fdv: pair.fdv,
        volume24h: pair.volume?.h24,
        liquidityUsd: pair.liquidity?.usd,
        priceChangePercentage24h: pair.priceChange?.h24,
        links: {
          website: pair.info?.websites?.[0]?.url,
          twitter: pair.info?.socials?.find((s: any) => s.type === 'twitter')?.url,
          telegram: pair.info?.socials?.find((s: any) => s.type === 'telegram')?.url,
          discord: pair.info?.socials?.find((s: any) => s.type === 'discord')?.url,
        },
        source: this.name,
        lastUpdated: Date.now(),
      };
    } catch (e) {
      return null;
    }
  }
}