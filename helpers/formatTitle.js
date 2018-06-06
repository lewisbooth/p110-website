exports.formatTitle = string => {
  return string
    .replace(/P110 - /i, '')
    .replace(/\| P110/i, '')
    .replace(/\[.*\]/i, '')
    .replace(/- #1TAKE/i, '')
    .replace(/\| #1TAKE/i, '')
    .replace(/#1TAKE/i, '')
    .replace(/- Scene Smasher/i, '')
    .replace(/Scene Smasher/i, '')
}