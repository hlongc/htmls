// render1
const demoEl = document.getElementById('demo');

console.log('a');

setTimeout(() => {
    alert('渲染完成！')
    console.log('b');
},0)

requestAnimationFrame(() => {
  console.log('渲染之前')
  alert('渲染之前')
})

new Promise(resolve => {
    console.log('c');
    resolve()
}).then(() => {
    console.log('d');
    alert('开始渲染！')
})

console.log('e');
demoEl.innerText = 'Hello World!';