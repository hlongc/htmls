function createMessage(parent, message, direction) {
  const li = document.createElement('li')
  li.className = `item ${direction}`
  let html = ''
  if (direction === 'me') {
    html = `
      <span class="avatar">我</span>
      <span class="message">${message}</span>
    `
  } else {
    html = `
      <span class="avatar">他</span>
      <span class="message">${message}</span>
    `
  }
  li.innerHTML = html
  parent.appendChild(li)
}