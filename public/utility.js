const isMobile = () => {
  return navigator.userAgent.match(/Android/i) ||
      navigator.userAgent.match(/webOS/i) ||
      navigator.userAgent.match(/iPhone/i) ||
      navigator.userAgent.match(/iPad/i) ||
      navigator.userAgent.match(/iPod/i) ||
      navigator.userAgent.match(/BlackBerry/i) ||
      navigator.userAgent.match(/Windows Phone/i)
}

const getUrlToFetch = () => {
  const pathname = window.location.pathname
  if (pathname.length > 1) {
    return BASE_URL + pathname
  } else {
    return 'https://www.reddit.com/r/all'
  }
}

const isLastItem = (index) => {
  // FILTERS
  return (index === contentList.length - 1)
}

const getNextItemIndex = (currentIndex) => {
  // Filter?
  if (this.isLastItem(currentIndex) && !session.loadingNextImages) {
    return 0
  }

  return currentIndex + 1
}
