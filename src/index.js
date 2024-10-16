import "./scss/base.css";

const pointList = document.getElementById("point-list");
const slideImgDesktop = document.getElementById("slide-img-desktop");
const navLinks = document.querySelectorAll(".header__list a");
const booksLinks = document.querySelectorAll("#nav a");
const loadButton = document.getElementById("btn-load");
const categories = document.querySelectorAll(".categories__item");

// Выделение активной ссылки

navLinks.forEach((link) => {
  link.addEventListener("click", function () {
    navLinks.forEach((l) => l.classList.remove("active"));
    this.classList.add("active");
  });
});

// Выделение активной категории

booksLinks.forEach((link) => {
  link.addEventListener("click", function () {
    booksLinks.forEach((link) => link.classList.remove("active"));
    this.classList.add("active");
  });
});

// SLIDER

// Image information for slider
const info = [
  { slideImgDesktop: "../Bookshop/src/images/slider/BlackFridaySale.png" },
  { slideImgDesktop: "../Bookshop/src/images/slider/OurCozyBooks.png" },
  { slideImgDesktop: "../Bookshop/src/images/slider/TopTenBooks.png" },
];

// Current index for slides
let currentIndex = 0; // Initialize currentIndex to 0

// Function that sets the slide based on the index
const setSlide = function (index) {
  // Set the image source for the current slide
  slideImgDesktop.src = info[index].slideImgDesktop;

  // Update the point navigation images
  pointList.children[currentIndex].children[0].src =
    "../Bookshop/src/images/icons/icon_point_no-active.svg";
  pointList.children[index].children[0].src =
    "../Bookshop/src/images/icons/icon_point_active.svg";

  // Update currentIndex
  currentIndex = index;
};

// Event handler for slider click
const onSliderClick = function (evt, list) {
  let index = Array.from(list.children).findIndex(
    (child) => child.children[0] === evt.target
  );

  if (index === -1 || index === currentIndex) {
    return; // Skip if the clicked element is not valid or is already the current index
  }

  setSlide(index);
};

// Setting up click event listener for points
pointList.addEventListener("click", function (evt) {
  onSliderClick(evt, pointList);
});

// Automatic slide switching
setInterval(() => {
  const nextIndex = (currentIndex + 1) % info.length; // Get next index in a loop
  setSlide(nextIndex);
}, 5000);

// Books cards
const booksList = document.getElementById("books-list");
const loadMoreButton = document.getElementById("btn-load");

let startIndex = 0; // Начальный индекс
const resultsPerLoad = 6; // Количество книг, загружаемых при каждом нажатии кнопки

const placeholderImage = "https://via.placeholder.com/150";

async function fetchBooks() {
  const response = await fetch(
    `https://www.googleapis.com/books/v1/volumes?q=subject:programming&startIndex=${startIndex}&maxResults=${resultsPerLoad}`
  );
  const data = await response.json();
  return data.items || [];
}

function createBookCard(book) {
  const card = document.createElement("div");
  card.classList.add("card");

  const title = book.volumeInfo.title;
  const authors = book.volumeInfo.authors
    ? book.volumeInfo.authors.join(", ")
    : "Не указано";
  const cover = book.volumeInfo.imageLinks
    ? book.volumeInfo.imageLinks.thumbnail
    : placeholderImage;
  const rating = book.volumeInfo.averageRating;
  const ratingsCount = book.volumeInfo.ratingsCount;
  const description = book.volumeInfo.description || "Нет описания";
  const price =
    book.saleInfo.saleability === "FOR_SALE" && book.saleInfo.listPrice
      ? `${book.saleInfo.listPrice.amount} ${book.saleInfo.listPrice.currencyCode}`
      : "";

  card.innerHTML = `
        <img src="${cover}" alt="${title}" />
        <h3>${title}</h3>
        <p>${authors}</p>
        ${
          rating
            ? `<p class="rating">${"★".repeat(Math.round(rating))} (${
                ratingsCount || 0
              })</p>`
            : ""
        }
        <p class="description">${description}</p>
        ${price ? `<p class="price">${price}</p>` : ""}
    `;
  return card;
}

async function loadBooks() {
  const books = await fetchBooks();

  // Если книг нет, скрываем кнопку "Load More"
  if (books.length === 0) {
    loadMoreButton.style.display = "none";
    return;
  }

  books.forEach((book) => {
    const card = createBookCard(book);
    booksList.appendChild(card);
  });

  startIndex += resultsPerLoad; // Увеличиваем индекс для следующей загрузки
}

// Обработчик события для кнопки "Load More"
loadMoreButton.addEventListener("click", loadBooks);

// Изначальная загрузка книг при старте
loadBooks();
