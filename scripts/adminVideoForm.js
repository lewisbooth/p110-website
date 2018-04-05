const youtubeIdForm = document.querySelector('.dashboard__edit-video--load-youtube-form')
const youtubeIdInput = youtubeIdForm.querySelector('input[name="youtubeId"]')
const youtubeIdInputError = document.querySelector('.dashboard__edit-video--load-youtube-form--input--error')
const youtubeDataForm = document.querySelector('.dashboard__edit-video--youtube-data')
const youtubeTitle = youtubeDataForm.querySelector('input[name="title"]')
const youtubeDescription = youtubeDataForm.querySelector('textarea[name="description"]')
const youtubeThumbnail = youtubeDataForm.querySelector('img')
const youtubeCategories = youtubeDataForm.querySelectorAll('option')
const youtubeCategorySelect = youtubeDataForm.querySelector('select')
const featuredVideo = document.querySelector('input[name=featured]')

const deleteVideoButton = document.querySelector('#dashboard__edit-video--delete')
const closeLightboxButton = document.querySelector('.lightbox__modal--cancel')
const lightbox = document.querySelector('.lightbox')

const isEditPage = window.location.toString().indexOf('edit') > 0

youtubeIdForm.addEventListener('submit', e => getYoutubeData(e))
youtubeDataForm.addEventListener('submit', e => submitYoutubeData(e))

if (isEditPage) {
  deleteVideoButton.addEventListener('click', () =>
    toggleDeleteConfirmation())
  closeLightboxButton.addEventListener('click', () =>
    toggleDeleteConfirmation())
}

const videoData = {
  youtubeId: "",
  title: "",
  description: "",
  category: "",
  featured: false,
  rawData: {}
}

updateVideoDataFromDOM()

function updateVideoDataFromDOM() {
  videoData.youtubeId = youtubeIdInput.value
  videoData.title = youtubeTitle.value
  videoData.description = youtubeDescription.value
  videoData.category = youtubeCategories[youtubeCategorySelect.selectedIndex].value
  videoData.featured = featuredVideo.checked
}

function getYoutubeData(e) {
  e.preventDefault()
  const id = youtubeIdInput.value
  if (!id) {
    flashError({ message: "Please supply a valid ID" })
    return
  }
  axios.post(`/admin/api/videos/${id}`)
    .then(res => {
      // Clear flash errors
      flashError({ error: false })
      videoData.youtubeId = id
      videoData.category = detectCategory(res.data.snippet.title)
      videoData.title = formatTitle(res.data.snippet.title)
      videoData.description = res.data.snippet.description
      videoData.rawData = res.data
      populateForm()
    })
    .catch(err => {
      console.log(err)
      const message = "Error loading data" + (err.response ? ": " + err.response.data.err : "")
      flashError({ message })
    })
}

function flashError({ error = true, message = "Error loading data" }) {
  if (error) {
    youtubeIdInput.classList.add('failed')
    youtubeDataForm.classList.add('disabled')
    youtubeIdInputError.innerText = message
  } else {
    youtubeIdInput.classList.remove('failed')
    youtubeDataForm.classList.remove('disabled')
    youtubeIdInputError.innerText = ""
  }
}

function populateForm() {
  youtubeTitle.value = videoData.title
  youtubeDescription.value = videoData.description
  youtubeThumbnail.src = `https://i.ytimg.com/vi/${videoData.youtubeId}/maxresdefault.jpg`
  youtubeCategories.forEach(category => {
    category.selected = category.value === videoData.category
  })
}

function submitYoutubeData(e) {
  e.preventDefault()
  updateVideoDataFromDOM()
  axios.post(`/admin/videos/${isEditPage ? "edit" : "new"}/${videoData.youtubeId}`, videoData)
    .then(res => {
      window.location = "/admin/videos"
    }).catch(err => {
      window.location.reload()
    })
}

const formatTitle = string => {
  return string
    .replace(/P110 - /i, '')
    .replace(/\| P110/i, '')
    .replace(/\[.*\]/i, '')
    .replace(/- #1TAKE/i, '')
    .replace(/\| #1TAKE/i, '')
    .replace(/#1TAKE/i, '')
    .replace(/- Scene Smasher/i, '')
    .replace(/Scene Smasher/i, '')
}

const detectCategory = title => {
  if (title.match(/P110 Premiere/i)) return "music-video"
  if (title.match(/Scene Smasher/i)) return "scene-smasher"
  if (title.match(/Music Video/i)) return "music-video"
  if (title.match(/Net Video/i)) return "net-video"
  if (title.match(/#1TAKE/i)) return "1take"
  return "music-video"
}

function toggleDeleteConfirmation() {
  lightbox.classList.toggle('active')
}