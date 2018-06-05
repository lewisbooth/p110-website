const errorMessage = document.querySelector('.form-errors')
const rootNode = document.getElementById('infinite-scroll')
const footer = document.querySelector('footer')

// Request more entries when bottom of viewport  
// is TRIGGER_OFFSET pixels away from the footer
const TRIGGER_OFFSET = 500

// Minimum time between getPosts() requests
const DEBOUNCE = 300

// Get new posts when we scroll past the trigger point
document.addEventListener('scroll', getPosts)

// These variables need to be re-calculated regularly
// so they are written as arrow functions
const triggerPoint = () =>
  document.body.scrollHeight - footer.offsetHeight - TRIGGER_OFFSET

const scrollLocation = () =>
  window.scrollY + window.innerHeight

const readyForPosts = () =>
  !fetchingPosts && scrollLocation() > triggerPoint()

const nodeCount = () =>
  rootNode.childNodes.length

// Flag for debouncing getPosts()
let fetchingPosts = false

function getPosts() {
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