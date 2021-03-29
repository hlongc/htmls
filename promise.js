const wrap = promise => {
  let abort
  const myPromise = new Promise((_, reject) => {
    abort = reject
  })
  const result = Promise.race([promise, myPromise])
  result.abort = abort
  return result
}

const p = wrap(new Promise((resolve) => {
  setTimeout(() => {
    resolve('我来了')
  }, 10000)
}))

p.then(r => {
  console.log(r)
}).catch(console.log)

setTimeout(() => {
  p.abort('我放弃了这个promise了')
}, 2000)