import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';

const galleryContainer = document.querySelector('.gallery');

const searchForm = document.querySelector('.search-form');

const loaderContainer = document.querySelector('.loader');

const lightbox = new SimpleLightbox(`.gallery-link`);

searchForm.addEventListener('submit', function (event) {
  event.preventDefault();
  const queryInput = event.target.elements.query.value.trim();

  if (queryInput === '') {
    return;
  }

  galleryContainer.innerHTML = '';
  loaderContainer.style.display = 'block';

  fetchImages(queryInput)
    .then(function ({ hits, totalHits }) {
      if (Array.isArray(hits) && hits.length > 0) {
        const galleryHTML = hits.map(createGallery).join('');
        galleryContainer.innerHTML = galleryHTML;

        toastSuccess(`Was found: ${totalHits} images`);

        lightbox.refresh();
      } else {
        toastError(
          'Sorry, there are no images matching your search query. Please try again!'
        );
      }
    })
    .catch(function (error) {
      toastError(`Error fetching images: ${error}`);
    })
    .finally(function () {
      searchForm.reset();
      loaderContainer.style.display = 'none';
    });
});

const toastOptions = {
  titleColor: '#FFFFFF',
  messageColor: '#FFFFFF',
  messageSize: '16px',
  position: 'topRight',
  displayMode: 'replace',
  closeOnEscape: true,
  pauseOnHover: false,
  maxWidth: 432,
  messageSize: '16px',
  messageLineHeight: '24px',
};

function toastError(message) {
  iziToast.show({
    message,
    backgroundColor: '#EF4040',
    progressBarColor: '#FFE0AC',
    icon: 'icon-close',
    ...toastOptions,
  });
}

function toastSuccess(message) {
  iziToast.show({
    message,
    backgroundColor: '#59A10D',
    progressBarColor: '#B5EA7C',
    icon: 'icon-chek',
    ...toastOptions,
  });
}

const BASE_URL = 'https://pixabay.com/api/';

function fetchImages(q) {
  const searchParams = new URLSearchParams({
    key: '42198701-b9a5fa575f7b9ea832aebf9b8',
    q,
    image_type: 'photo',
    orientation: 'horizontal',
    safeSearch: true,
  });

  const PARAMS = `?${searchParams}`;
  const url = BASE_URL + PARAMS;

  return fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error(response.status);
      }
      return response.json();
    })
    .catch(error => {
      toastError(`Error fetching images: ${error}`);
      throw error;
    });
}

function createGallery({
  largeImageURL,
  tags,
  webformatURL,
  likes,
  views,
  comments,
  downloads,
}) {
  return `
  <a href="${largeImageURL}" class="gallery-link">
     <figure>
      <img src="${webformatURL}" alt="${tags}" class="gallery-image">
      <figcaption class="gallery__figcaption">
        <div class="image-item">Likes <span class="image-elem">${likes}</span></div>
        <div class="image-item">Views <span class="image-elem">${views}</span></div>
        <div class="image-item">Comments <span class="image-elem">${comments}</span></div>
        <div class="image-item">Downloads <span class="image-elem">${downloads}</span></div>
  </figcaption>
  </figure>
</a>
`;
}
