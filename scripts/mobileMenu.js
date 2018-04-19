const nav = document.querySelector('nav')
const menuButton = document.querySelector('.nav__dropdown--toggle--button')

menuButton.addEventListener('click', e => {
  nav.classList.toggle('active')
})