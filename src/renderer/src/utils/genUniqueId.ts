const genUniqueId = () => Date.now().toString(36) + Math.random().toString(36).slice(2)
export default genUniqueId
