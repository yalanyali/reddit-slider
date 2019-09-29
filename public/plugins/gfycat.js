const rule = RegExp('(?:https?:\\/\\/)?(?:www.)?gfy(?:cat\\.com(?:\\/.{1,3})?(?!\\/(?:privacy|contact|upload|sign|leader|random|support|partners|gifbrewery|cajax\\/))|gur\\.com\\/view\\/\\d+)\\/+(?:(?:cajax\\/checkUrl|fetch)\\/(?:http.+)|(?!useraccount\\/|ifr\\/|(?:(?:\\w\\w\\/)?gifs\\/)?detail\\/)@?(?:[\\w.-]+)(?:\\/albums)?\\/(?:[\\w-]+).*|(?:ifr\\/|(?:(?:\\w\\w\\/)?gifs\\/)?detail\\/)?([a-zA-Z]{6,})(#?\\?direction=reverse)?.*)')

const get = async (url) => {
  let media = {
    url: '',
    type: 'video'
  }
  const matched = rule.exec(url)[1]

  await fetch('https://api.gfycat.com/v1/gfycats/' + matched)
    .then(res => res.json())
    .then(content => {
      media.url = content.gfyItem.mp4Url
    })
    .catch((err) => {
    // console.log(err)
    })

  return media || false
}

export default { rule, get }
