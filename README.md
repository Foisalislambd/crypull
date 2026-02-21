# Crypull

Crypull is an all-in-one Node.js + TypeScript package that allows users to fetch cryptocurrency prices, token info, and search across multiple free API platforms including **CoinGecko**, **DexScreener**, **GeckoTerminal**, and **Binance**.

It's designed to be extremely human-friendly, zero-dependency (using native `fetch`), and smart enough to route your queries to the best provider automatically.

## Installation

```bash
npm install crypull
```

## Features

- **Smart Routing:** Automatically detects whether your query is a symbol (like `BTC`) or a contract address (like `0x...`) and routes it to the most appropriate provider.
- **Multiple Providers:** Fetches data from Binance, CoinGecko, DexScreener, and GeckoTerminal to ensure maximum coverage for both CEX coins and new DEX tokens.
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

If you want to configure your own instance or limit the providers being used, you can instantiate the `Crypull` class:

```typescript
import { Crypull, CoinGeckoProvider, BinanceProvider } from 'crypull';

// Only use CoinGecko and Binance
const myCrypull = new Crypull({
  providers: [
    new BinanceProvider(),
    new CoinGeckoProvider()
  ]
});

const price = await myCrypull.price('ETH');
```

## API Reference

### `crypull.price(query: string, network?: string): Promise<PriceData | null>`
Fetches the basic price of a token. `query` can be a symbol or an address.

### `crypull.info(query: string, network?: string): Promise<TokenInfo | null>`
Fetches detailed info (market cap, FDV, 24h volume, liquidity).

### `crypull.search(query: string): Promise<SearchResult[]>`
Searches for tokens by name or symbol.

## Supported Providers
- **Binance:** Extremely fast for top CEX pairs.
- **CoinGecko:** Broadest coverage for general coins and historical market data.
- **DexScreener:** Best for new and trending DEX tokens, deep liquidity data.
- **GeckoTerminal:** Fallback for networks and tokens not fully indexed elsewhere.

## License
MIT
