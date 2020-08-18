const address = require('address');
const url = require('url');
const chalk = require('chalk');
const detect = require('detect-port-alt');
const isRoot = require('is-root');
const inquirer = require('inquirer');
const forkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const clearConsole = require('./clearConsole');
const formatWebpackMessages = require('./formatWebpackMessages');
const getProcessForPort = require('./getProcessForPort');
const typescriptFormatter = require('./typescriptFormatter');

const isInteractive = process.stdout.isTTY;

function prepareUrls(protocol, host, port, pathname = '/') {
  const formatUrl = (hostname) => url.format({
    protocol,
    hostname,
    port,
    pathname,
  });
  const prettyPrintUrl = (hostname) => url.format({
    protocol,
    hostname,
    port: chalk.bold(port),
    pathname,
  });

  const isUnspecifiedHost = host === '0.0.0.0' || host === '::';
  let prettyHost; let lanUrlForConfig; let
    lanUrlForTerminal;
  if (isUnspecifiedHost) {
    prettyHost = 'localhost';
    try {
      // This can only return an IPv4 address
      lanUrlForConfig = address.ip();
      if (lanUrlForConfig) {
        // Check if the address is a private ip
        // https://en.wikipedia.org/wiki/Private_network#Private_IPv4_address_spaces
        if (
          /^10[.]|^172[.](1[6-9]|2[0-9]|3[0-1])[.]|^192[.]168[.]/.test(
            lanUrlForConfig,
          )
        ) {
          // Address is private, format it for later use
          lanUrlForTerminal = prettyPrintUrl(lanUrlForConfig);
        } else {
          // Address is not private, so we will discard it
          lanUrlForConfig = undefined;
        }
      }
    } catch (_e) {
      // ignored
    }
  } else {
    prettyHost = host;
  }
  const localUrlForTerminal = prettyPrintUrl(prettyHost);
  const localUrlForBrowser = formatUrl(prettyHost);
  return {
    lanUrlForConfig,
    lanUrlForTerminal,
    localUrlForTerminal,
    localUrlForBrowser,
  };
}

function printInstructions(appName, urls) {
  console.log();
  console.log(`You can now view ${chalk.bold(appName)} in the browser.`);
  console.log();

  if (urls.lanUrlForTerminal) {
    console.log(
      `  ${chalk.bold('Local:')}            ${urls.localUrlForTerminal}`,
    );
    console.log(
      `  ${chalk.bold('On Your Network:')}  ${urls.lanUrlForTerminal}`,
    );
  } else {
    console.log(`  ${urls.localUrlForTerminal}`);
  }

  console.log();
}

function createCompiler({
  appName,
  config,
  devSocket,
  urls,
  useTypeScript,
  tscCompileOnError,
  webpack,
}) {
  // "Compiler" is a low-level interface to webpack.
  // It lets us listen to some events and provide our own custom messages.
  let compiler;
  try {
    compiler = webpack(config);
  } catch (err) {
    console.log(chalk.red('Failed to compile.'));
    console.log();
    console.log(err.message || err);
    console.log();
    process.exit(1);
  }

  // "invalid" event fires when you have changed a file, and webpack is
  // recompiling a bundle. WebpackDevServer takes care to pause serving the
  // bundle, so if you refresh, it'll wait instead of serving the old one.
  // "invalid" is short for "bundle invalidated", it doesn't imply any errors.
  compiler.hooks.invalid.tap('invalid', () => {
    if (isInteractive) {
      clearConsole();
    }
    console.log('Compiling...');
  });

  let isFirstCompile = true;
  let tsMessagesPromise;
  let tsMessagesResolver;

  if (useTypeScript) {
    compiler.hooks.beforeCompile.tap('beforeCompile', () => {
      tsMessagesPromise = new Promise((resolve) => {
        tsMessagesResolver = (msgs) => resolve(msgs);
      });
    });
    forkTsCheckerWebpackPlugin
      .getCompilerHooks(compiler)
      .receive.tap('afterTypeScriptCheck', (diagnostics, lints) => {
        const allMsgs = [...diagnostics, ...lints];
        const format = (message) => `${message.file}\n${typescriptFormatter(message, true)}`;

        tsMessagesResolver({
          errors: allMsgs.filter((msg) => msg.severity === 'error').map(format),
          warnings: allMsgs
            .filter((msg) => msg.severity === 'warning')
            .map(format),
        });
      });
  }

  // "done" event fires when webpack has finished recompiling the bundle.
  // Whether or not you have warnings or errors, you will get this event.
  compiler.hooks.done.tap('done', async (stats) => {
    if (isInteractive) {
      clearConsole();
    }

    // We have switched off the default webpack output in WebpackDevServer
    // options so we are going to "massage" the warnings and errors and present
    // them in a readable focused way.
    // We only construct the warnings and errors for speed:
    // https://github.com/facebook/create-react-app/issues/4492#issuecomment-421959548
    const statsData = stats.toJson({
      all: false,
      warnings: true,
      errors: true,
    });

    if (useTypeScript && statsData.errors.length === 0) {
      const delayedMsg = setTimeout(() => {
        console.log(
          chalk.yellow(
            'Files successfully emitted, waiting for typecheck results...',
          ),
        );
      }, 100);

      const messages = await tsMessagesPromise;
      clearTimeout(delayedMsg);
      if (tscCompileOnError) {
        statsData.warnings.push(...messages.errors);
      } else {
        statsData.errors.push(...messages.errors);
      }
      statsData.warnings.push(...messages.warnings);

      // Push errors and warnings into compilation result
      // to show them after page refresh triggered by user.
      if (tscCompileOnError) {
        stats.compilation.warnings.push(...messages.errors);
      } else {
        stats.compilation.errors.push(...messages.errors);
      }
      stats.compilation.warnings.push(...messages.warnings);

      if (messages.errors.length > 0) {
        if (tscCompileOnError) {
          devSocket.warnings(messages.errors);
        } else {
          devSocket.errors(messages.errors);
        }
      } else if (messages.warnings.length > 0) {
        devSocket.warnings(messages.warnings);
      }

      if (isInteractive) {
        clearConsole();
      }
    }

    const messages = formatWebpackMessages(statsData);
    const isSuccessful = !messages.errors.length && !messages.warnings.length;
    if (isSuccessful) {
      console.log(chalk.green('Compiled successfully!'));
    }
    if (isSuccessful && (isInteractive || isFirstCompile)) {
      printInstructions(appName, urls);
    }
    isFirstCompile = false;

    // If errors exist, only show errors.
    if (messages.errors.length) {
      // Only keep the first error. Others are often indicative
      // of the same problem, but confuse the reader with noise.
      if (messages.errors.length > 1) {
        messages.errors.length = 1;
      }
      console.log(chalk.red('Failed to compile.\n'));
      console.log(messages.errors.join('\n\n'));
      return;
    }

    // Show warnings if no errors were found.
    if (messages.warnings.length) {
      console.log(chalk.yellow('Compiled with warnings.\n'));
      console.log(messages.warnings.join('\n\n'));

      // Teach some ESLint tricks.
      console.log(
        `\nSearch for the ${
          chalk.underline(chalk.yellow('keywords'))
        } to learn more about each warning.`,
      );
      console.log(
        `To ignore, add ${
          chalk.cyan('// eslint-disable-next-line')
        } to the line before.\n`,
      );
    }
  });
  return compiler;
}
function choosePort(host, defaultPort) {
  return detect(defaultPort, host).then(
    (port) => new Promise((resolve) => {
      if (port === defaultPort) {
        return resolve(port);
      }
      const message = process.platform !== 'win32' && defaultPort < 1024 && !isRoot()
        ? 'Admin permissions are required to run a server on a port below 1024.'
        : `Something is already running on port ${defaultPort}.`;
      if (isInteractive) {
        clearConsole();
        const existingProcess = getProcessForPort(defaultPort);
        const question = {
          type: 'confirm',
          name: 'shouldChangePort',
          message:
              `${chalk.yellow(
                `${message
                }${existingProcess ? ` Probably:\n  ${existingProcess}` : ''}`,
              )}\n\nWould you like to run the app on another port instead?`,
          default: true,
        };
        inquirer.prompt(question).then((answer) => {
          if (answer.shouldChangePort) {
            resolve(port);
          } else {
            resolve(null);
          }
        });
      } else {
        console.log(chalk.red(message));
        resolve(null);
      }
    }),
    (err) => {
      throw new Error(
        `${chalk.red(`Could not find an open port at ${chalk.bold(host)}.`)
        }\n${
          `Network error message: ${err.message}` || err
        }\n`,
      );
    },
  );
}

module.exports = {
  choosePort,
  createCompiler,
  prepareUrls,
};
