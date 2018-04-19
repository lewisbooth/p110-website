exports.numberFormatter = num => {
  if (num < 1000) return num
  if (num < 1000000) return (num / 1000).toFixed() + 'k'
  else return (num / 1000000).toFixed(1) + 'M'
}
