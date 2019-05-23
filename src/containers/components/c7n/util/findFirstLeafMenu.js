export default function findFirstLeafMenu(menu) {
  const { subMenus } = menu;
  if (subMenus && subMenus.length) {
    return findFirstLeafMenu(subMenus[0]);
  } else {
    return menu;
  }
}
