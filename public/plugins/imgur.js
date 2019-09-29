// const rp = require('request-promise-native')

const rule = RegExp('(?:https?:\\/\\/)?(?:www\\.)?(?:i\\.|m\\.)?imgur.com\\/(?!a\/|gallery)([\\w]+)(\\..*)?')

const get = async (url) => {
  let media = {
    url: '',
    type: ''
  }
  const mediaId = rule.exec(url)[1]
  const mediaFormat = (rule.exec(url)[2]) ? rule.exec(url)[2].slice(1) : 'none'
  // Ignore if already Telegram-friendly
  if (mediaFormat === 'mp4') { return false }

  const reqUrl = 'https://api.imgur.com/3/image/' + mediaId
  var options = {
    method: 'get',
    headers: {
      'Authorization': 'Client-ID 2cc61d0869511fd'
    }
  }
  await fetch(reqUrl, options)
    .then(res => {
      console.log(res)
      if (res.data.type === 'image/gif' || res.data.type === 'video/mp4') {
        media.url = `https://i.imgur.com/${mediaId}.mp4`
        media.type = 'video'
      } else {
        media.url = `https://i.imgur.com/${mediaId}.jpg`
        media.type = 'image'
      }
    })

  return media || false
}

export default { rule, get }
