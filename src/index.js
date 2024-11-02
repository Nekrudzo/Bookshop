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

// Слайдер

const info = [
  { slideImgDesktop: "../Bookshop/src/images/slider/BlackFridaySale.png" },
  { slideImgDesktop: "../Bookshop/src/images/slider/OurCozyBooks.png" },
  { slideImgDesktop: "../Bookshop/src/images/slider/TopTenBooks.png" },
];

// Текущий индекс для слайда
let currentIndex = 0;

const setSlide = function (index) {
  slideImgDesktop.src = info[index].slideImgDesktop;

  pointList.children[currentIndex].children[0].src =
    "../Bookshop/src/images/icons/icon_point_no-active.svg";
  pointList.children[index].children[0].src =
    "../Bookshop/src/images/icons/icon_point_active.svg";

  currentIndex = index;
};

// Обработчик события для клика
const onSliderClick = function (evt, list) {
  let index = Array.from(list.children).findIndex(
    (child) => child.children[0] === evt.target
  );

  if (index === -1 || index === currentIndex) {
    return;
  }

  setSlide(index);
};

pointList.addEventListener("click", function (evt) {
  onSliderClick(evt, pointList);
});

// Автоматический свитч слайда
setInterval(() => {
  const nextIndex = (currentIndex + 1) % info.length;
  setSlide(nextIndex);
}, 5000);

// Карточки книг
const booksList = document.getElementById("books-list");
const loadMoreButton = document.getElementById("btn-load");

let startIndex = 0; // Начальный индекс
let resultsPerLoad = 6; // Количество книг, загружаемых при каждом нажатии кнопки
let currentCategory = ""; // Текущая выбранная категория

const placeholderImage = "../Bookshop/src/images/noImage.jpg";

// Функция для изменения количества загружаемых книг в зависимости от ширины экрана
function updateResultsPerLoad() {
  if (window.innerWidth <= 768) {
    resultsPerLoad = 3;
  } else {
    resultsPerLoad = 6;
  }
}

// Добавляем обработчик события resize для отслеживания изменений размеров окна
window.addEventListener("resize", updateResultsPerLoad);

// Вызываем функцию сразу после загрузки страницы, чтобы установить правильное начальное значение
updateResultsPerLoad();

async function fetchBooks(category) {
  const apiKey = "AIzaSyBr5b1jgr_XXyYv4Fz3EnuKjkHSwLcGqXg";
  const response = await fetch(
    `https://www.googleapis.com/books/v1/volumes?q=subject:${category}&startIndex=${startIndex}&maxResults=${resultsPerLoad}&key=${apiKey}`
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
        <button class="buy" id="buy" data-in-cart="false">Buy now</button>
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

let cartCount = 0;

document.addEventListener("click", function (event) {
  if (event.target.classList.contains("buy")) {
    const button = event.target;
    const inCart = button.getAttribute("data-in-cart") === "true";

    if (inCart) {
      button.innerText = "Buy now";
      button.setAttribute("data-in-cart", "false");
      cartCount -= 1; // Уменьшаем количество в корзине
    } else {
      button.innerText = "In the list";
      button.setAttribute("data-in-cart", "true");
      cartCount += 1; // Увеличиваем количество в корзине
    }

    updateCartCount();
  }
});

// Обновление количества товара в корзине
function updateCartCount() {
  const cartCountElement = document.getElementById("carts-count");
  if (cartCount > 0) {
    cartCountElement.innerText = cartCount;
  } else {
    cartCountElement.innerText = "";
    cartCountElement.classList.add("circle");
  }
}
