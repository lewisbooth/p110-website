const titleInput = document.querySelector('input[name="title"]')
const publishedInput = document.querySelector('input[name="published"]')
const coverTypeSelect = document.querySelector('select[name="cover-type"]')
const coverTypeOptions = document.querySelectorAll('select[name="cover-type"] option')
const coverYoutube = document.querySelector('input[name="cover-youtube"]')
const coverYoutubeImage = document.querySelector('.dashboard__edit-article--cover--youtube--image')
const coverImageInput = document.querySelector('input[name="cover-image"]')
const coverUserImage = document.querySelector('.dashboard__edit-article--cover--user--image')
const coverSection = document.querySelector('.dashboard__edit-article--cover')
const submitButton = document.querySelector('button[type="submit"]')
const formErrors = document.querySelector('.form-errors')
const pellContainer = document.querySelector('#pell')
const articleContent = String(pellContainer.innerText)
pellContainer.innerHTML = ""

const deleteVideoButton = document.querySelector('#dashboard__edit-video--delete')
const closeLightboxButton = document.querySelector('.lightbox__modal--cancel')
const lightbox = document.querySelector('.lightbox')

submitButton.addEventListener('click', e => submitForm(e))
coverTypeSelect.addEventListener('change', () => updateStateFromDOM(true))
coverYoutube.addEventListener('change', () => updateStateFromDOM(true))

const isEditPage = window.location.toString().indexOf('edit') > 0

if (isEditPage) {
  deleteVideoButton.addEventListener('click', () =>
    toggleDeleteConfirmation())
  closeLightboxButton.addEventListener('click', () =>
    toggleDeleteConfirmation())
}

// Only use setState() to modify state
// Poor man's React ¯\_(ツ)_/¯
const state = {
  title: "",
  html: "",
  text: "",
  cover: {
    type: "",
    youtubeId: "",
    imageData: ""
  },
  published: true
}

// Create the Pell.JS editor 
const editor = pell.init({
  element: document.getElementById('pell'),
  onChange: html => {
    setState({ html, render: false })
  },
  defaultParagraphSeparator: 'p',
  actions: [
    'bold',
    'italic',
    'underline',
    'strikethrough',
    'heading1',
    'heading2',
    'paragraph',
    'olist',
    'ulist',
    'link'
  ],
  classes: {
    actionbar: 'pell__actionbar',
    button: 'pell__button',
    content: 'pell__content',
    selected: 'pell__button-selected'
  }
})

const pellContent = document.querySelector('.pell__content')
pellContent.innerHTML = articleContent

function renderForm() {
  titleInput.value = state.title
  editor.content.innerHTML = state.html
  coverSection.classList.remove('image', 'youtube')
  coverSection.classList.add(state.cover.type)
  if (state.cover.type === "youtube") {
    if (state.cover.youtubeId) {
      coverYoutubeImage.src = `https://i.ytimg.com/vi/${state.cover.youtubeId}/hqdefault.jpg`
    } else {
      coverYoutubeImage.src = ""
    }
  }
}

function setState({ title, html, text, cover, published, render = true }) {
  state.title = title
  state.html = html
  state.text = text
  state.cover = cover
  state.published = published
  if (render) renderForm()
}

function updateStateFromDOM(render = false) {
  const selectedType = coverTypeOptions[coverTypeSelect.selectedIndex]
  const type = selectedType.value.toLowerCase()
  const youtubeId = type === "youtube" ? coverYoutube.value : ""
  const imageData = type === "image" ? coverImageInput.files[0] : ""
  const newState = {
    title: titleInput.value,
    html: editor.content.innerHTML,
    text: pellContent.innerText,
    cover: {
      type,
      youtubeId,
      imageData
    },
    published: publishedInput.checked,
    render
  }
  setState(newState)
}

updateStateFromDOM()

function errorFlash(errors = []) {
  formErrors.innerHTML = ""
  if (errors.length === 0 || errors[0] === "undefined")
    errors = ["An error occurred, please try again"]
  console.log(errors)
  errors.forEach(error => {
    const errorElement = document.createElement('p')
    errorElement.innerText = error
    formErrors.appendChild(errorElement)
  })
}

function validateForm() {
  return new Promise((resolve, reject) => {
    updateStateFromDOM()
    let errors = []
    if (!state.title)
      errors.push("Please supply a title")
    if (!state.html)
      errors.push("Please supply article content")
    if (state.cover.type === "youtube" && !state.cover.youtubeId)
      errors.push("Please supply a Youtube ID")
    if (!isEditPage && state.cover.type === "image" && !state.cover.imageData)
      errors.push("Please supply a cover image")
    if (state.cover.type === "image" && state.cover.imageData && state.cover.imageData.size > 25000000)
      errors.push("Cover image is too large (25MB limit)")
    if (errors.length > 0) {
      reject(errors)
    } else {
      resolve()
    }
  })
}
function submitForm(e) {
  e.preventDefault()
  validateForm().then(() => {
    let formData = new FormData();
    formData.append("title", state.title);
    formData.append("html", state.html);
    formData.append("text", state.text);
    formData.append("coverType", state.cover.type);
    formData.append("published", state.published);
    if (state.cover.type === "youtube")
      formData.append("coverYoutubeId", state.cover.youtubeId);
    else if (coverImageInput.files[0])
      formData.append("image", coverImageInput.files[0]);
    axios.post(window.location.href, formData).then((res) => {
      if (isEditPage) {
        window.scroll({ top: 0 })
        window.location.reload()
      } else {
        window.location = "/admin/news"
      }
    }).catch(error => {
      console.log(error)
      errorFlash([error.response.data.error])
    })
  }).catch(errors => {
    errorFlash(errors)
  })
}

function toggleDeleteConfirmation() {
  lightbox.classList.toggle('active')
}

coverImageInput.addEventListener('change', function (e) {
  if (coverImageInput.files && coverImageInput.files[0]) {
    var reader = new FileReader();
    reader.onload = function (e) {
      coverUserImage.src = e.target.result
    }
    reader.readAsDataURL(coverImageInput.files[0]);
  }
})