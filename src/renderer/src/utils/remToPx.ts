const remToPx = (remValue: number) => {
  const baseFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize)
  return remValue * baseFontSize
}
export default remToPx
