import { sortLayout } from './sort';
import { getFirstCollison } from './collison';

/**
 * 压缩单个元素，使得每一个元素都会紧挨着边界或者相邻的元素
 * @param {*} finishedLayout 压缩完的元素会放进这里来，用来对比之后的每一个元素是否需要压缩
 * @param {*} item 
 */
export const compactItem = (finishedLayout, item) => {
  if (item.static) return item;
  const newItem = { ...item, key: `${item.key}` };
  if (finishedLayout.length === 0) {
    return { ...newItem, GridY: 0 };
  }
  /**
     * 类似一个递归调用
     */
  while (true) {
    const FirstCollison = getFirstCollison(finishedLayout, newItem);
    if (FirstCollison) {
      /** 第一次发生碰撞时，就可以返回了 */
      newItem.GridY = FirstCollison.GridY + FirstCollison.h;
      return newItem;
    }
    newItem.GridY -= 1;

    if (newItem.GridY < 0) return { ...newItem, GridY: 0 };/** 碰到边界的时候，返回 */
  }
};

/**
 * 压缩layout，使得每一个元素都会紧挨着边界或者相邻的元素
 * @param {*} layout 
 */
export const compactLayout = (function () {
  let cache = {
  };

  return function (layout, movingItem, mapedLayout) {
    if (movingItem) {
      if (cache.GridX === movingItem.GridX
                && cache.GridY === movingItem.GridY
                && cache.w === movingItem.w
                && cache.h === movingItem.h
                && cache.UniqueKey === movingItem.UniqueKey
      ) {
        return {
          compacted: layout,
          mapLayout: mapedLayout,
        };
      }
      cache = movingItem;
    }
    const sorted = sortLayout(layout);// 把静态的放在前面
    const needCompact = Array(layout.length);
    const compareList = [];
    const mapLayout = {};
        
        
    for (let i = 0, { length } = sorted; i < length; i += 1) {
      const finished = compactItem(compareList, sorted[i]);
      if (movingItem) {
        if (movingItem.UniqueKey === finished.key) {
          movingItem.GridX = finished.GridX;
          movingItem.GridY = finished.GridY;
          finished.isUserMove = true;
        } else finished.isUserMove = false;
      } else finished.isUserMove = false;
      compareList.push(finished);
      needCompact[i] = finished;
      mapLayout[`${finished.key}`] = finished;
    }
        
    return {
      compacted: needCompact,
      mapLayout,
    };
  };
}());
