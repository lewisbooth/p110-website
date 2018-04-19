exports.removeNewLines = string => {
  return string.replace(/\r?\n|\r/g, " ")
}