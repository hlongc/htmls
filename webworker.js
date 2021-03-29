let data

self.addEventListener('message', function(e) {
  const data = e.data
  console.log(e.data)
  if (data.type === 'close') {
    this.console.log('即将关闭')
    this.self.close()
  } else {
    this.console.log('接收到数据')
    this.postMessage({ count: data.count + 1 })
  }
})