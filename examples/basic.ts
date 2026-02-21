import { crypull } from '../src/index.js';

async function main() {
  console.log('--- Crypull Basic Example ---');

  // 1. Fetching a price by symbol (Binance / CoinGecko)
  console.log('Fetching price for BTC...');
  const btcPrice = await crypull.price('BTC');
  console.log('BTC Price:', btcPrice);

  // 2. Fetching info by symbol
  console.log('\nFetching info for ETH...');
  const ethInfo = await crypull.info('ethereum');
  console.log('ETH Info:', ethInfo);

  // 3. Fetching DEX token info by address (DexScreener)
  // Example: PEPE on Ethereum
  console.log('\nFetching DEX token info for PEPE (0x6982508145454Ce325dDbE47a25d4ec3d2311933)...');
  const pepeInfo = await crypull.info('0x6982508145454Ce325dDbE47a25d4ec3d2311933');
  console.log('PEPE Info:', pepeInfo);

  // 4. Searching for a token
  console.log('\nSearching for "doge"...');
  const searchResults = await crypull.search('doge');
  console.log('Search Results:', searchResults.slice(0, 3)); // Show top 3
}

main().catch(console.error);