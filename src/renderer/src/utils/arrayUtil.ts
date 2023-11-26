export function selectSomething<T>(list: T[], x: number): T[] {
  const len = list.length
  const result: typeof list = []
  const set = new Set()
  while (set.size < x) {
    const index = Math.floor(Math.random() * len)
    if (!set.has(index)) {
      set.add(index)
      result.push(list[index])
    }
  }
  return result
}
