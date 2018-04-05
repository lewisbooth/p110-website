"use strict";var youtubeIdForm=document.querySelector(".dashboard__edit-video--load-youtube-form"),youtubeIdInput=youtubeIdForm.querySelector('input[name="youtubeId"]'),youtubeIdInputError=document.querySelector(".dashboard__edit-video--load-youtube-form--input--error"),youtubeDataForm=document.querySelector(".dashboard__edit-video--youtube-data"),youtubeTitle=youtubeDataForm.querySelector('input[name="title"]'),youtubeDescription=youtubeDataForm.querySelector('textarea[name="description"]'),youtubeThumbnail=youtubeDataForm.querySelector("img"),youtubeCategories=youtubeDataForm.querySelectorAll("option"),youtubeCategorySelect=youtubeDataForm.querySelector("select"),featuredVideo=document.querySelector("input[name=featured]"),deleteVideoButton=document.querySelector("#dashboard__edit-video--delete"),closeLightboxButton=document.querySelector(".lightbox__modal--cancel"),lightbox=document.querySelector(".lightbox"),isEditPage=window.location.toString().indexOf("edit")>0;youtubeIdForm.addEventListener("submit",function(e){return getYoutubeData(e)}),youtubeDataForm.addEventListener("submit",function(e){return submitYoutubeData(e)}),isEditPage&&(deleteVideoButton.addEventListener("click",function(){return toggleDeleteConfirmation()}),closeLightboxButton.addEventListener("click",function(){return toggleDeleteConfirmation()}));var videoData={youtubeId:"",title:"",description:"",category:"",featured:!1,rawData:{}};function updateVideoDataFromDOM(){videoData.youtubeId=youtubeIdInput.value,videoData.title=youtubeTitle.value,videoData.description=youtubeDescription.value,videoData.category=youtubeCategories[youtubeCategorySelect.selectedIndex].value,videoData.featured=featuredVideo.checked}function getYoutubeData(e){e.preventDefault();var t=youtubeIdInput.value;t?axios.post("/admin/api/videos/"+t).then(function(e){flashError({error:!1}),videoData.youtubeId=t,videoData.category=detectCategory(e.data.snippet.title),videoData.title=formatTitle(e.data.snippet.title),videoData.description=e.data.snippet.description,videoData.rawData=e.data,populateForm()}).catch(function(e){console.log(e),flashError({message:"Error loading data"+(e.response?": "+e.response.data.err:"")})}):flashError({message:"Please supply a valid ID"})}function flashError(e){var t=e.error,o=void 0===t||t,a=e.message,i=void 0===a?"Error loading data":a;o?(youtubeIdInput.classList.add("failed"),youtubeDataForm.classList.add("disabled"),youtubeIdInputError.innerText=i):(youtubeIdInput.classList.remove("failed"),youtubeDataForm.classList.remove("disabled"),youtubeIdInputError.innerText="")}function populateForm(){youtubeTitle.value=videoData.title,youtubeDescription.value=videoData.description,youtubeThumbnail.src="https://i.ytimg.com/vi/"+videoData.youtubeId+"/maxresdefault.jpg",youtubeCategories.forEach(function(e){e.selected=e.value===videoData.category})}function submitYoutubeData(e){e.preventDefault(),updateVideoDataFromDOM(),axios.post("/admin/videos/"+(isEditPage?"edit":"new")+"/"+videoData.youtubeId,videoData).then(function(e){window.location="/admin/videos"}).catch(function(e){window.location.reload()})}updateVideoDataFromDOM();var formatTitle=function(e){return e.replace(/P110 - /i,"").replace(/\| P110/i,"").replace(/\[.*\]/i,"").replace(/- #1TAKE/i,"").replace(/\| #1TAKE/i,"").replace(/#1TAKE/i,"").replace(/- Scene Smasher/i,"").replace(/Scene Smasher/i,"")},detectCategory=function(e){return e.match(/P110 Premiere/i)?"music-video":e.match(/Scene Smasher/i)?"scene-smasher":e.match(/Music Video/i)?"music-video":e.match(/Net Video/i)?"net-video":e.match(/#1TAKE/i)?"1take":"music-video"};function toggleDeleteConfirmation(){lightbox.classList.toggle("active")}