const scrapeButton = document.querySelector('#scrape-videos')
const lightbox = document.querySelector('.lightbox')

scrapeButton.addEventListener('click', e => {
  e.preventDefault()
  lightbox.classList.add('active')
  window.location = scrapeButton.getAttribute("href")
})