<div align="center">

# 🚀 Crypull

**The Ultimate All-in-One Crypto API & CLI Tool**

*Fetch cryptocurrency prices, top coins, deep token analytics, historical charts, network gas, and market sentiment across multiple platforms instantly—all completely for free, with zero API keys required.*

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![NodeJS](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![npm](https://img.shields.io/badge/npm-CB3837?style=for-the-badge&logo=npm&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)

</div>

---

## 📖 Table of Contents
- [Why Crypull?](#-why-crypull)
- [Installation](#-installation)
- [💻 Command Line Interface (CLI) Guide](#-command-line-interface-cli-guide)
  - [1. Quick Price (`price`)](#1-get-a-quick-price)
  - [2. Deep Token Analytics (`info`)](#2-deep-token-analytics)
  - [3. Top 50 Cryptocurrencies (`top`)](#3-top-50-cryptocurrencies)
  - [4. Trending Coins (`trending`)](#4-trending-coins)
  - [5. Historical Charts (`chart`)](#5-historical-ascii-charts)
  - [6. Global Market Data (`market`)](#6-global-market-overview)
  - [7. Ethereum Gas Tracker (`gas`)](#7-ethereum-gas-tracker)
  - [8. Fear & Greed Index (`sentiment`)](#8-fear--greed-index)
- [🛠️ Usage in Your Project (TypeScript / Node.js)](#%EF%B8%8F-usage-in-your-project-typescript--nodejs)
  - [1. Import and Initialize](#1-import-and-initialize)
  - [2. Available API Methods](#2-available-api-methods)
  - [3. Customizing Providers](#3-customizing-providers)
- [Supported Providers](#-supported-providers)

---

## ✨ Why Crypull?

1. **Smart Routing:** It automatically detects if you're typing a symbol (like `BTC`) or a smart contract address (like `0x...`) and routes it to the correct provider.
2. **Zero Dependencies (Core):** Uses the native Node.js `fetch` API.
3. **100% Free APIs:** Pulls from CoinGecko, DexScreener, Binance, CoinCap, Coinpaprika, and CryptoCompare—no paid API keys required.
4. **DEX & CEX Coverage:** Finds both Top 100 exchange coins and brand new memecoins launching on Uniswap, Raydium, or PulseX.
5. **Beautiful CLI:** Built-in colored, heavily formatted terminal UI.

---

## 📦 Installation

To use it in your terminal as a global CLI tool:
```bash
npm install -g crypull
```

To use it inside your Node.js or TypeScript project:
```bash
npm install crypull
```

---

## 💻 Command Line Interface (CLI) Guide

Once installed globally, you can run `crypull` from anywhere in your terminal!

### 1. Get a Quick Price
Instantly fetch the current USD price of any symbol or contract address.
```bash
$ crypull price btc
$ crypull price 0x6982508145454Ce325dDbE47a25d4ec3d2311933
```

### 2. Deep Token Analytics
Get detailed info including market cap, rank, FDV, 24h volume, circulating supply, all-time highs/lows, top DEX trading pairs, and official social links.
```bash
$ crypull info eth
$ crypull info solana
```

### 3. Top 50 Cryptocurrencies
See a ranked, color-coded list of the Top 50 coins by global market capitalization.
```bash
$ crypull top
```

### 4. Trending Coins
See what the world is searching for! Fetches the top 10 most trending coins right now.
```bash
$ crypull trending
```

### 5. Historical ASCII Charts
Draw an actual historical price chart right inside your terminal!
```bash
# Draws a 7-day chart by default
$ crypull chart btc

# Draw a 30-day chart for Solana
$ crypull chart sol -d 30 
```

### 6. Global Market Overview
Get the total global cryptocurrency market cap, 24h volume, and BTC/ETH dominance percentages.
```bash
$ crypull market
```

### 7. Ethereum Gas Tracker
Check current Ethereum network congestion (Safe, Average, Fast) in Gwei.
```bash
$ crypull gas
```

### 8. Fear & Greed Index
Check current market sentiment (e.g., Extreme Fear vs. Extreme Greed).
```bash
$ crypull sentiment
```

---

## 🛠️ Usage in Your Project (TypeScript / Node.js)

Crypull is fully typed out of the box and works beautifully in any Node.js, Next.js, Express, or standard TypeScript project.

### 1. Import and Initialize

You can simply import the global, ready-to-use `crypull` instance and call its methods immediately.

**TypeScript / ES Modules (`import`)**
```typescript
import { crypull } from 'crypull';

async function fetchCryptoData() {
  // 1. Fetch a quick price
  const btcPrice = await crypull.price('BTC');
  console.log(`BTC Price: $${btcPrice?.priceUsd}`);

  // 2. Deep token info (works with contract addresses!)
  const pepeInfo = await crypull.info('0x6982508145454Ce325dDbE47a25d4ec3d2311933');
  console.log(`PEPE Market Cap: $${pepeInfo?.marketCap}`);
  console.log(`PEPE Volume 24h: $${pepeInfo?.volume24h}`);
}

fetchCryptoData();
```

**CommonJS (`require`)**
```javascript
const { crypull } = require('crypull');

async function run() {
  const ethPrice = await crypull.price('ethereum');
  console.log('ETH Price:', ethPrice.priceUsd);
}
run();
```

### 2. Available API Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `price(query: string)` | `Promise<PriceData>` | Get basic symbol and USD price. |
| `info(query: string)` | `Promise<TokenInfo>` | Massive payload including supplies, ATH/ATL, social links, and DEX pairs. |
| `search(query: string)` | `Promise<SearchResult[]>` | Find coins by name or symbol across multiple providers. |
| `top()` | `Promise<TopCoin[]>` | Get top 50 cryptocurrencies by market cap. |
| `trending()` | `Promise<TrendingCoin[]>` | Get top 10 currently trending/searched tokens. |
| `market()` | `Promise<GlobalMarketData>` | Global market cap, volume, and dominance metrics. |
| `chart(query: string, days?: number)`| `Promise<ChartData>` | Arrays of timestamps and prices for building custom charts. |
| `gas()` | `Promise<GasData>` | Current Ethereum Gwei prices. |
| `sentiment()` | `Promise<SentimentData>` | Fear and Greed index (0-100). |

### 3. Customizing Providers
By default, the global `crypull` instance smartly loops through all available providers until it finds the best data. If you want to explicitly restrict it to specific providers, you can instantiate your own class:

```typescript
import { Crypull, CoinGeckoProvider, BinanceProvider } from 'crypull';

// Create a custom instance that ONLY searches Binance and CoinGecko
const customCrypull = new Crypull({
  providers: [
    new BinanceProvider(),
    new CoinGeckoProvider()
  ]
});

const price = await customCrypull.price('ETH');
```

---

## 🌐 Supported Providers
Crypull queries data from the following platforms. It handles all rate-limits gracefully without requiring API keys.

- **Binance:** Extremely fast for top CEX pairs.
- **DexScreener:** Best for new and trending DEX tokens, contract addresses, and deep liquidity data.
- **CoinGecko:** Broadest coverage for general coins, historical market data, and descriptions.
- **Coinpaprika:** Provides extensive market data and supply metrics.
- **CoinCap:** Fast, real-time pricing and market activity.
- **CryptoCompare:** High-quality fallback market data.
- **GeckoTerminal:** Fallback for custom networks and liquidity pools not fully indexed elsewhere.

---

<div align="center">

**Built with ❤️ for Web3 Developers**

</div>