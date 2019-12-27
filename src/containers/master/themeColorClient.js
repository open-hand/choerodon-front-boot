/* eslint-disable radix */
/* eslint-disable arrow-body-style */
import colorPalette from '../../bin/common/utils/colorPalette';
// 将hex颜色转成rgb
function hexToRgba(hex) {
  const r = parseInt(`0x${hex.slice(1, 3)}`);
  const g = parseInt(`0x${hex.slice(3, 5)}`);
  const b = parseInt(`0x${hex.slice(5, 7)}`);

  return [r, g, b, 1];
}
const client = require('webpack-theme-color-replacer/client');

export default {
  primaryColor: '#3f51b5',
  changeColor(newColor, newColorTwo) {
    const lastColor = this.lastColor || this.primaryColor;
    const newColors = [
      colorPalette(newColor, 1),
      colorPalette(newColor, 2),
      colorPalette(newColor, 3),
      colorPalette(newColor, 4),
      colorPalette(newColor, 5),
      newColor,
      colorPalette(newColor, 7),
      colorPalette(newColor, 8),
      colorPalette(newColor, 9),
      colorPalette(newColor, 10),
      colorPalette(newColor, 7), // 左上角颜色
      hexToRgba(colorPalette(newColor, 1)).join(','), // menu-item颜色
      hexToRgba(colorPalette(newColor, 1)).join(','), // 左侧菜单menu-item颜色
    ];
    const options = {
      cssUrl: '/dis/theme-colors.css', // hash模式下用相对路径
      // oldColors: ['#3f51b5', '#303f9f'], // current colors array. The same as `matchColors`
      newColors, // new colors array, one-to-one corresponde with `oldColors`
    };
    const promise = client.changer.changeColor(options);
    this.lastColor = lastColor;
    return promise;
  },
};
