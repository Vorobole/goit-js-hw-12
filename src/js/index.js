import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';
import axios from 'axios';
import { BASE_URL } from '../js/base-url';

const galleryContainer = document.querySelector('.gallery');
const searchForm = document.querySelector('.search-form');
const loaderContainer = document.querySelector('.loader');
const loadMoreButton = document.querySelector('.load-more-button');
const lightbox = new SimpleLightbox('.gallery-link');

let currentPage = 1;
let currentQuery = '';

searchForm.addEventListener('submit', async function (event) {
  event.preventDefault();
  const queryInput = event.target.elements.query.value.trim();

  if (queryInput === '') {
    return;
  }

  currentQuery = queryInput;
  currentPage = 1;
  galleryContainer.innerHTML = '';
  loaderContainer.style.display = 'block';

  try {
    const { hits, totalHits } = await fetchImages(currentQuery, currentPage);
    if (Array.isArray(hits) && hits.length > 0) {
      const galleryHTML = hits.map(createGallery).join('');
      galleryContainer.innerHTML = galleryHTML;
      toastSuccess(`Was found: ${totalHits} images`);
      lightbox.refresh();
      showLoadMoreButton();
    } else {
      toastError(
        'Вибачте, немає зображень, які відповідають вашому пошуковому запиту. Будь ласка спробуйте ще раз!'
      );
    }
  } catch (error) {
    toastError(`Error fetching images: ${error.message}`);
  } finally {
    searchForm.reset();
    loaderContainer.style.display = 'none';
  }
});

loadMoreButton.addEventListener('click', async function () {
  currentPage++;
  loaderContainer.style.display = 'block';

  try {
    const { hits } = await fetchImages(currentQuery, currentPage);
    if (Array.isArray(hits) && hits.length > 0) {
      const galleryHTML = hits.map(createGallery).join('');
      galleryContainer.innerHTML += galleryHTML;
      lightbox.refresh();
    } else {
      hideLoadMoreButton();
    }
  } catch (error) {
    toastError(`Error fetching more images: ${error.message}`);
  } finally {
    loaderContainer.style.display = 'none';
  }
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

async function fetchImages(q, page) {
  const params = {
    key: '42198701-b9a5fa575f7b9ea832aebf9b8',
    image_type: 'photo',
    orientation: 'horizontal',
    safeSearch: true,
    per_page: 15,
    q,
    page,
  };

  try {
    const response = await axios.get(BASE_URL, { params });
    if (!response.data) {
      throw new Error('No data found');
    }
    return response.data;
  } catch (error) {
    throw new Error(`Error fetching images: ${error.message}`);
  }
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

function showLoadMoreButton() {
  loadMoreButton.style.display = 'block';
}

function hideLoadMoreButton() {
  loadMoreButton.style.display = 'none';
}

/**
 |============================
 | Finish
 |============================
*/
const endOfCollectionMessage =
  'Вибачте, але ви досягли кінця результатів пошуку.';

function updateLoadMoreButton(totalHits) {
  if (currentPage * 15 >= totalHits) {
    hideLoadMoreButton();
    toastError(endOfCollectionMessage);
  } else {
    showLoadMoreButton();
  }
}

loadMoreButton.addEventListener('click', async function () {
  currentPage++;
  loaderContainer.style.display = 'block';

  try {
    const { hits, totalHits } = await fetchImages(currentQuery, currentPage);
    if (Array.isArray(hits) && hits.length > 0) {
      const galleryHTML = hits.map(createGallery).join('');
      galleryContainer.innerHTML += galleryHTML;
      lightbox.refresh();
    } else {
      updateLoadMoreButton(totalHits);
    }
  } catch (error) {
    toastError(`Error fetching more images: ${error.message}`);
  } finally {
    loaderContainer.style.display = 'none';
  }
});

loadMoreButton.addEventListener('click', async function () {
  currentPage++;
  loaderContainer.style.display = 'block';

  try {
    const { hits, totalHits } = await fetchImages(currentQuery, currentPage);
    if (Array.isArray(hits) && hits.length > 0) {
      const galleryHTML = hits.map(createGallery).join('');
      galleryContainer.innerHTML += galleryHTML;
      lightbox.refresh();
      smoothScrollToNextGroup();
    } else {
      updateLoadMoreButton(totalHits);
    }
  } catch (error) {
    toastError(`Error fetching more images: ${error.message}`);
  } finally {
    loaderContainer.style.display = 'none';
  }
});

function smoothScrollToNextGroup() {
  const galleryCardHeight = document
    .querySelector('.gallery-link')
    .getBoundingClientRect().height;
  const scrollHeight = galleryCardHeight * 3;
  window.scrollBy({ top: scrollHeight, behavior: 'smooth' });
}
