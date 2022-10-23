const chalk = require('chalk');
const path = require('path');
const fs = require('fs').promises;
const yahooFinance = require('yahoo-finance');
const cliReporter = require('../reporter/cliReporter');

const getStockData = (exchange, date, stock) =>
  new Promise((resolve, reject) => {
    yahooFinance.historical(
      {
        symbol: exchange === 'US' ? stock : `${stock}.${exchange}`,
        from: new Date(date),
        to: '2022-10-23',
      },
      function (err, quotes) {
        if (err) {
          reject(err);
        }
        resolve(quotes);
      },
    );
  });

function financial(x) {
  return Number.parseFloat(x).toFixed(2);
}

async function compareReports(options) {
  const { output, date, quiet } = options;

  const dataSetPath = path.resolve(process.cwd(), 'stock.json');
  const _stockData = await fs.readFile(dataSetPath, 'utf-8');
  const stockData = JSON.parse(_stockData);

  const results = await Object.keys(stockData).reduce(async (result, exchange) => {
    let resolvedResult = await result;
    resolvedResult[exchange] = await stockData[exchange].reduce(async (acc, market) => {
      let resolvedAcc = await acc;
      const stockData = await getStockData(exchange, date, market);

      const lastestData = stockData[0];
      const targeteData = stockData[stockData.length - 1];

      resolvedAcc[market] = {
        symbol: lastestData.symbol,
        currentValue: lastestData.close,
        diff: {
          delta: financial(lastestData.close - targeteData.close),
          percent: `${financial(((lastestData.close - targeteData.close) / targeteData.close) * 100)}%`,
        },
      };
      return resolvedAcc;
    }, Promise.resolve({}));

    return resolvedResult;
  }, {});

  switch (output) {
    case 'cli': {
      cliReporter(results, date);
      break;
    }
    default:
      break;
  }

  console.log(`${chalk.green('[✔]')} Finished!`);
}

const api = {
  command: 'compare',
  describe: 'compare current value and specific date value results',
  builder: {
    output: {
      alias: 'o',
      type: 'string',
      description: 'defines a reporter to produce output',
      default: 'cli',
    },
    date: {
      alias: 'd',
      type: 'string',
      description: 'defines a specific date that you want to compare',
    },
  },
  handler: compareReports,
};

module.exports = api;
