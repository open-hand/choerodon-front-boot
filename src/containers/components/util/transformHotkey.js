export default function transformHotkey(event) {
  const hotkeyArr = [];
  if (event.ctrlKey) {
    hotkeyArr.push('Ctrl');
  }
  if (event.shiftKey) {
    hotkeyArr.push('Shift');
  }
  if (event.altKey) {
    hotkeyArr.push('Alt');
  }
  const ARROW_MAPS = {
    ArrowUp: '↑',
    ArrowDown: '↓',
    ArrowLeft: '←',
    ArrowRight: '→',
  };
  if (ARROW_MAPS[event.key]) {
    hotkeyArr.push(ARROW_MAPS[event.key]);
  } else if (!['Control', 'Alt', 'Shift'].includes(event.key)) {
    hotkeyArr.push(event.key.toUpperCase());
  }
  return hotkeyArr.join('+');
}
