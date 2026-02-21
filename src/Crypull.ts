import { ChartData, DexPairInfo, GasData, GlobalMarketData, ICryptoProvider, PriceData, SearchResult, SentimentData, TokenInfo, TrendingCoin, TopCoin } from './types.js';
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

  /**
   * Get global market data
   */
  async market(): Promise<GlobalMarketData | null> {
    try {
      const res = await fetch(`https://api.coingecko.com/api/v3/global`);
      if (!res.ok) return null;
      const data = await res.json();
      const d = data.data;

      return {
        totalMarketCapUsd: d.total_market_cap.usd,
        totalVolume24hUsd: d.total_volume.usd,
        bitcoinDominancePercentage: d.market_cap_percentage.btc,
        ethereumDominancePercentage: d.market_cap_percentage.eth,
        activeCryptocurrencies: d.active_cryptocurrencies,
        lastUpdated: d.updated_at * 1000,
      };
    } catch (e) {
      return null;
    }
  }

  /**
   * Get trending coins
   */
  async trending(): Promise<TrendingCoin[]> {
    try {
      const res = await fetch(`https://api.coingecko.com/api/v3/search/trending`);
      if (!res.ok) return [];
      const data = await res.json();

      return data.coins.slice(0, 10).map((c: any) => ({
        id: c.item.id,
        name: c.item.name,
        symbol: c.item.symbol.toUpperCase(),
        marketCapRank: c.item.market_cap_rank,
        priceUsd: c.item.data?.price,
        priceChange24h: c.item.data?.price_change_percentage_24h?.usd,
        volume24h: c.item.data?.total_volume,
      }));
    } catch (e) {
      return [];
    }
  }

  /**
   * Get top 50 coins by market cap
   */
  async top(): Promise<TopCoin[]> {
    try {
      const res = await fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1&sparkline=false`);
      if (!res.ok) return [];
      const data = await res.json();

      return data.map((c: any) => ({
        id: c.id,
        name: c.name,
        symbol: c.symbol.toUpperCase(),
        marketCapRank: c.market_cap_rank,
        priceUsd: c.current_price,
        marketCap: c.market_cap,
        volume24h: c.total_volume,
        priceChange24h: c.price_change_percentage_24h,
      }));
    } catch (e) {
      return [];
    }
  }

  /**
   * Get fear and greed index
   */
  async sentiment(): Promise<SentimentData | null> {
    try {
      const res = await fetch(`https://api.alternative.me/fng/?limit=1`);
      if (!res.ok) return null;
      const data = await res.json();
      const item = data.data[0];

      return {
        value: parseInt(item.value),
        classification: item.value_classification,
        lastUpdated: parseInt(item.timestamp) * 1000,
      };
    } catch (e) {
      return null;
    }
  }

  /**
   * Get current ethereum gas prices (in Gwei)
   */
  async gas(): Promise<GasData | null> {
    try {
      // Using Etherscan public API (rate limited but works for basic usage)
      const res = await fetch(`https://api.etherscan.io/api?module=gastracker&action=gasoracle`);
      if (!res.ok) return null;
      const data = await res.json();
      
      if (data.status !== '1') return null;

      return {
        network: 'Ethereum',
        low: parseFloat(data.result.SafeGasPrice),
        average: parseFloat(data.result.ProposeGasPrice),
        high: parseFloat(data.result.FastGasPrice),
        baseFee: parseFloat(data.result.suggestBaseFee),
      };
    } catch (e) {
      return null;
    }
  }

  /**
   * Get historical chart data for a coin
   * @param query Coin symbol or ID
   * @param days Number of days (e.g. 1, 7, 30)
   */
  async chart(query: string, days: number = 7): Promise<ChartData | null> {
    try {
      let id = query.toLowerCase();
      // Try to find the correct coingecko ID if a symbol is passed
      const searchRes = await this.coinGecko.search(id);
      const match = searchRes.find(s => s.symbol.toLowerCase() === id || s.id === id);
      if (match && match.id) {
        id = match.id;
      }

      const res = await fetch(`https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=usd&days=${days}`);
      if (!res.ok) return null;
      const data = await res.json();

      if (!data.prices || data.prices.length === 0) return null;

      const prices = data.prices.map((p: any) => p[1]);
      const timestamps = data.prices.map((p: any) => p[0]);

      return {
        prices,
        timestamps,
        minPrice: Math.min(...prices),
        maxPrice: Math.max(...prices),
      };
    } catch (e) {
      return null;
    }
  }
}