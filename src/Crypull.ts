import { ICryptoProvider, PriceData, SearchResult, TokenInfo } from './types.js';
import { CoinGeckoProvider } from './providers/coingecko.js';
import { DexScreenerProvider } from './providers/dexscreener.js';
import { GeckoTerminalProvider } from './providers/geckoterminal.js';
import { BinanceProvider } from './providers/binance.js';

export interface CrypullOptions {
  providers?: ICryptoProvider[];
}

export class Crypull {
  private providers: ICryptoProvider[];
  private coinGecko = new CoinGeckoProvider();
  private dexScreener = new DexScreenerProvider();
  private geckoTerminal = new GeckoTerminalProvider();
  private binance = new BinanceProvider();

  constructor(options?: CrypullOptions) {
    this.providers = options?.providers || [
      this.binance,
      this.coinGecko,
      this.dexScreener,
      this.geckoTerminal
    ];
  }

  private isAddress(query: string): boolean {
    // Simple heuristic: starts with 0x and length 42, or Solana/Tron addresses
    return (query.startsWith('0x') && query.length === 42) || query.length > 30;
  }

  /**
   * Search for a token or coin across providers
   */
  async search(query: string): Promise<SearchResult[]> {
    const promises = [
      this.coinGecko.search(query),
      this.dexScreener.search(query)
    ];
    
    const results = await Promise.allSettled(promises);
    const combined: SearchResult[] = [];
    
    for (const res of results) {
      if (res.status === 'fulfilled' && res.value) {
        combined.push(...res.value);
      }
    }
    
    // Deduplicate by id/symbol
    const seen = new Set();
    return combined.filter(item => {
      const key = `${item.symbol}-${item.name}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  /**
   * Get the current price of a cryptocurrency
   * @param query Can be a symbol (e.g., 'BTC') or a contract address
   * @param network Optional network for DEX addresses (e.g., 'eth', 'bsc')
   */
  async price(query: string, network?: string): Promise<PriceData | null> {
    if (this.isAddress(query)) {
      // Try DEX providers first
      let res = await this.dexScreener.getPrice(query);
      if (res) return res;
      
      if (network) {
        res = await this.geckoTerminal.getPrice(query, network);
        if (res) return res;
      }
    } else {
      // Try CEX / broad providers first
      let res = await this.binance.getPrice(query);
      if (res) return res;

      res = await this.coinGecko.getPrice(query);
      if (res) return res;
    }
    return null;
  }

  /**
   * Get detailed token info (market cap, volume, liquidity, etc.)
   * @param query Can be a symbol (e.g., 'BTC') or a contract address
   * @param network Optional network for DEX addresses
   */
  async info(query: string, network?: string): Promise<TokenInfo | null> {
    if (this.isAddress(query)) {
      let res = await this.dexScreener.getTokenInfo(query);
      if (res) return res;

      if (network) {
        res = await this.geckoTerminal.getTokenInfo(query, network);
        if (res) return res;
      }
    } else {
      let res = await this.binance.getTokenInfo(query);
      // Binance doesn't provide FDV or deep token info, so let's fallback to CoinGecko for better info if needed
      // Actually, CoinGecko is better for general token info
      let cgRes = await this.coinGecko.getTokenInfo(query);
      if (cgRes) return cgRes;
      
      if (res) return res;
    }
    return null;
  }
}