const form = document.querySelector('.dashboard__edit-article')
const titleInput = form.querySelector('input[name="title"]')
const artistsInput = form.querySelector('input[name="artists"]')
const descriptionInput = form.querySelector('textarea[name="description"]')
const releaseDateInput = form.querySelector('input[name="releaseDate"]')
const publishedInput = form.querySelector('input[name="published"]')
const zipInput = form.querySelector('input[name="zip"]')
const artworkInput = form.querySelector('input[name="coverImage"]')
const artworkImage = form.querySelector('.dashboard__edit-mixtape--artwork')
const progressBar = form.querySelector('progress')
const progressBarText = form.querySelector('.progress-bar__percent-completed')
const progressBarContainer = form.querySelector('.progress-bar')
const defaultArtwork = artworkImage.src
const formErrors = document.querySelector('.form-errors')
const lightbox = document.querySelector('.lightbox')
const deleteButton = document.querySelector('#dashboard__edit-video--delete')
const closeLightboxButton = document.querySelector('.lightbox__modal--cancel')
const trackListings = document.querySelector('.mixtapes__track-listing')
const addTrackButton = document.querySelector('.mixtapes__track-listing--add-track')
const isEditPage = window.location.toString().indexOf('/edit/') > 0

if (isEditPage) {
  deleteButton.addEventListener('click', () =>
    lightbox.classList.toggle('active')
  )
  closeLightboxButton.addEventListener('click', () =>
    lightbox.classList.toggle('active')
  )
}

form.addEventListener('submit', e => {
  submitForm(e)
})

function submitForm(e) {
  e.preventDefault()
  updateTrackListingStateFromDOM()
  let formData = new FormData();
  formData.append("title", titleInput.value);
  formData.append("artists", artistsInput.value);
  formData.append("description", descriptionInput.value);
  formData.append("published", publishedInput.checked);
  formData.append("releaseDate", releaseDateInput.value);
  formData.append("trackListing", JSON.stringify(trackListingState));
  if (zipInput.files && zipInput.files[0])
    formData.append("zip", zipInput.files[0]);
  if (artworkInput.files && artworkInput.files[0])
    formData.append("artwork", artworkInput.files[0]);

  // Progress bar for uploading data
  let config = {
    onUploadProgress: progress => {
      let percentCompleted = Math.floor((progress.loaded * 100) / progress.total)
      progressBar.value = percentCompleted
      progressBarText.innerText = percentCompleted + "%"
    }
  }

  if (zipInput.files[0] || artworkInput.files[0])
    progressBarContainer.classList.remove('hidden')

  axios.post(window.location.href, formData, config)
    .then(res => {
      window.location = "/admin/mixtapes"
    }).catch(error => {
      console.log(error)
      errorFlash([error.response.data.error])
    })
}

// Takes an array of strings, and shows them as error messages
function errorFlash(errors = []) {
  formErrors.innerHTML = ""
  if (errors.length === 0 || errors[0] === "undefined")
    errors = ["An error occurred, please try again"]
  errors.forEach(error => {
    if (error === undefined)
      error = "An error occured"
    const errorElement = document.createElement('p')
    errorElement.innerText = error
    formErrors.appendChild(errorElement)
  })
}

// Instant preview of cover artwork from local storage
artworkInput.addEventListener('change', function (e) {
  if (artworkInput.files && artworkInput.files[0]) {
    var reader = new FileReader();
    reader.onload = e => {
      artworkImage.src = e.target.result
      artworkImage.classList.remove('hidden')
    }
    reader.readAsDataURL(artworkInput.files[0]);
  } else {
    artworkImage.src = defaultArtwork
  }
})


// Track Listings

// We keep the track listing data in a global array
// The state is rendered using renderTrackListingState()
let trackListingState = []

function setState(newState) {
  if (newState == trackListingState) return
  trackListingState = newState
  renderState()
}

function renderState() {
  let newHTML = ""
  trackListingState.forEach((listing, i) => {
    newHTML += generateListingMarkup(listing, i)
  })
  trackListings.innerHTML = newHTML
  const listings = getTrackListingEntries()
  listings.forEach((listing, i) => {
    const deleteButton = listing.querySelector(".mixtapes__track-listing--entry--delete")
    deleteButton.addEventListener("click", e => {
      e.target.parentElement.remove()
      updateTrackListingStateFromDOM()
    })
  })
}

const generateListingMarkup = (listing, i) => `
  <div class="mixtapes__track-listing--entry" draggable="true" ondragstart="dragTrack(event)" ondrop="dropTrack(event)" ondragover="allowDrop(event)" data-key="${i}">
    <div class="mixtapes__track-listing--entry--number">
      ${i}
    </div>
    <input value="${listing.title}" type="text" class="mixtapes__track-listing--entry--title">
    <input value="${listing.duration}" type="text" class="mixtapes__track-listing--entry--duration">
    <div class="mixtapes__track-listing--entry--delete">
      ✕
    </div>
  </div>
`


const getTrackListingData = (listing) => {
  const title = listing.querySelector('.mixtapes__track-listing--entry--title').value
  let duration = listing.querySelector('.mixtapes__track-listing--entry--duration').value
  const durationRegex = new RegExp(/([0-9]{1,2}:[0-9]{2})/)
  if (!duration.match(durationRegex))
    duration = "0:00"
  return { title, duration }
}

const getTrackListingEntries = () =>
  trackListings.querySelectorAll('.mixtapes__track-listing--entry')

// Updates the state object from the DOM
// Run when the page first loads
function updateTrackListingStateFromDOM() {
  const listings = getTrackListingEntries()
  const newState = []
  listings.forEach((listing, i) => {
    const { title, duration } = getTrackListingData(listing)
    newState.push({ title, duration })
  })
  setState(newState)
}

updateTrackListingStateFromDOM()

addTrackButton.addEventListener("click", () => {
  updateTrackListingStateFromDOM()
  trackListingState.push({ title: "", duration: "0:00" })
  renderState()
})

// Drag & drop handler
function dragTrack(e) {
  e.dataTransfer.setData("start", e.target.getAttribute("data-key"))
}

function dropTrack(e) {
  e.preventDefault()
  const start = e.dataTransfer.getData("start")
  let finish
  if (e.target.classList.contains('mixtapes__track-listing--entry')) {
    finish = e.target.getAttribute("data-key")
  }
  else {
    finish = e.target.parentElement.getAttribute("data-key")
  }
  console.log(start, finish)
}

function allowDrop(e) {
  e.preventDefault()
}