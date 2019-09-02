import fs from 'fs';
import path from 'path';
import nunjucks from 'nunjucks';
import context from './context';
import escapeWinPath from './utils/escapeWinPath';

export default function generateTransfer(configEntryName) {
  const { tmpDirPath, isDev, choerodonConfig: { master } } = context;

  const transferPath = path.join(tmpDirPath, `transfer.${configEntryName}.js`);
  const transferTemplate = fs.readFileSync(path.join(__dirname, './nunjucks/transfer.nunjucks.js')).toString();
  const exportPath = typeof master === 'object' ? master.exportPath : master;
  fs.writeFileSync(
    transferPath,
    nunjucks.renderString(transferTemplate, {
      exportPath: escapeWinPath(path.join(process.cwd(), exportPath)),
    }),
  );
}
