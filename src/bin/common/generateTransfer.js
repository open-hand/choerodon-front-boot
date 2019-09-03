import fs from 'fs';
import path from 'path';
import nunjucks from 'nunjucks';
import context from './context';
import escapeWinPath from './utils/escapeWinPath';

const babelParse = require('@babel/parser').parse;
const traverse = require('babel-traverse').default;
const generate = require('babel-generator').default;

const { join } = path;

function astFunction(exportPath) {
  if (!exportPath) return null;
  const code = fs.readFileSync(exportPath, 'utf8');
  const ast = babelParse(code, {
    sourceType: 'module',
    allowImportExportEverywhere: true,
    plugins: [
      'dynamicImport',
      'jsx',
    ],
  });

  traverse(ast, {
    // eslint-disable-next-line no-shadow
    ExportNamedDeclaration(path) {
      if (path.node.source.value.startsWith('.')) {
        path.node.source.value = join(process.cwd(), exportPath.replace(/index.js/, '').replace(/export.js/, ''), path.node.source.value);
      }
    },
    CallExpression({ node }) {
      if (node.callee.name === 'require' && node.arguments[0].value.startsWith('.')) {
        node.arguments[0].value = join(
          process.cwd(),
          exportPath.replace(/index.js/, '').replace(/export.js/, ''),
          node.arguments[0].value,
        );
      }
    },
  });
  return generate(ast, {}, code).code;
}

export default function generateTransfer(configEntryName) {
  const { tmpDirPath, isDev, choerodonConfig: { master } } = context;

  const transferPath = path.join(tmpDirPath, `transfer.${configEntryName}.js`);
  const exportPath = typeof master === 'object' ? master.exportPath : undefined;
  const content = astFunction(exportPath);
  fs.writeFileSync(
    transferPath,
    content,
  );
}
