const rp = require('request-promise-native')

const rule = RegExp('(?:https?:\\/\\/)?(?:www\\.)?clips\\.twitch\\.tv\\/(?:embed\\?clip=)?(\\w+)')

// const CORS_ANYWHERE = 'https://cors-anywhere.herokuapp.com/'

const get = async (url) => {
  let mediaUrl
  const matched = rule.exec(url)[1]

  const options = {
    uri: 'https://clips.twitch.tv/api/v2/clips/' + matched,
    json: true
  }
  await rp.get(options)
    .then(content => {
      const previewUrl = content.preview_image
      mediaUrl = previewUrl.replace(/-preview\.jpg.*/, '.mp4')
    })
    .catch((err) => {
      // console.log(err)
    })

  return mediaUrl || false
}

export default { rule, get }
