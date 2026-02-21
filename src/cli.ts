#!/usr/bin/env node
import { Command } from 'commander';
import pc from 'picocolors';
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
    if (data.fdv) {
      console.log(`${pc.gray('FDV:')}       ${pc.white('$' + data.fdv.toLocaleString())}`);
    }
    if (data.volume24h) {
      console.log(`${pc.gray('24h Vol:')}   ${pc.white('$' + data.volume24h.toLocaleString())}`);
    }
    if (data.liquidityUsd) {
      console.log(`${pc.gray('Liquidity:')} ${pc.white('$' + data.liquidityUsd.toLocaleString())}`);
    }
    if (data.network) {
      console.log(`${pc.gray('Network:')}   ${pc.magenta(data.network)}`);
    }
    if (data.address) {
      console.log(`${pc.gray('Address:')}   ${pc.gray(data.address)}`);
    }
    
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

program.parse(process.argv);