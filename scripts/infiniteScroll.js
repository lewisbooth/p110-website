const errorMessage = document.querySelector('.form-errors')
const rootNode = document.querySelector('#infinite-scroll')
const footer = document.querySelector('footer')

// Request more entries when bottom of viewport  
// is TRIGGER_OFFSET pixels away from the footer
const TRIGGER_OFFSET = 500
const DEBOUNCE = 300

document.addEventListener('scroll', infiniteScroll)

// These variables need to be re-calculated regularly
// so they are written as arrow functions
const triggerPoint = () =>
  footer.offsetTop - TRIGGER_OFFSET

const scrollPosition = () =>
  window.scrollY + window.innerHeight

const readyForPosts = () =>
  !fetchingPosts && scrollPosition() > triggerPoint()

const nodeCount = () =>
  rootNode.childNodes.length

let fetchingPosts = false

function infiniteScroll() {
  if (!readyForPosts()) return
  fetchingPosts = true
  axios.post(window.location, { from: nodeCount() })
    .then(res => {
      rootNode.innerHTML += res.data.html
      errorMessage.classList.add('hidden')
    })
    .catch(err => {
      console.log(err)
      errorMessage.classList.remove('hidden')
    })
    .finally(() => {
      setTimeout(() => {
        fetchingPosts = false
      }, DEBOUNCE)
    })
}