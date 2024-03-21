// Custom Http Module
function customHttp() {
  return {
    get(url, cb) {
      try {
        const xhr = new XMLHttpRequest();
        xhr.open("GET", url);
        xhr.addEventListener("load", () => {
          if (Math.floor(xhr.status / 100) !== 2) {
            cb(`Error. Status code: ${xhr.status}`, xhr);
            return;
          }
          const response = JSON.parse(xhr.responseText);
          cb(null, response);
        });

        xhr.addEventListener("error", () => {
          cb(`Error. Status code: ${xhr.status}`, xhr);
        });

        xhr.send();
      } catch (error) {
        cb(error);
      }
    },
    post(url, body, headers, cb) {
      try {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", url);
        xhr.addEventListener("load", () => {
          if (Math.floor(xhr.status / 100) !== 2) {
            cb(`Error. Status code: ${xhr.status}`, xhr);
            return;
          }
          const response = JSON.parse(xhr.responseText);
          cb(null, response);
        });

        xhr.addEventListener("error", () => {
          cb(`Error. Status code: ${xhr.status}`, xhr);
        });

        if (headers) {
          Object.entries(headers).forEach(([key, value]) => {
            xhr.setRequestHeader(key, value);
          });
        }

        xhr.send(JSON.stringify(body));
      } catch (error) {
        cb(error);
      }
    },
  };
}
// Init http module
const http = customHttp();

//  init selects
document.addEventListener("DOMContentLoaded", function () {
  M.AutoInit();
  loadNews();
});

const newsService = (function () {
  const apiKey = "602e4234e0c84b819f2e05f6cd9491e1";
  const apiUrl = "https://newsapi.org/v2";
  return {
    topHeadlines(country = "us", category = "technology", cb) {
      http.get(
        `${apiUrl}/top-headlines?country=${country}&category=${category}&apiKey=${apiKey}`,
        cb
      );
    },
    everything(query, cb) {
      http.get(`${apiUrl}/everything?q=${query}&apiKey=${apiKey}`, cb);
    },
  };
})();

//element

const form = document.forms["newsControls"];
const countrySelect = form.elements["country"];
const searchInput = form.elements["search"];
const categorySelect = form.elements["category"];

//event
form.addEventListener("submit", (e) => {
  e.preventDefault();
  console.log(e.target);
  loadNews();
});

//load function
function loadNews() {
  showLoader();
  const country = countrySelect.value;
  const searchText = searchInput.value;
  const category = categorySelect.value;
  if (!searchText) {
    newsService.topHeadlines(country, category, onGetResponse);
  } else {
    newsService.everything(searchText, onGetResponse);
  }
  // newsService.topHeadlines("us", onGetResponse);
}

//function on get response

function onGetResponse(err, res) {
  removePreloader();
  if (err) {
    showAllert(err, "error-msg");
  }
  if (!res.articles.length) {
    showNotresponse("uncorinvalid requestect ");
  }
  renderNews(res.articles);
}

//function render News
function renderNews(news) {
  const newsContainer = document.querySelector(".news-container .row");
  if (newsContainer.children.length) {
    clearContainer(newsContainer);
  }
  let fragment = "";
  news.forEach((newsItem) => {
    const el = newTemplate(newsItem);
    fragment += el;
  });
  newsContainer.insertAdjacentHTML("afterbegin", fragment);
}

//function clear container

function clearContainer(container) {
  let child = container.lastElementChild;
  while (child) {
    container.removeChild(child);
    child = container.lastElementChild;
  }
}

// function template news
function newTemplate({ urlToImage, title, url, description }) {
  return `
    <div class="col s12">
        <div class="card">
            <div class="card-image">
            <img src="${urlToImage}" alt="Image" onError="this.src='i.webp'">
            <span class="card-title">${title || ""}</span>
            </div>
            <div class="card-content">
            <p>${description || ""}</p>
            </div>
            <div class="card-action">
            <a href="${url}">Read More</a>
            </div>
        </div>
    </div>
  `;
}

function showAllert(msg, type = "success") {
  M.toast({ html: msg, classes: type });
}

function showNotresponse(msg, type = "success") {
  M.toast({ html: msg, classes: type });
}

//show load function
function showLoader() {
  document.body.insertAdjacentHTML(
    "afterbegin",
    `<div class="progress">
    <div class="indeterminate"></div>
  </div>
  `
  );
}

//remove loader function
function removePreloader() {
  const loader = document.querySelector(".progress");
  if (loader) {
    loader.remove();
  }
}
