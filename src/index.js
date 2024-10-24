import "./scss/base.css";

const pointList = document.getElementById("point-list");
const slideImgDesktop = document.getElementById("slide-img-desktop");
const navLinks = document.querySelectorAll(".header__list a");

// Выделение активной ссылки

navLinks.forEach((link) => {
  link.addEventListener("click", function () {
    navLinks.forEach((l) => l.classList.remove("active"));
    this.classList.add("active");
  });
});

// Выделение активной категории

document.addEventListener("DOMContentLoaded", function () {
  // Находим все элементы категории
  const categoryItems = document.querySelectorAll(".categories__item");

  // Устанавливаем обработчик события клика для каждого элемента
  categoryItems.forEach((item) => {
    item.addEventListener("click", function (event) {
      event.preventDefault(); // Предотвращаем переход по ссылке

      // Удаляем класс активной категории от всех элементов
      categoryItems.forEach((el) => el.classList.remove("active"));

      // Добавляем класс активной категории к текущему элементу
      this.classList.add("active");
    });
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
let currentCategory = ""; // Текущая выбранная категория

const placeholderImage = "https://via.placeholder.com/150";

async function fetchBooks(category) {
  const response = await fetch(
    `https://www.googleapis.com/books/v1/volumes?q=subject:${category}&startIndex=${startIndex}&maxResults=${resultsPerLoad}`
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
        <div class="card-content">
        <p>${authors}</p>
        <h3>${title}</h3>
        ${
          rating
            ? `<p class="rating">${"★".repeat(Math.round(rating))} (${
                ratingsCount || 0
              })</p>`
            : ""
        }
        <p class="description">${description}</p>
        ${price ? `<p class="price">${price}</p>` : ""}
        <button class="buy">Buy now</button>
        </div>
    `;
  return card;
}

async function loadBooks() {
  const books = await fetchBooks(currentCategory);

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

// Обработчик событий для кнопок категорий
document.querySelectorAll(".categories__item").forEach((item) => {
  item.addEventListener("click", function (e) {
    e.preventDefault(); // Отменяем стандартное поведение ссылки
    currentCategory = this.dataset.category; // Получаем категорию из атрибута data-*
    booksList.innerHTML = ""; // Очищаем список книг
    startIndex = 0; // Сброс индекса
    loadBooks(); // Загружаем книги для выбранной категории

    // Обновляем активный элемент навигации
    document
      .querySelector(".categories__item.active")
      .classList.remove("active");
    this.classList.add("active");
  });
});

// Изначальная загрузка книг при старте
currentCategory = "architecture"; // Устанавливаем начальную категорию
loadBooks();

//Добавление книг в корзину

const cartCountDisplay = document.querySelector(".circle");
let cartCount = 0;
const cartItems = {};

// Функция для обработки нажатия на кнопку "Buy now"
function toggleCart(event) {
  const button = event.target.closest(".buy");
  if (!button) return;

  const bookCard = button.closest(".book-list__card");
  const title = bookCard.getAttribute("data-title");

  if (cartItems[title]) {
    // Удаляем один экземпляр товара из корзины
    cartItems[title]--;
    button.classList.remove("in-cart");
    button.textContent = "Buy now";

    // Если количество стало 0, удаляем книгу из корзины
    if (cartItems[title] <= 0) {
      delete cartItems[title];
    }
    cartCount--;
  } else {
    // Добавляем товар в корзину
    cartItems[title] = (cartItems[title] || 0) + 1;
    button.classList.add("in-cart");
    button.textContent = "In the cart";
    cartCount++;
  }

  // Обновляем отображение количества товаров в корзине
  cartCountDisplay.textContent = cartCount > 0 ? cartCount : 0;
}

document.querySelector(".book-list").addEventListener("click", toggleCart);
