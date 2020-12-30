export default function escapeWinPath(path) {
  return path.replace(/\\/g, '\\\\');
}
