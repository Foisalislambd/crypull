#!/usr/bin/env node
import { Command } from 'commander';
import pc from 'picocolors';
import * as asciichart from 'asciichart';
import { crypull } from './index.js';

const program = new Command();

program
  .name('crypull')
  .description('A human-friendly CLI to fetch crypto prices and info from multiple providers')
  .version('1.0.0');

program
  .command('price <query>')
  .description('Get the current price of a cryptocurrency (symbol or contract address)')
  .action(async (query: string) => {
    console.log(pc.cyan(`\nFetching price for ${pc.bold(query)}...`));
    
    const data = await crypull.price(query);
    
    if (!data) {
      console.log(pc.red(`\n✖ Could not find price for "${query}".`));
      return;
    }

    console.log(pc.green(`\n✔ Success! Found via ${pc.bold(data.source)}`));
    console.log(pc.white(`----------------------------------------`));
    console.log(`${pc.gray('Symbol:')}    ${pc.yellow(pc.bold(data.symbol))}`);
    console.log(`${pc.gray('Price:')}     ${pc.green('$' + data.priceUsd.toLocaleString(undefined, { maximumFractionDigits: 6 }))}`);
    console.log(`${pc.gray('Updated:')}   ${new Date(data.lastUpdated).toLocaleTimeString()}`);
    console.log(pc.white(`----------------------------------------\n`));
  });

program
  .command('info <query>')
  .description('Get detailed info about a cryptocurrency (market cap, volume, FDV, etc.)')
  .action(async (query: string) => {
    console.log(pc.cyan(`\nFetching detailed info for ${pc.bold(query)}...`));
    
    const data = await crypull.info(query);
    
    if (!data) {
      console.log(pc.red(`\n✖ Could not find info for "${query}".`));
      return;
    }

    console.log(pc.green(`\n✔ Success! Found via ${pc.bold(data.source)}`));
    console.log(pc.white(`----------------------------------------`));
    console.log(`${pc.gray('Name:')}      ${pc.white(pc.bold(data.name))}`);
    console.log(`${pc.gray('Symbol:')}    ${pc.yellow(pc.bold(data.symbol))}`);
    console.log(`${pc.gray('Price:')}     ${pc.green('$' + data.priceUsd.toLocaleString(undefined, { maximumFractionDigits: 6 }))}`);
    
    if (data.marketCap) {
      console.log(`${pc.gray('MarketCap:')} ${pc.white('$' + data.marketCap.toLocaleString())}`);
    }
    if (data.marketCapRank) {
      console.log(`${pc.gray('Rank:')}      ${pc.magenta('#' + data.marketCapRank)}`);
    }
    if (data.fdv) {
      console.log(`${pc.gray('FDV:')}       ${pc.white('$' + data.fdv.toLocaleString())}`);
    }
    if (data.circulatingSupply) {
      console.log(`${pc.gray('Circ. Sup:')} ${pc.white(data.circulatingSupply.toLocaleString())}`);
    }
    if (data.totalSupply) {
      console.log(`${pc.gray('Total Sup:')} ${pc.white(data.totalSupply.toLocaleString())}`);
    }
    if (data.maxSupply) {
      console.log(`${pc.gray('Max Sup:')}   ${pc.white(data.maxSupply.toLocaleString())}`);
    }
    if (data.volume24h) {
      console.log(`${pc.gray('24h Vol:')}   ${pc.white('$' + data.volume24h.toLocaleString())}`);
    }
    if (data.priceChangePercentage24h !== undefined) {
      const pc24 = data.priceChangePercentage24h;
      const color = pc24 >= 0 ? pc.green : pc.red;
      console.log(`${pc.gray('24h %:')}     ${color(pc24.toFixed(2) + '%')}`);
    }
    if (data.liquidityUsd) {
      console.log(`${pc.gray('Liquidity:')} ${pc.white('$' + data.liquidityUsd.toLocaleString())}`);
    }
    if (data.ath) {
      console.log(`${pc.gray('ATH:')}       ${pc.green('$' + data.ath.toLocaleString())} ${data.athDate ? pc.gray(`(${new Date(data.athDate).toLocaleDateString()})`) : ''}`);
    }
    if (data.atl) {
      console.log(`${pc.gray('ATL:')}       ${pc.red('$' + data.atl.toLocaleString())} ${data.atlDate ? pc.gray(`(${new Date(data.atlDate).toLocaleDateString()})`) : ''}`);
    }
    if (data.network) {
      console.log(`${pc.gray('Network:')}   ${pc.magenta(data.network)}`);
    }
    if (data.address) {
      console.log(`${pc.gray('Address:')}   ${pc.gray(data.address)}`);
    }

    if (data.links && Object.values(data.links).some(l => !!l)) {
      console.log(pc.white(`\n--- Links ---`));
      if (data.links.website) console.log(`${pc.gray('Website:')}   ${pc.blue(data.links.website)}`);
      if (data.links.twitter) console.log(`${pc.gray('Twitter:')}   ${pc.blue(data.links.twitter)}`);
      if (data.links.telegram) console.log(`${pc.gray('Telegram:')}  ${pc.blue(data.links.telegram)}`);
      if (data.links.discord) console.log(`${pc.gray('Discord:')}   ${pc.blue(data.links.discord)}`);
      if (data.links.github) console.log(`${pc.gray('GitHub:')}    ${pc.blue(data.links.github)}`);
    }

    if (data.description && data.description.length > 0) {
      console.log(pc.white(`\n--- Description ---`));
      // Truncate to 300 chars to not flood terminal
      const desc = data.description.replace(/(<([^>]+)>)/gi, ""); // strip html
      const truncated = desc.length > 300 ? desc.substring(0, 300) + '...' : desc;
      console.log(pc.gray(truncated));
    }

    if (data.pairs && data.pairs.length > 0) {
      console.log(pc.white(`\n--- Top Trading Pairs ---`));
      data.pairs.slice(0, 5).forEach((p, i) => {
        const title = `${p.baseTokenSymbol}/${p.quoteTokenSymbol}`;
        const priceStr = p.priceUsd ? `$${p.priceUsd.toLocaleString(undefined, { maximumFractionDigits: 6 })}` : 'N/A';
        const volStr = p.volume24h ? `$${p.volume24h.toLocaleString(undefined, { maximumFractionDigits: 0 })}` : 'N/A';
        console.log(`${pc.blue(String(i + 1) + '.')} ${pc.yellow(title.padEnd(12, ' '))} | ${pc.green(priceStr.padEnd(12, ' '))} | Vol: ${pc.white(volStr)} | DEX: ${pc.magenta(p.dexId)}`);
      });
    }
    
    console.log(pc.white(`\n----------------------------------------`));
    console.log(`${pc.gray('Updated:')}   ${new Date(data.lastUpdated).toLocaleTimeString()}`);
    console.log(pc.white(`----------------------------------------\n`));
  });

program
  .command('search <query>')
  .description('Search for tokens or coins across multiple providers')
  .action(async (query: string) => {
    console.log(pc.cyan(`\nSearching for ${pc.bold(query)}...`));
    
    const results = await crypull.search(query);
    
    if (!results || results.length === 0) {
      console.log(pc.red(`\n✖ No results found for "${query}".`));
      return;
    }

    console.log(pc.green(`\n✔ Found ${results.length} results:`));
    console.log(pc.white(`----------------------------------------`));
    
    results.forEach((res, i) => {
      console.log(`${pc.blue(String(i + 1).padStart(2, ' '))}. ${pc.yellow(pc.bold(res.symbol.padEnd(8, ' ')))} | ${pc.white(res.name)} ${pc.gray(`(via ${res.source})`)}`);
      if (res.network) {
        console.log(`    ${pc.gray('Network:')} ${pc.magenta(res.network)}`);
      }
      if (res.id && res.id.length > 20) {
        console.log(`    ${pc.gray('Address:')} ${pc.gray(res.id)}`);
      }
    });
    
    console.log(pc.white(`----------------------------------------\n`));
  });

program
  .command('trending')
  .description('Show top 10 trending coins/tokens right now')
  .action(async () => {
    console.log(pc.cyan(`\nFetching top trending coins...`));
    
    const results = await crypull.trending();
    
    if (!results || results.length === 0) {
      console.log(pc.red(`\n✖ Could not fetch trending data at this time.`));
      return;
    }

    console.log(pc.green(`\n✔ Top 10 Trending Coins:`));
    console.log(pc.white(`----------------------------------------`));
    
    results.forEach((res, i) => {
      const priceStr = res.priceUsd ? `$${res.priceUsd.toLocaleString(undefined, { maximumFractionDigits: 6 })}` : 'N/A';
      let changeStr = '';
      if (res.priceChange24h !== undefined) {
        const color = res.priceChange24h >= 0 ? pc.green : pc.red;
        changeStr = color(`(${res.priceChange24h >= 0 ? '+' : ''}${res.priceChange24h.toFixed(2)}%)`);
      }
      const rankStr = res.marketCapRank ? pc.magenta(`#${res.marketCapRank}`) : '';
      
      console.log(`${pc.blue(String(i + 1).padStart(2, ' '))}. ${pc.yellow(pc.bold(res.symbol.padEnd(8, ' ')))} | ${pc.green(priceStr.padEnd(12, ' '))} ${changeStr.padEnd(15, ' ')} | ${rankStr}`);
    });
    
    console.log(pc.white(`----------------------------------------\n`));
  });

program
  .command('market')
  .description('Show global cryptocurrency market overview')
  .action(async () => {
    console.log(pc.cyan(`\nFetching global market data...`));
    
    const data = await crypull.market();
    
    if (!data) {
      console.log(pc.red(`\n✖ Could not fetch global market data at this time.`));
      return;
    }

    console.log(pc.green(`\n✔ Global Market Overview:`));
    console.log(pc.white(`----------------------------------------`));
    console.log(`${pc.gray('Total Market Cap:')} ${pc.white('$' + data.totalMarketCapUsd.toLocaleString())}`);
    console.log(`${pc.gray('24h Volume:')}       ${pc.white('$' + data.totalVolume24hUsd.toLocaleString())}`);
    console.log(`${pc.gray('BTC Dominance:')}    ${pc.yellow(data.bitcoinDominancePercentage.toFixed(2) + '%')}`);
    console.log(`${pc.gray('ETH Dominance:')}    ${pc.blue(data.ethereumDominancePercentage.toFixed(2) + '%')}`);
    console.log(`${pc.gray('Active Coins:')}     ${pc.white(data.activeCryptocurrencies.toLocaleString())}`);
    console.log(pc.white(`----------------------------------------`));
    console.log(`${pc.gray('Updated:')}          ${new Date(data.lastUpdated).toLocaleTimeString()}`);
    console.log(pc.white(`----------------------------------------\n`));
  });

program
  .command('sentiment')
  .description('Show current Crypto Fear & Greed Index')
  .action(async () => {
    console.log(pc.cyan(`\nFetching Fear & Greed Index...`));
    
    const data = await crypull.sentiment();
    
    if (!data) {
      console.log(pc.red(`\n✖ Could not fetch sentiment data at this time.`));
      return;
    }

    const value = data.value;
    let color = pc.white;
    if (value <= 25) color = pc.red;
    else if (value <= 45) color = pc.yellow;
    else if (value <= 55) color = pc.white;
    else if (value <= 75) color = pc.green;
    else color = pc.blue;

    console.log(pc.green(`\n✔ Current Market Sentiment:`));
    console.log(pc.white(`----------------------------------------`));
    console.log(`${pc.gray('Score:')}          ${color(pc.bold(value.toString()) + ' / 100')}`);
    console.log(`${pc.gray('Classification:')} ${color(pc.bold(data.classification))}`);
    console.log(pc.white(`----------------------------------------\n`));
  });

program
  .command('gas')
  .description('Show current Ethereum network gas prices')
  .action(async () => {
    console.log(pc.cyan(`\nFetching network gas prices...`));
    
    const data = await crypull.gas();
    
    if (!data) {
      console.log(pc.red(`\n✖ Could not fetch gas prices at this time.`));
      return;
    }

    console.log(pc.green(`\n✔ ${data.network} Gas Tracker (Gwei):`));
    console.log(pc.white(`----------------------------------------`));
    console.log(`${pc.gray('Low (Safe):')}     ${pc.green(data.low + ' gwei')}`);
    console.log(`${pc.gray('Average:')}        ${pc.yellow(data.average + ' gwei')}`);
    console.log(`${pc.gray('High (Fast):')}    ${pc.red(data.high + ' gwei')}`);
    if (data.baseFee) {
      console.log(`${pc.gray('Base Fee:')}       ${pc.white(data.baseFee + ' gwei')}`);
    }
    console.log(pc.white(`----------------------------------------\n`));
  });

program
  .command('chart <query>')
  .description('Draw a terminal ASCII chart of historical prices')
  .option('-d, --days <days>', 'Number of days to chart', '7')
  .action(async (query: string, options) => {
    const days = parseInt(options.days) || 7;
    console.log(pc.cyan(`\nFetching ${days}-day chart data for ${pc.bold(query)}...`));
    
    const data = await crypull.chart(query, days);
    
    if (!data || !data.prices || data.prices.length === 0) {
      console.log(pc.red(`\n✖ Could not fetch chart data for "${query}". Note: Charts may only be available for major coins.`));
      return;
    }

    // Determine color based on price action
    const firstPrice = data.prices[0];
    const lastPrice = data.prices[data.prices.length - 1];
    const isUp = lastPrice >= firstPrice;
    
    const chartConfig = {
      colors: [isUp ? asciichart.lightgreen : asciichart.lightred],
      height: 10
    };

    console.log(pc.green(`\n✔ ${days}-Day Chart for ${query.toUpperCase()}:`));
    console.log(pc.gray(`Min: $${data.minPrice.toLocaleString(undefined, { maximumFractionDigits: 6 })} | Max: $${data.maxPrice.toLocaleString(undefined, { maximumFractionDigits: 6 })}`));
    console.log(pc.white(`\n` + asciichart.plot(data.prices, chartConfig) + `\n`));
  });

program.parse(process.argv);