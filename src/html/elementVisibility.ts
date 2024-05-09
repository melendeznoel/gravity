export const elementVisibility = (element: any, isVisible: boolean) => {
  if (!element) {
    return element
  }

  if (isVisible) {
    if (element.classList.contains('hidden')) {
      element.classList.remove('hidden')
    }
  } else {
    if (!element.classList.contains('hidden')) {
      element.classList.add('hidden')
    }
  }

  return element
}
