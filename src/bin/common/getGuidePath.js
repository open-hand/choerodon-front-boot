import fs from 'fs';
import path from 'path';
import nunjucks from 'nunjucks';
import glob from 'glob';
import isArray from 'lodash/isArray';
import isObject from 'lodash/isObject';
import context from './context';


const guideTemplate = fs.readFileSync(path.join(__dirname, '../../nunjucks/guide.nunjucks.js')).toString();

function normalizeGuideComponentOrLocale(components, key, dir) {
  glob.sync(path.join(process.cwd(), dir)).forEach((match) => {
    components.push(`"${key}/${path.basename(match, path.extname(match))}": function() { return import("${match}"); },`);
  });
}

function getGuides(guide) {
  const guideComponents = [];
  const guideLocale = [];
  if (isObject(guide)) {
    Object.keys(guide).forEach((key) => {
      const value = guide[key];
      let componentsPath = value;
      let localePath;
      if (isObject(value)) {
        componentsPath = value.components;
        localePath = value.locale;
      }
      if (typeof componentsPath === 'string') {
        normalizeGuideComponentOrLocale(guideComponents, key, componentsPath);
      } else if (isArray(componentsPath)) {
        componentsPath.forEach((dir) => {
          normalizeGuideComponentOrLocale(guideComponents, key, dir);
        });
      }
      if (typeof localePath === 'string') {
        normalizeGuideComponentOrLocale(guideLocale, key, localePath);
      }
    });
  }
  return `
{
  guideComponents: {
    ${guideComponents.join('\n    ')}
  },
  guideLocale: {
    ${guideLocale.join('\n    ')}
  }
}
  `;
}

export default function getGuidePath(configEntryName) {
  const { choerodonConfig: { guide }, tmpDirPath } = context;
  const guidePath = path.join(tmpDirPath, `guide.${configEntryName}.js`);
  nunjucks.configure(guidePath, {
    autoescape: false,
  });
  fs.writeFileSync(
    guidePath,
    nunjucks.renderString(guideTemplate, {
      guide: getGuides(guide),
    }),
  );
  return guidePath;
}
