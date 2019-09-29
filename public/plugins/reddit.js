const rule = RegExp('(?:https?:\\/\\/)?(?:www.)?(v\\.redd\\.it/[\\da-z]+).*')

const CORS_ANYWHERE = 'https://cors-anywhere.herokuapp.com/'

const get = async (url) => {
  let media = {
    url: '',
    type: 'video'
  }
  let matched = rule.exec(url)[0]

  // If no https?://
  if (!RegExp('^(?:https?:\\/\\/)').test(matched)) {
    matched = 'https://' + matched
  }
  const xmlUrl = CORS_ANYWHERE + matched + '/DASHPlaylist.mpd'

  await fetch(xmlUrl)
    .then(res => res.text())
    .then(content => {
      let quality
      if (/DASH_1_2_M/.test(content)) quality = 'DASH_1_2_M'
      else if (/DASH_720/.test(content)) quality = 'DASH_720'
      else if (/DASH_600/.test(content)) quality = 'DASH_600'
      else if (/DASH_480/.test(content)) quality = 'DASH_480'
      else if (/DASH_360/.test(content)) quality = 'DASH_360'
      else if (/DASH_240/.test(content)) quality = 'DASH_240'
      media.url = matched + '/' + quality
    })
    .catch((err) => {
      // console.log('REDDIT.JS:', err)
    })
  return media || false
}

export default { rule, get }
