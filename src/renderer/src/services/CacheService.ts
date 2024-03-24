export const caching = (url: string) => {
  return 'cache://xxx' + '?url=' + encodeURIComponent(url)
}
