const form = document.querySelector('.dashboard__edit-article')

const titleInput = form.querySelector('input[name="title"]')
const artistsInput = form.querySelector('input[name="artists"]')
const descriptionInput = form.querySelector('textarea[name="description"]')
const releaseDateInput = form.querySelector('input[name="releaseDate"]')
const publishedInput = form.querySelector('input[name="published"]')
const zipInput = form.querySelector('input[name="zip"]')
const artworkInput = form.querySelector('input[name="coverImage"]')
const artworkImage = form.querySelector('.dashboard__edit-mixtape--artwork')
const defaultArtwork = artworkImage.src
const formErrors = document.querySelector('.form-errors')

const lightbox = document.querySelector('.lightbox')
const deleteButton = document.querySelector('#dashboard__edit-video--delete')
const closeLightboxButton = document.querySelector('.lightbox__modal--cancel')

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
  let formData = new FormData();
  formData.append("title", titleInput.value);
  formData.append("artists", artistsInput.value);
  formData.append("description", descriptionInput.value);
  formData.append("published", publishedInput.checked);
  formData.append("releaseDate", releaseDateInput.value);
  if (zipInput.files && zipInput.files[0])
    formData.append("zip", zipInput.files[0]);
  if (artworkInput.files && artworkInput.files[0])
    formData.append("artwork", artworkInput.files[0]);

  axios.post(window.location.href, formData).then(res => {
    window.location = "/admin/mixtapes"
  }).catch(error => {
    console.log(error)
    errorFlash([error.response.data.error])
  })
}

function errorFlash(errors = []) {
  formErrors.innerHTML = ""
  if (errors.length === 0 || errors[0] === "undefined")
    errors = ["An error occurred, please try again"]
  errors.forEach(error => {
    if (error === undefined) error = "An error occured"
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