const chalk = require('chalk');
const Table = require('cli-table3');

function getDirectionSymbol(value) {
  if (value < 0) {
    return '↓';
  }

  if (value > 0) {
    return '↑';
  }

  return '';
}

function formatDelta(delta) {
  if (delta === 0) {
    return '';
  }

  const colorFn = delta > 0 ? chalk.red : chalk.green;

  return colorFn(getDirectionSymbol(delta));
}

module.exports = async function cliReporter(result, date) {
  const table = new Table({
    colAligns: ['right', 'right', 'right', 'right'],
    head: ['Market', 'Stock', 'Current Value', `Change (Percent) - Since ${date}`],
  });

  Object.keys(result).forEach((market) => {
    Object.keys(result[market]).forEach((target) => {
      const stock = result[market][target];

      const { diff, currentValue } = stock;
      const { delta, percent } = diff;

      table.push([market, target, currentValue, formatDelta(+delta) + ' ' + delta + ' (' + percent + ')']);
    });
  });

  if (table.length > 0) {
    console.log(table.toString());
    return;
  }
};
