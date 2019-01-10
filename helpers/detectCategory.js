exports.detectCategory = snippet => {
  if (snippet.title.match(/P110 Premiere/i) || snippet.description.match(/P110 Premiere/i))
    return "p110-premiere"
  if (snippet.title.match(/Scene Smasher/i))
    return "scene-smasher"
  if (snippet.title.match(/#HoodsHottest|Hoods Hottest/i))
    return "hoods-hottest"
  if (snippet.title.match(/#1TAKE/i))
    return "1take"
  return "music-video"
}