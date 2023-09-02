/**
 * 就像它名字所描述的那样
 * @returns {string}
 */
export const generateUniqueId = () => Date.now().toString(36) + Math.random().toString(36).slice(2)

/**
 * 就像它名字所描述的那样
 * @param {number} remValue
 * @returns {number}
 */
export const remToPx = remValue => {
  const baseFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize)
  return remValue * baseFontSize
}
