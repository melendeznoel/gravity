export const toCamel = (s: string) => {
  return s.replace(/([-_][a-z]|[-__])/ig, ($1) => {
    return $1.toUpperCase()
      .replace('_C', '')
      .replace('_', '')
      .replace('__', '')
  })
}
