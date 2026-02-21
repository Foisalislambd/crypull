import { DexPairInfo, ICryptoProvider, PriceData, SearchResult, TokenInfo } from '../types.js';

export class GeckoTerminalProvider implements ICryptoProvider {
  name = 'GeckoTerminal';
  private baseUrl = 'https://api.geckoterminal.com/api/v2';

  async search(query: string): Promise<SearchResult[]> {
    try {
      const res = await fetch(`${this.baseUrl}/search/pools?query=${query}`);
      if (!res.ok) return [];
      const data = await res.json();
      
      const pools = data.data || [];
      return pools.slice(0, 10).map((pool: any) => {
        const attributes = pool.attributes;
        const baseToken = attributes.name.split(' / ')[0]; // Usually Base / Quote
        return {
          id: pool.id, // e.g. "eth_0x..."
          name: attributes.name,
          symbol: baseToken,
          network: pool.relationships.network.data.id,
          source: this.name,
        };
      });
    } catch (e) {
      return [];
    }
  }

  async getPrice(address: string, network: string = 'eth'): Promise<PriceData | null> {
    const info = await this.getTokenInfo(address, network);
    if (!info) return null;
    return {
      symbol: info.symbol,
      priceUsd: info.priceUsd,
      source: this.name,
      lastUpdated: info.lastUpdated,
    };
  }

  async getTokenInfo(address: string, network: string = 'eth'): Promise<TokenInfo | null> {
    try {
      const res = await fetch(`${this.baseUrl}/networks/${network}/tokens/${address}`);
      if (!res.ok) return null;
      const json = await res.json();
      
      if (!json.data || !json.data.attributes) return null;

      const attrs = json.data.attributes;

      // Try to get pairs from pools list if geckoterminal provides it via another endpoint or included relationships
      // For now, GeckoTerminal's token endpoint doesn't return rich pairs list natively without separate call.
      // So we map what we can.
      
      return {
        name: attrs.name,
        symbol: attrs.symbol.toUpperCase(),
        address: attrs.address,
        network: network,
        priceUsd: parseFloat(attrs.price_usd) || 0,
        fdv: parseFloat(attrs.fdv_usd),
        volume24h: parseFloat(attrs.volume_usd?.h24 || 0),
        source: this.name,
        lastUpdated: Date.now(),
      };
    } catch (e) {
      return null;
    }
  }
}