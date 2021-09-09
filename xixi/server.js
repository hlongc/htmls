const express = require('express')

const app = express()

// 测试允许多域名跨域
app.use((req, res, next) => {
  const whiteList = [
    'http://localhost:8080',
    'http://localhost:8082',
    'http://127.0.0.1:5500',
    'http://127.0.0.1:5501'
  ]
  const origin = req.headers['origin']
  if (!origin) {
    next()
  } else {
    if (whiteList.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', req.headers['origin'])
      next()
    } else {
      res.statusCode(401).end('Not Allowed')
    }
  }
})

app.use(express.static(__dirname))

app.get('/cors/info', (req, res) => {
  setTimeout(() => {
    res.send({ data: 'success' })
  }, 5000)
})

app.listen(3003)