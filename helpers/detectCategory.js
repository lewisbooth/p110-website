exports.detectCategory = title => {
  if (title.match(/P110 Premiere/i)) return "p110-premiere"
  if (title.match(/Scene Smasher/i)) return "scene-smasher"
  if (title.match(/#HoodsHottest/i)) return "hoods-hottest"
  if (title.match(/Hoods Hottest/i)) return "hoods-hottest"
  if (title.match(/Music Video/i)) return "music-video"
  if (title.match(/Net Video/i)) return "music-video"
  if (title.match(/#1TAKE/i)) return "1take"
  return "music-video"
}