const rule = RegExp('(?:https?:\\/\\/)?(?:www\\.)?clips\\.twitch\\.tv\\/(?:embed\\?clip=)?(\\w+)')

const CORS_ANYWHERE = 'https://cors-anywhere.herokuapp.com/'

const get = async (url) => {
  let media = {
    url: '',
    type: 'video'
  }
  const matched = rule.exec(url)[1]

  const reqUrl = CORS_ANYWHERE + 'https://clips.twitch.tv/api/v2/clips/' + matched

  await fetch(reqUrl)
    .then(res => res.json())
    .then(content => {
      const previewUrl = content.preview_image
      media.url = previewUrl.replace(/-preview\.jpg.*/, '.mp4')
    })
    .catch((err) => {
      // console.log('Twitch error:', url)
    })

  return media || false
}

export default { rule, get }
