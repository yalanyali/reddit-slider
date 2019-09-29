import plugins from './plugins/index.js'

const ALLOWED_EXTENSIONS = [
  {
    ext: 'jpg',
    type: 'image'
  },
  {
    ext: 'jpeg',
    type: 'image'
  },
  {
    ext: 'bmp',
    type: 'image'
  },
  {
    ext: 'png',
    type: 'image'
  },
  {
    ext: 'gif',
    type: 'image'
  },
  {
    ext: 'gifv',
    convert: 'mp4',
    type: 'video'
  },
  {
    ext: 'mp4',
    type: 'video'
  },
  {
    ext: 'avi',
    type: 'video'
  }
]

const getMatchedPlugin = (url) => {
  const pluginList = Object.keys(plugins).map(pluginName => plugins[pluginName])
  const matchedPlugin = pluginList.find(plugin => plugin.rule.test(url))
  return matchedPlugin
}

const checkExtension = (url) => {
  const urlExt = url.split('.').pop().split(/\?|\#/g).shift()
  if (urlExt) {
    const matchedExtension = ALLOWED_EXTENSIONS.find(item => item.ext === urlExt)
    // if (matchedExtension) {
    return matchedExtension
  //   }
  // } else {
  //   return false
  }
}

const getMedia = async (url) => {
  let data = {}

  const knownExt = checkExtension(url)

  if (knownExt) {
    // Known type
    data = {
      url: url,
      type: knownExt.type
    }
    // Maybe convert extension
    if (knownExt.convert) {
      data.url = data.url.replace(knownExt.ext, knownExt.convert)
    }
  } else {
    // Unknown type, check plugins
    const matchedPlugin = getMatchedPlugin(url)
    if (matchedPlugin) {
      const media = await matchedPlugin.get(url)
      data.url = media.url
      data.type = media.type
    }
  }
  return data
}

export default { getMedia }
