"use strict";var titleInput=document.querySelector('input[name="title"]'),publishedInput=document.querySelector('input[name="published"]'),coverTypeSelect=document.querySelector('select[name="cover-type"]'),coverTypeOptions=document.querySelectorAll('select[name="cover-type"] option'),coverYoutube=document.querySelector('input[name="cover-youtube"]'),coverYoutubeImage=document.querySelector(".dashboard__edit-article--cover--youtube--image"),coverImageInput=document.querySelector('input[name="cover-image"]'),coverUserImage=document.querySelector(".dashboard__edit-article--cover--user--image"),coverSection=document.querySelector(".dashboard__edit-article--cover"),submitButton=document.querySelector('button[type="submit"]'),formErrors=document.querySelector(".form-errors"),pellContainer=document.querySelector("#pell"),articleContent=String(pellContainer.innerText);pellContainer.innerHTML="";var deleteVideoButton=document.querySelector("#dashboard__edit-video--delete"),closeLightboxButton=document.querySelector(".lightbox__modal--cancel"),lightbox=document.querySelector(".lightbox");submitButton.addEventListener("click",function(e){return submitForm(e)}),coverTypeSelect.addEventListener("change",function(){return updateStateFromDOM(!0)}),coverYoutube.addEventListener("change",function(){return updateStateFromDOM(!0)});var isEditPage=window.location.toString().indexOf("/edit/")>0;isEditPage&&(deleteVideoButton.addEventListener("click",function(){return toggleDeleteConfirmation()}),closeLightboxButton.addEventListener("click",function(){return toggleDeleteConfirmation()}));var state={title:"",html:"",text:"",cover:{type:"",youtubeId:"",imageData:""},published:!0},editor=pell.init({element:document.getElementById("pell"),onChange:function(e){setState({html:e,render:!1})},defaultParagraphSeparator:"p",actions:["bold","italic","underline","strikethrough","heading1","heading2","paragraph","olist","ulist","link"],classes:{actionbar:"pell__actionbar",button:"pell__button",content:"pell__content",selected:"pell__button-selected"}}),pellContent=document.querySelector(".pell__content");function renderForm(){titleInput.value=state.title,editor.content.innerHTML=state.html,coverSection.classList.remove("image","youtube"),coverSection.classList.add(state.cover.type),"youtube"===state.cover.type&&(state.cover.youtubeId?coverYoutubeImage.src="https://i.ytimg.com/vi/"+state.cover.youtubeId+"/hqdefault.jpg":coverYoutubeImage.src="")}function setState(e){var t=e.title,o=e.html,r=e.text,n=e.cover,a=e.published,i=e.render,c=void 0===i||i;state.title=t,state.html=o,state.text=r,state.cover=n,state.published=a,c&&renderForm()}function updateStateFromDOM(){var e=arguments.length>0&&void 0!==arguments[0]&&arguments[0],t=coverTypeOptions[coverTypeSelect.selectedIndex].value.toLowerCase(),o="youtube"===t?coverYoutube.value:"",r="image"===t?coverImageInput.files[0]:"";setState({title:titleInput.value,html:editor.content.innerHTML,text:pellContent.innerText,cover:{type:t,youtubeId:o,imageData:r},published:publishedInput.checked,render:e})}function errorFlash(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:[];formErrors.innerHTML="",0!==e.length&&"undefined"!==e[0]||(e=["An error occurred, please try again"]),console.log(e),e.forEach(function(e){var t=document.createElement("p");t.innerText=e,formErrors.appendChild(t)})}function validateForm(){return new Promise(function(e,t){updateStateFromDOM();var o=[];state.title||o.push("Please supply a title"),state.html||o.push("Please supply article content"),"youtube"!==state.cover.type||state.cover.youtubeId||o.push("Please supply a Youtube ID"),isEditPage||"image"!==state.cover.type||state.cover.imageData||o.push("Please supply a cover image"),"image"===state.cover.type&&state.cover.imageData&&state.cover.imageData.size>25e6&&o.push("Cover image is too large (25MB limit)"),o.length>0?t(o):e()})}function submitForm(e){e.preventDefault(),validateForm().then(function(){var e=new FormData;e.append("title",state.title),e.append("html",state.html),e.append("text",state.text),e.append("coverType",state.cover.type),e.append("published",state.published),"youtube"===state.cover.type?e.append("coverYoutubeId",state.cover.youtubeId):coverImageInput.files[0]&&e.append("image",coverImageInput.files[0]),axios.post(window.location.href,e).then(function(e){isEditPage?(window.scroll({top:0}),window.location.reload()):window.location="/admin/news"}).catch(function(e){console.log(e),errorFlash([e.response.data.error])})}).catch(function(e){errorFlash(e)})}function toggleDeleteConfirmation(){lightbox.classList.toggle("active")}pellContent.innerHTML=articleContent,updateStateFromDOM(),coverImageInput.addEventListener("change",function(e){if(coverImageInput.files&&coverImageInput.files[0]){var t=new FileReader;t.onload=function(e){coverUserImage.src=e.target.result},t.readAsDataURL(coverImageInput.files[0])}});