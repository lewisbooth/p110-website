const form
  = document.querySelector('.dashboard__edit-article')
const titleInput
  = form.querySelector('[name="title"]')
const artistsInput
  = form.querySelector('[name="artists"]')
const descriptionInput
  = form.querySelector('[name="description"]')
const releaseDateInput
  = form.querySelector('[name="releaseDate"]')
const publishedInput
  = form.querySelector('[name="published"]')
const mixtapeType
  = form.querySelector('[name="mixtape-type"]')
const mixtapeTypeFiles
  = form.querySelector('.dashboard__edit-mixtape--type--files')
const mixtapeTypeLink
  = form.querySelector('.dashboard__edit-mixtape--type--link')
const linkInput
  = form.querySelector('[name="externalLink"]')
const zipInput
  = form.querySelector('[name="zip"]')
const artworkInput
  = form.querySelector('[name="coverImage"]')
const artworkImage
  = form.querySelector('.dashboard__edit-mixtape--artwork')
const progressBar
  = form.querySelector('progress')
const progressBarText
  = form.querySelector('.progress-bar__percent-completed')
const progressBarContainer
  = form.querySelector('.progress-bar')
const formErrors
  = form.querySelector('.form-errors')
const trackListings
  = form.querySelector('.mixtapes__track-listing')
const addTrackButton
  = form.querySelector('.mixtapes__track-listing--add-track')
const lightbox
  = document.querySelector('.lightbox')
const deleteButton
  = document.querySelector('#dashboard__edit-video--delete')
const closeLightboxButton
  = document.querySelector('.lightbox__modal--cancel')
const defaultArtwork
  = artworkImage.src

form.addEventListener('submit', e => {
  submitForm(e)
})

function submitForm(e) {
  e.preventDefault()
  updateTrackListingStateFromDOM()
  let formData = new FormData()
  formData.append("title", titleInput.value)
  formData.append("artists", artistsInput.value)
  formData.append("description", descriptionInput.value)
  formData.append("published", publishedInput.checked)
  formData.append("releaseDate", releaseDateInput.value)
  formData.append("type", mixtapeType.value.toLowerCase())
  formData.append("trackListing", JSON.stringify(trackListingState))

  let errors = []

  if (mixtapeType.value === "Files")
    if (zipInput.files && zipInput.files[0])
      formData.append("zip", zipInput.files[0])
    else
      errors.push("Please upload zip files")

  if (mixtapeType.value === "Link")
    if (linkInput.value.length > 0)
      formData.append("externalLink", linkInput.value)
    else
      errors.push("Please add a link to the mixtape")

  if (artworkInput.files && artworkInput.files[0])
    formData.append("artwork", artworkInput.files[0])

  if (artworkInput.files[0] || zipInput.files[0])
    progressBarContainer.classList.remove('hidden')

  if (errors.length)
    return errorFlash(errors)


  // Progress bar for uploading data
  const onUploadProgress = progress => {
    let percentCompleted =
      Math.floor((progress.loaded * 100) / progress.total)
    progressBar.value = percentCompleted
    progressBarText.innerText = percentCompleted + "%"
  }

  axios.post(window.location.href, formData, { onUploadProgress })
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

function handleTypeChange() {
  if (mixtapeType.value === "Files") {
    mixtapeTypeFiles.classList.remove("hidden")
    mixtapeTypeFiles.attributes.required = true
    mixtapeTypeLink.classList.add("hidden")
    mixtapeTypeLink.attributes.required = false
  } else {
    mixtapeTypeLink.classList.remove("hidden")
    mixtapeTypeLink.attributes.required = true
    mixtapeTypeFiles.classList.add("hidden")
    mixtapeTypeFiles.attributes.required = false
  }
}

handleTypeChange()
mixtapeType.addEventListener('change', handleTypeChange)

// Instant preview of cover artwork from local storage
artworkInput.addEventListener('change', e => {
  if (artworkInput.files && artworkInput.files[0]) {
    var reader = new FileReader()
    reader.onload = e => {
      artworkImage.src = e.target.result
      artworkImage.classList.remove('hidden')
    }
    reader.readAsDataURL(artworkInput.files[0])
  } else {
    artworkImage.src = defaultArtwork
  }
})

// Lightbox
if (deleteButton) {
  deleteButton.addEventListener('click', () =>
    lightbox.classList.toggle('active')
  )
  closeLightboxButton.addEventListener('click', () =>
    lightbox.classList.toggle('active')
  )
}

// Track Listings

// We keep the state in a global array
let trackListingState = []
updateTrackListingStateFromDOM()

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

function generateListingMarkup(listing, i) {
  return `
  <div class="mixtapes__track-listing--entry" draggable="true" ondragstart="dragTrack(event)" ondrop="dropTrack(event)" ondragover="allowDrop(event)" data-key="${i}">
    <div class="mixtapes__track-listing--entry--number">
      ${i}
    </div>
    <input value="${listing.title}" oninput="updateTrackListingStateFromDOM(false)" type="text" class="mixtapes__track-listing--entry--title">
    <input value="${listing.duration}" oninput="updateTrackListingStateFromDOM(false)" type="text" class="mixtapes__track-listing--entry--duration">
    <div class="mixtapes__track-listing--entry--delete">
      ✕
    </div>
  </div>`
}


function getTrackListingData(listing) {
  const title = listing.querySelector('.mixtapes__track-listing--entry--title').value
  let duration = listing.querySelector('.mixtapes__track-listing--entry--duration').value
  const durationRegex = new RegExp(/([0-9]{1,2}:[0-9]{2})/)
  if (!duration.match(durationRegex))
    duration = "0:00"
  return { title, duration }
}

function getTrackListingEntries() {
  return trackListings
    .querySelectorAll('.mixtapes__track-listing--entry')
}

// Updates the state object from the DOM
// Run every time the form changes
function updateTrackListingStateFromDOM(render = true) {
  const listings = getTrackListingEntries()
  const newState = []
  listings.forEach((listing, i) => {
    const { title, duration } = getTrackListingData(listing)
    newState.push({ title, duration })
  })
  // If we re-render inputs whilst the user is typing, the inputs lose focus. The render flag bypasses re-rendering.
  if (render)
    setState(newState)
  else
    trackListingState = newState
}

addTrackButton.addEventListener("click", () => {
  updateTrackListingStateFromDOM()
  trackListingState.push({ title: "", duration: "0:00" })
  renderState()
})

// Store the index of dragged track
function dragTrack(e) {
  e.dataTransfer.setData("start", e.target.getAttribute("data-key"))
}

// Moves the dragged element in the state array
function dropTrack(e) {
  e.preventDefault()
  const start = e.dataTransfer.getData("start")
  let finish =
    e.target.classList.contains('mixtapes__track-listing--entry') ?
      e.target.getAttribute("data-key") :
      e.target.parentElement.getAttribute("data-key")
  // Remove the dragged element from state into new variable
  let state = [...trackListingState]
  const dragged = state.splice(start, 1)
  // Re-insert dragged element at new position
  state.splice(finish, 0, dragged[0])
  setState(state)
}

function allowDrop(e) {
  e.preventDefault()
}