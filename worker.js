let i = 0
function increment() {
  i++
  postMessage(i)
}

setInterval(increment, 2000)