/**
 * 把用户移动的块，标记为true
 * @param {*} layout 
 * @param {*} key 
 * @param {*} GridX 
 * @param {*} GridY 
 * @param {*} isUserMove 
 */
export const syncLayout = (layout, movingItem) => {
  const key = movingItem.UniqueKey;

  layout[key].GridX = movingItem.GridX;
  layout[key].GridY = movingItem.GridY;
  layout[key].isUserMove = true;
  return layout;
};


/**
 * 初始化的时候调用
 * 会把isUserMove和key一起映射到layout中
 * 不用用户设置
 * @param {*} layout 
 * @param {*} children 
 */

export const MapLayoutTostate = (layout, children) => layout.map((child, index) => {
  const newChild = { ...child, isUserMove: true, key: children[index].key, static: children[index].static };
  return newChild;
});

/**
 * 用key从layout中拿出item
 * @param {*} layout 输入进来的布局
 * @param {*} key 
 */
export const layoutItemForkey = (layout, key) => layout[key];
