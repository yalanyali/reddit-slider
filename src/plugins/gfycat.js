const rp = require('request-promise-native')

const rule = RegExp('(?:https?:\\/\\/)?(?:www.)?gfy(?:cat\\.com(?:\\/.{1,3})?(?!\\/(?:privacy|contact|upload|sign|leader|random|support|partners|gifbrewery|cajax\\/))|gur\\.com\\/view\\/\\d+)\\/+(?:(?:cajax\\/checkUrl|fetch)\\/(?:http.+)|(?!useraccount\\/|ifr\\/|(?:(?:\\w\\w\\/)?gifs\\/)?detail\\/)@?(?:[\\w.-]+)(?:\\/albums)?\\/(?:[\\w-]+).*|(?:ifr\\/|(?:(?:\\w\\w\\/)?gifs\\/)?detail\\/)?([a-zA-Z]{6,})(#?\\?direction=reverse)?.*)')

const get = async (url) => {
  let mediaUrl
  const matched = rule.exec(url)[1]

  const options = {
    uri: 'https://api.gfycat.com/v1/gfycats/' + matched,
    json: true
  }
  await rp.get(options)
    .then(content => {
      mediaUrl = content.gfyItem.mp4Url
    })
    .catch((err) => {
    // console.log(err)
    })

  return mediaUrl || false
}

export default { rule, get }
