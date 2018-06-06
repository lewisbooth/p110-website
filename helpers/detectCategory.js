exports.detectCategory = title => {
  if (title.match(/P110 Premiere/i)) return "music-video"
  if (title.match(/Scene Smasher/i)) return "scene-smasher"
  if (title.match(/Music Video/i)) return "music-video"
  if (title.match(/Net Video/i)) return "net-video"
  if (title.match(/#1TAKE/i)) return "1take"
  return "music-video"
}