const titleInput = document.querySelector('input[name="title"]')
const publishedInput = document.querySelector('input[name="published"]')
const coverTypeSelect = document.querySelector('select[name="cover-type"]')
const coverTypeOptions = document.querySelectorAll('select[name="cover-type"] option')
const coverYoutube = document.querySelector('input[name="cover-youtube"]')
const coverImage = document.querySelector('input[name="cover-image"]')
const coverSection = document.querySelector('.dashboard__edit-article--cover')
const submitButton = document.querySelector('button[type="submit"]')

submitButton.addEventListener('click', e => submitForm(e))
coverTypeSelect.addEventListener('change', () => updateStateFromDOM())

// Only use setState() to modify state
// Poor man's React ¯\_(ツ)_/¯
const state = {
  title: "",
  html: "",
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

const renderForm = () => {
  titleInput.value = state.title
  editor.content.innerHTML = state.html
  coverSection.classList.remove('image', 'youtube')
  coverSection.classList.add(state.cover.type)
}

const setState = ({ title, html, cover, published, render = true }) => {
  state.title = title
  state.html = html
  state.cover = cover
  state.published = published
  if (render) renderForm()
}

const updateStateFromDOM = () => {
  const type = coverTypeOptions[coverTypeSelect.selectedIndex].value.toLowerCase()
  const youtubeId = type === "youtube" ? coverYoutube.value : ""
  const imageData = coverImage.files[0]
  const newState = {
    title: titleInput.value,
    html: editor.content.innerHTML,
    cover: {
      type,
      youtubeId,
      imageData
    },
    published: publishedInput.checked
  }
  setState(newState)
}

updateStateFromDOM()

const submitForm = e => {
  e.preventDefault()
  updateStateFromDOM()
  console.log(state)
}