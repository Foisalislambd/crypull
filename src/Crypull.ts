import { ICryptoProvider, PriceData, SearchResult, TokenInfo } from './types.js';
import { CoinGeckoProvider } from './providers/coingecko.js';
import { DexScreenerProvider } from './providers/dexscreener.js';
import { GeckoTerminalProvider } from './providers/geckoterminal.js';
import { BinanceProvider } from './providers/binance.js';
import { CoinpaprikaProvider } from './providers/coinpaprika.js';
import { CoinCapProvider } from './providers/coincap.js';
import { CryptoCompareProvider } from './providers/cryptocompare.js';

export interface CrypullOptions {
  providers?: ICryptoProvider[];
}

export class Crypull {
  public providers: ICryptoProvider[];
  
  // Standard free providers
  private coinGecko = new CoinGeckoProvider();
  private dexScreener = new DexScreenerProvider();
  private geckoTerminal = new GeckoTerminalProvider();
  private binance = new BinanceProvider();
  private coinpaprika = new CoinpaprikaProvider();
  private coincap = new CoinCapProvider();
  private cryptoCompare = new CryptoCompareProvider();

  constructor(options?: CrypullOptions) {
    this.providers = options?.providers || [
      this.binance,
      this.coinGecko,
      this.coinpaprika,
      this.coincap,
      this.dexScreener,
      this.geckoTerminal,
      this.cryptoCompare
    ];
  }

  private isAddress(query: string): boolean {
    return (query.startsWith('0x') && query.length === 42) || query.length > 30;
  }

  /**
   * Search for a token or coin across multiple providers in parallel
   */
  async search(query: string): Promise<SearchResult[]> {
    const promises = [
      this.coinGecko.search(query),
      this.dexScreener.search(query),
      this.coinpaprika.search(query),
      this.coincap.search(query)
    ];
    
    const results = await Promise.allSettled(promises);
    const combined: SearchResult[] = [];
    
    for (const res of results) {
      if (res.status === 'fulfilled' && res.value) {
        combined.push(...res.value);
      }
    }
    
    // Deduplicate by symbol to keep results clean
    const seen = new Set();
    return combined.filter(item => {
      const key = `${item.symbol}`;
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
      let res = await this.dexScreener.getPrice(query);
      if (res) return res;
      
      if (network) {
        res = await this.geckoTerminal.getPrice(query, network);
        if (res) return res;
      }
    } else {
      // Fast top-tier providers first
      let res = await this.binance.getPrice(query);
      if (res) return res;

      res = await this.coincap.getPrice(query);
      if (res) return res;

      res = await this.coinGecko.getPrice(query);
      if (res) return res;

      res = await this.coinpaprika.getPrice(query);
      if (res) return res;

      res = await this.cryptoCompare.getPrice(query);
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
      // Attempt in order of best info
      let res = await this.coinGecko.getTokenInfo(query);
      if (res) return res;

      res = await this.coinpaprika.getTokenInfo(query);
      if (res) return res;

      res = await this.coincap.getTokenInfo(query);
      if (res) return res;

      res = await this.binance.getTokenInfo(query);
      if (res) return res;

      res = await this.cryptoCompare.getTokenInfo(query);
      if (res) return res;
    }
    return null;
  }
}