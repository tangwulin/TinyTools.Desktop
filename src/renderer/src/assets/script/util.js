export function generateUniqueId()
{
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

export function remToPx(remValue)
{
  const baseFontSize = parseFloat(
    getComputedStyle(document.documentElement).fontSize,
  )
  return remValue * baseFontSize
}
