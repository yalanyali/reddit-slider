import React, { Component } from 'react'
import kevgir from './Kevgir'
import './App.css'

const BASE_URL = 'http://www.reddit.com'

export default class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      after: '',
      activeIndex: -1,
      loadingNextImages: false,
      foundItems: true,
      type: 'image',
      muted: false
    }
    this.cache = []
    this.list = []
    this.settings = {
      urlToFetch: this.getUrlToFetch()
    }
  }

  componentDidMount() {
    this.getData()
    this.addKeyboardEvents()
  }

  getUrlToFetch = () => {
    const pathname = window.location.pathname
    if (pathname.length > 1) {
      return BASE_URL + pathname
    } else {
      return 'https://www.reddit.com/r/all'
    }
  }

  addKeyboardEvents = () => {
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
    document.addEventListener('keyup', async (e) => {
      // console.log('Keypress: ', e.keyCode)
      if (e.keyCode === 17) { return } // CTRL
      switch (e.keyCode) {
        case keys.arrow.left:
          return this.prevSlide()
        case keys.arrow.right:
          return this.nextSlide()
        case keys.enter:
          console.log(this.cache)
          break
        case keys.M_KEY:
          this.setMuted(!this.state.muted)
          break
        default:
          break
      }
    })
  }

  getData = (after = this.state.after) => {
    this.setState({
      loadingNextImages: true
    })
    fetch(`${this.settings.urlToFetch}.json?after=${after}`)
      .then(res => res.json())
      .then(this.handleData)
  }

  handleData = async (data) => {
    if (data && data.data && data.data.after) {
      this.setState({
        after: data.data.after
      })
    } else { return }

    let children = []
    if (data.data.children) {
      children = data.data.children
    }

    if (children.length === 0) { return }

    let batchPromise = children.map(async item => {
      if (!item || !item.data) { return }
      await this.addSlide({
        url: item.data.url || item.data.link_url,
        title: item.data.title || item.data.link_title,
        over18: item.data.over_18,
        subreddit: item.data.subreddit,
        commentsLink: BASE_URL + item.data.permalink,
        data: item.data
      })
    })

    await Promise.all(batchPromise)

    if (this.state.activeIndex === -1) {
      this.setActiveIndex(0)
    }


    if (data.data.after === null) {
      console.log('No more pages.')
    }

    this.setState({
      loadingNextImages: false
    })
  }

  addSlide = async (item) => {
    // Process url
    const media = await kevgir.getMedia(item.url)
    if (!media) {
      item.url = item.data.thumbnail
      return
    } else {
      item.url = media.url
    }

    item.type = media.type

    this.setState({
      foundItems: true
    })
    if (this.list.find(listItem => listItem.url === item.url)) {
      return
    }
    this.list.push(item)
  }

  prevSlide = () => {
    this.setActiveIndex(this.state.activeIndex - 1)
    this.setPlaying(true)
  }

  nextSlide = () => {
    const next = this.getNextItemIndex(this.state.activeIndex)
    this.setActiveIndex(next)
    this.setPlaying(true)
  }

  setActiveIndex = (index) => {
    if (
      this.state.activeIndex === index ||
      index > this.list.length - 1 ||
      index < 0 ||
      this.list.length === 0
    ) { return }

    // RENDER (if cache[index] else createDiv)
    if (!this.cache[index]) {
      this.createDiv(index)
    }

    this.setState({
      activeIndex: index,
      type: this.list[index].type
    })

    this.refs.slider.innerHTML = ""
    this.refs.slider.appendChild(this.cache[index])
    this.cache[index].muted = this.state.muted

    // PRELOAD NEXT
    this.preloadNextItem(index)
    console.log(this.list[index])

    if (this.isLastItem(index)) {
      this.getData()
    }
  }

  isLastItem = (index) => {
    // FILTERS
    return (index === this.list.length - 1)
  }

  getNextItemIndex = (currentIndex) => {
    // Filter?
    if (this.isLastItem(currentIndex) && !this.state.loadingNextImages) {
      return 0
    }

    return currentIndex + 1
  }

  preloadNextItem = (index) => {
    const next = this.getNextItemIndex(index)
    // Clean cache
    this.cleanCache()
    if (next < this.list.length) {
      this.createDiv(next)
    }
  }

  cleanCache = () => {
    this.cache = {}
    // this.cache.forEach(el => {
    //   el.parentNode.removeChild(el)
    // })
  }

  createDiv = (index) => {
    const item = this.list[index]

    // Create element
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
      cachedItem.controls = true
      cachedItem.loop = true
      cachedItem.muted = true
      cachedItem.preload = true
      cachedItem.style.height = '100%'
      cachedItem.style.width = '100%'
    }

    this.preloadItem(cachedItem, item.url)
    this.cache[index] = cachedItem
  }

  preloadItem = (item, url) => {
    // FIXME
    item.src = url
  }

  setPlaying = (playing, reset = false) => {
    Array.from(document.getElementsByTagName('video')).forEach(e => {
      if (reset) { e.currentTime = 0 }
      if (playing) {
        e.play()
      } else {
        e.pause()
      }
    })
  }

  setMuted = (muted) => {
    Array.from(document.getElementsByTagName('video')).forEach(e => {
      e.muted = muted
    })
    this.setState({ muted })
  }

  render() {
    if (this.state.activeIndex < 0) {
      return (
        <div>Loading...</div>
      )
    } else {
      let i = this.list[this.state.activeIndex]
      return (
        <div id='page' className='App'>
          <div id="titleDiv" className="navbox clouds" style={{ left: 0 }}>
            <h2 id="navboxTitle">
              <a href={i.data.url}>{i.title}</a>
            </h2>
            <h3><a id="navboxSubreddit" href={i.commentsLink}>{`/r/${i.subreddit}`}</a></h3>
          </div>
          {/* <div className='prevArrow fadeOnIdle' title='Arrow keys work too' id='prevButton' />
          <div className='nextArrow fadeOnIdle' title='Arrow keys work too' id='nextButton' /> */}
          <div ref='slider' className='picture-slider'>
            {/* IMG OR VIDEO ELEMENT */}
          </div>
        </div>
      )
    }
  }
}
