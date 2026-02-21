# Crypull

Crypull is an all-in-one Node.js + TypeScript package that allows users to fetch cryptocurrency prices, token info, and search across multiple free API platforms including **CoinGecko**, **DexScreener**, **GeckoTerminal**, **Binance**, **Coinpaprika**, **CoinCap**, and **CryptoCompare**.

It's designed to be extremely human-friendly, zero-dependency (using native `fetch`), and smart enough to route your queries to the best provider automatically. It gracefully handles public APIs without requiring you to set up any API keys at all.

## Installation

```bash
npm install crypull
```

Or install it globally to use the CLI:

```bash
npm install -g crypull
```

## CLI Usage

Crypull comes with a beautiful, built-in CLI for terminal use:

```bash
# Get the quick price of a token or coin
$ crypull price btc
$ crypull price 0x6982508145454Ce325dDbE47a25d4ec3d2311933

# Get deep info (market cap, volume, FDV, liquidity, etc.)
$ crypull info eth
$ crypull info solana

# Search for tokens
$ crypull search doge
```

## Features

- **Smart Routing:** Automatically detects whether your query is a symbol (like `BTC`) or a contract address (like `0x...`) and routes it to the most appropriate provider.
- **Multiple Providers:** Fetches data from Binance, CoinGecko, DexScreener, GeckoTerminal, Coinpaprika, CoinCap, and CryptoCompare. Ensures maximum coverage for both CEX coins and new DEX tokens.
- **Zero Dependencies:** Uses the native Node.js `fetch` API.
- **TypeScript Native:** Fully typed responses out of the box.

## Usage

### 1. Quick Start

You can import the `crypull` instance and start using it immediately:

```typescript
import { crypull } from 'crypull';

async function run() {
  // Get a quick price (uses Binance or CoinGecko)
  const btcPrice = await crypull.price('BTC');
  console.log(btcPrice);
  /*
  {
    symbol: 'BTC',
    priceUsd: 68151,
    source: 'CoinGecko',
    lastUpdated: 1771668193876
  }
  */

  // Get deep info about a DEX token using its contract address (uses DexScreener/GeckoTerminal)
  const pepeInfo = await crypull.info('0x6982508145454Ce325dDbE47a25d4ec3d2311933');
  console.log(pepeInfo);
  /*
  {
    name: 'Pepe',
    symbol: 'PEPE',
    address: '0x6982508145454Ce325dDbE47a25d4ec3d2311933',
    network: 'ethereum',
    priceUsd: 0.000004357,
    fdv: 1803179926,
    volume24h: 2042027.7,
    liquidityUsd: 26564282.5,
    source: 'DexScreener',
    ...
  }
  */
}
```

### 2. Searching

Search across multiple platforms seamlessly:

```typescript
import { crypull } from 'crypull';

const results = await crypull.search('doge');
console.log(results);
/*
[
  { id: 'dogecoin', name: 'Dogecoin', symbol: 'DOGE', source: 'CoinGecko' },
  { id: 'baby-doge-coin', name: 'Baby Doge Coin', symbol: 'BABYDOGE', source: 'CoinGecko' },
  ...
]
*/
```

### 3. Custom Instances

If you want to configure your own instance or explicitly limit the providers being used, you can instantiate the `Crypull` class:

```typescript
import { Crypull, CoinGeckoProvider, BinanceProvider } from 'crypull';

// Define exactly which providers you want to use
const customCrypull = new Crypull({
  providers: [
    new BinanceProvider(),
    new CoinGeckoProvider()
  ]
});

const price = await customCrypull.price('ETH');
```

## API Reference

### `crypull.price(query: string, network?: string): Promise<PriceData | null>`
Fetches the basic price of a token. `query` can be a symbol or an address.

### `crypull.info(query: string, network?: string): Promise<TokenInfo | null>`
Fetches detailed info including market cap, rank, FDV, circulating/total supplies, 24h volume, liquidity, price changes, all-time high/low, social links, and descriptions.

### `crypull.search(query: string): Promise<SearchResult[]>`
Searches for tokens by name or symbol.

## Supported Providers
- **Coinpaprika:** Provides extensive market data for free without an API key.
- **CoinCap:** Fast, real-time pricing and market activity API.
- **CryptoCompare:** High-quality market data (works completely free without an API key).
- **Binance:** Extremely fast for top CEX pairs.
- **CoinGecko:** Broadest coverage for general coins and historical market data.
- **DexScreener:** Best for new and trending DEX tokens, deep liquidity data.
- **GeckoTerminal:** Fallback for networks and tokens not fully indexed elsewhere.

## License
MIT
