const path = require('path')
const express = require('express')
const app = express()

const router = express.Router()

router.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, '/public/index.html'))
})

app.use(express.static('public'))
app.use('/', router)

app.listen(process.env.PORT || 3000)
