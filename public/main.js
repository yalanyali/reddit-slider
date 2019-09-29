/* global Hammer, fetch */
'use strict'
import kevgir from './kevgir.js'

const BASE_URL = 'https://www.reddit.com'
let cache = []
let contentList = []

let settings = {
  urlToFetch: '',
  isMobile: false
}

let session = {
  after: '',
  activeIndex: -1,
  type: 'image',
  muted: false,
  faderTimeouts: [],
  autoPlayInterval: null
}

/* MAIN FUNCTIONS */

const getData = (after = session.after) => {
  console.log('Data requested:', `${settings.urlToFetch}.json?after=${after}`)
  // session.loadingNextImages = true
  fetch(`${settings.urlToFetch}.json?after=${after}`)
    .then(res => res.json())
    .then(handleData)
}

const handleData = async (data) => {
  if (data && data.data && data.data.after) {
    session.after = data.data.after
  } else { return }

  let children = []
  if (data.data.children) {
    children = data.data.children
  }

  if (children.length === 0) { return }

  // console.log(children.map(c => c.data.permalink))

  let batchPromise = children.map(async item => {
    if (!item || !item.data) { return }
    await addSlide({
      url: item.data.url || item.data.link_url,
      title: item.data.title || item.data.link_title,
      over18: item.data.over_18,
      subreddit: item.data.subreddit,
      commentsLink: BASE_URL + item.data.permalink,
      data: item.data
    })
  })

  await Promise.all(batchPromise)

  // console.log(contentList)

  if (session.activeIndex === -1) {
    setActiveIndex(0)
  }

  if (data.data.after === null) {
    console.log('No more pages.')
  }

  // session.loadingNextImages = false
}

const addSlide = async (item) => {
  // Process url
  let media
  try {
    media = await kevgir.getMedia(item.url)
  } catch (err) {
    console.log('Kevgir error:', item.url)
    return
  }

  if (!media.type) {
    // item.url = item.data.thumbnail || item.data.link_url
    return
  } else {
    item.url = media.url
  }

  item.type = media.type

  // session.foundItems = true

  if (contentList.find(listItem => listItem.url === item.url)) {
    return
  }
  contentList.push(item)
}

const setActiveIndex = (index) => {
  if (
    session.activeIndex === index ||
    index > contentList.length - 1 ||
    index < 0 ||
    contentList.length === 0
  ) { return }

  // Check cache
  if (!cache[index]) {
    createDiv(index)
  }

  session = {
    ...session,
    activeIndex: index,
    type: contentList[index].type
  }

  // Render
  addToDom(cache[index])
  cache[index].muted = session.muted // FIXME

  // Update title
  updateTitle(contentList[index])

  // PRELOAD NEXT
  preloadNextItem(index)
  console.log(contentList[index])

  if (isLastItem(index)) {
    getData()
  }
}

const preloadNextItem = (index) => {
  const next = getNextItemIndex(index)
  // Clean cache
  cache = {}
  if (next < contentList.length) {
    createDiv(next, true)
  }
}

const createDiv = (index, debug) => {
  const item = contentList[index]

  // Create element
  const element = createElement(item)

  // Background image won't cache images
  if (item.type === 'image') {
    preloadImage(item.url)
  }

  cache[index] = element
  if (debug) {
    console.log('Preloading:', cache[index])
  }
}

const preloadImage = (url) => {
  let cachedImage = document.createElement('img')
  cachedImage.src = url
}

const addToDom = (element) => {
  const slider = document.getElementById('slider')
  slider.innerHTML = ''
  slider.appendChild(element)
}

const updateTitle = (item) => {
  const title = document.getElementById('title')
  title.href = item.data.url || item.data.link_url
  title.textContent = item.title

  const titleSubreddit = document.getElementById('titleSubreddit')
  titleSubreddit.href = item.commentsLink
  titleSubreddit.textContent = `/r/${item.subreddit}`

  showTitle()
}

const prevSlide = () => {
  setActiveIndex(session.activeIndex - 1)
  setPlaying(true)
}

const nextSlide = () => {
  const next = getNextItemIndex(session.activeIndex)
  setActiveIndex(next)
  setPlaying(true)
}

const showTitle = (timeout = 1500) => {
  session.faderTimeouts.forEach(t => clearTimeout(t))
  const titleEl = document.getElementById('titleContainer')
  const bottomEl = document.getElementById('bottomContainer')

  fadeIn(titleEl)
  fadeIn(bottomEl)
  session.faderTimeouts[0] = setTimeout(() => {
    fadeOut(titleEl)
    fadeOut(bottomEl)
  }, timeout)
}

const toggleAutoplay = () => {
  if (session.autoPlayInterval !== null) {
    // Stop autoplay
    clearInterval(session.autoPlayInterval)
    session.autoPlayInterval = null
    document.getElementById('autoPlay').textContent = '►'
  } else {
    // Start autoplay
    session.autoPlayInterval = setInterval(() => {
      nextSlide()
    }, 5000)
    document.getElementById('autoPlay').textContent = '❚❚'
  }
}

/* UTILITY FUNCTIONS */

const createElement = (item) => {
  let cachedItem
  if (item.type === 'image') {
    cachedItem = document.createElement('div')
    cachedItem.className = 'clouds'
    cachedItem.style.backgroundImage = `url('${item.url}')`
    cachedItem.style.backgroundRepeat = 'no-repeat'
    cachedItem.style.backgroundSize = 'contain'
    cachedItem.style.backgroundPosition = 'center center'
  } else if (item.type === 'video') {
    cachedItem = document.createElement('video')
    cachedItem.autoplay = true
    cachedItem.controls = !settings.isMobile
    cachedItem.loop = true
    cachedItem.muted = true
    cachedItem.preload = true
    cachedItem.autobuffer = true
    cachedItem.playsinline = true
    cachedItem.style.height = '100%'
    cachedItem.style.width = '100%'
    // cachedItem.ontouchstart = this.handleVideoClick()
  }
  cachedItem.src = item.url
  return cachedItem
}

const setMuted = (muted) => {
  Array.from(document.getElementsByTagName('video')).forEach(e => {
    e.muted = muted
  })
  session.muted = muted
}

const setVolume = (highOrLow) => {
  if (highOrLow === 'high') {
    Array.from(document.getElementsByTagName('video')).forEach(e => {
      if (e.volume <= 0.9) { e.volume = e.volume + 0.1 }
    })
  } else if (highOrLow === 'low') {
    Array.from(document.getElementsByTagName('video')).forEach(e => {
      if (e.volume >= 0.1) { e.volume = e.volume - 0.1 }
    })
  }
}

const setPlaying = (playing, reset = false) => {
  Array.from(document.getElementsByTagName('video')).forEach(e => {
    if (e.readyState > 2) {
      if (reset) { e.currentTime = 0 }
      if (playing) {
        e.play()
      } else {
        e.pause()
      }
    }
  })
}

const togglePlaying = (videoEl = null) => {
  if (videoEl) {
    if (videoEl.paused) {
      videoEl.play()
    } else {
      videoEl.pause()
    }
    return
  }
  Array.from(document.getElementsByTagName('video')).forEach(e => {
    if (e.readyState > 2) {
      if (e.paused) {
        e.play()
      } else {
        e.pause()
      }
    }
  })
}

const addKeyboardEvents = () => {
  const keys = {
    ctrl: 17,
    space: 32,
    enter: 13,
    M_KEY: 77,
    arrow: {
      left: 37,
      up: 38,
      right: 39,
      down: 40
    }
  }
  document.addEventListener('keyup', (e) => {
    // console.log('Keypress: ', e.keyCode)
    if (e.keyCode === 17) { return } // CTRL
    switch (e.keyCode) {
      case keys.arrow.left:
        return prevSlide()
      case keys.arrow.right:
        return nextSlide()
      case keys.arrow.up:
        return setVolume('high')
      case keys.arrow.down:
        return setVolume('low')
      case keys.enter:
        console.log(cache)
        break
      case keys.M_KEY:
        setMuted(!session.muted)
        break
      default:
        break
    }
  })
}

const addTouchEvents = () => {
  const page = document.getElementById('page')
  const mc = new Hammer.Manager(page)
  mc.add(new Hammer.Swipe({ direction: Hammer.DIRECTION_ALL, threshold: 50 }))
  mc.add(new Hammer.Swipe({ event: 'doubleswipe', direction: Hammer.DIRECTION_UP, threshold: 50, pointers: 2 }))
  mc.add(new Hammer.Tap({ event: 'tap' }))
  mc.add(new Hammer.Tap({ event: 'multitap', pointers: 2 }))
  mc.on('swipe', (e) => {
    switch (e.direction) {
      case 2: // left
        nextSlide()
        break
      case 4: // right
        prevSlide()
        break
      case 8: // up
        setMuted(false)
        break
      case 16: // down
        setMuted(true)
        break
      default:
        break
    }
  })
  mc.on('doubleswipe', (e) => {
    openInNewTab()
  })
  mc.on('tap', (e) => {
    // toggleTitle()
    if (contentList[session.activeIndex].type === 'video') {
      togglePlaying()
    } else {
      showTitle()
    }
  })
  mc.on('multitap', (e) => {
    showTitle()
  })
}

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
  if (isLastItem(currentIndex) && !session.loadingNextImages) {
    return 0
  }

  return currentIndex + 1
}

const openInNewTab = () => {
  const url = document.getElementById('titleSubreddit')

  if (navigator.userAgent.match(/msie/i) || navigator.userAgent.match(/trident/i) || navigator.userAgent.match(/firefox/i)) {
    window.open(url.href, '_blank')
  } else {
    var mev = document.createEvent('MouseEvents')
    mev.initMouseEvent('click', true, true, window, 0, 0, 0, 0, 0, true, false, false, true, 0, null)
    url.dispatchEvent(mev)
  }
}

const fadeIn = (el, display) => {
  el.style.opacity = 0
  el.style.display = display || 'inline-block'

  ;(function fade () {
    var val = parseFloat(el.style.opacity)
    if (!((val += 0.1) > 1)) {
      el.style.opacity = val
      session.faderTimeouts[1] = setTimeout(fade, 40)
    }
  })()
}

const fadeOut = (el) => {
  el.style.opacity = 1

  ;(function fade () {
    if ((el.style.opacity -= 0.1) < 0) {
      el.style.display = 'none'
    } else {
      session.faderTimeouts[2] = setTimeout(fade, 40)
    }
  })()
}

/* INIT */
const init = () => {
  settings = {
    urlToFetch: getUrlToFetch(),
    isMobile: isMobile()
  }
  getData()
  addKeyboardEvents()
  if (settings.isMobile) {
    addTouchEvents()
  }
  document.getElementById('autoPlay').addEventListener('click', toggleAutoplay)
}
document.addEventListener('DOMContentLoaded', init)
