import getRunCmdEnv from './getRunCmdEnv';

export default function runCmd(cmd, args, fn) {
  const runner = require('child_process').spawn(cmd, args || [], {
    // keep color
    stdio: 'inherit',
    env: getRunCmdEnv(),
  });

  runner.on('close', (code) => {
    if (fn) {
      fn(code);
    }
  });
}
