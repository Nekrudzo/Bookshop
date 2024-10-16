import "./base.css";

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

const API_URL =
  "https://www.googleapis.com/books/v1/volumes?q=&key=<AIzaSyBVwpoPFvi8crj5_BlFfh3QR7nMVFKyH1U>&printType=books&startIndex=0&maxResults=6&langRestrict=en"; // Пример запроса

async function fetchBooks() {
  try {
    const response = await fetch(API_URL);
    const data = await response.json();
    displayBooks(data.items);
  } catch (error) {
    console.error("Ошибка при получении данных:", error);
  }
}

function displayBooks(books) {
  const bookContainer = document.getElementById("books-list");
  bookContainer.innerHTML = ""; // Очистка контейнера перед добавлением новых карточек

  books.forEach((book) => {
    const card = document.createElement("div");
    card.className = "card";

    const cover = book.volumeInfo.imageLinks
      ? book.volumeInfo.imageLinks.thumbnail
      : "https://via.placeholder.com/150";
    const authors = book.volumeInfo.authors
      ? book.volumeInfo.authors.join(", ")
      : "Неизвестный автор";
    const title = book.volumeInfo.title || "Без названия";
    const rating = book.volumeInfo.averageRating
      ? `${book.volumeInfo.averageRating} ${getStars(
          book.volumeInfo.averageRating
        )} (${book.volumeInfo.ratingsCount || 0} отзывов)`
      : "";
    const description = book.volumeInfo.description
      ? truncateDescription(book.volumeInfo.description)
      : "Описание отсутствует";
    const price =
      book.saleInfo.saleability === "FOR_SALE"
        ? `${book.saleInfo.listPrice.amount} ${book.saleInfo.listPrice.currencyCode}`
        : null;

    card.innerHTML = `
            <img src="${cover}" alt="${title}">
            <h3>${title}</h3>
            <p>${authors}</p>
            ${rating ? `<p class="stars">${rating}</p>` : ""}
            <p class="description">${description}</p>
            ${price ? `<p>${price}</p>` : ""}
        `;

    bookContainer.appendChild(card);
  });
}

function getStars(rating) {
  const fullStars = "★".repeat(Math.floor(rating));
  const emptyStars = "★".repeat(5 - Math.floor(rating));
  return fullStars + emptyStars;
}

function truncateDescription(description) {
  const words = description.split(" ");
  if (words.length > 30) {
    return words.slice(0, 30).join(" ") + "...";
  }
  return description;
}

fetchBooks();
