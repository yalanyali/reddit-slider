const rp = require('request-promise-native')

const rule = RegExp('(?:https?:\\/\\/)?(?:www\\.)?(?:i\\.|m\\.)?imgur.com\\/(?!a\/|gallery)([\\w]+)(\\..*)?')

const get = async (url) => {
  let mediaUrl
  const mediaId = rule.exec(url)[1]
  const mediaFormat = (rule.exec(url)[2]) ? rule.exec(url)[2].slice(1) : 'none'
  // Ignore if already Telegram-friendly
  if (mediaFormat === 'mp4') { return false }

  var options = {
    uri: 'https://api.imgur.com/3/image/' + mediaId,
    headers: {
      'Authorization': 'Client-ID 2cc61d0869511fd'
    },
    json: true
  }
  await rp.get(options)
    .then(response => {
      if (response.data.type === 'image/gif' || response.data.type === 'video/mp4') {
        mediaUrl = `https://i.imgur.com/${mediaId}.mp4`
      }
    })

  return mediaUrl || false
}

export default { rule, get }
