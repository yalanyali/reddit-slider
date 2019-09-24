import plugins from './plugins'

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

const checkUrl = (url) => {
  const urlExt = url.split('.').pop().split(/\?|\#/g).shift()
  if (urlExt) {
    const matchedExtension = ALLOWED_EXTENSIONS.find(item => item.ext === urlExt)
    return matchedExtension
  } else {
    return false
  }
}

const getMedia = async (url) => {
  let urlExt = checkUrl(url)
  if (urlExt) {
    return {
      url: url,
      type: urlExt.type
    }
  }
  // Plugin
  const matchedPlugin = getMatchedPlugin(url)
  if (matchedPlugin) {
    const mediaUrl = await matchedPlugin.get(url)
    return {
      url: mediaUrl,
      type: 'video' // FIXME
    }
  } else {
    return false
  }
}

export default { getMedia }
