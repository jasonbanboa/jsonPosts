const $app = document.querySelector("#app");
const $detailDialog = document.querySelector("#post-detail-dialog");
const $filterDialog = document.querySelector("#filter-dialog");
const $filterByUsernameInput = $filterDialog.querySelector(
  "#filter-by-username"
);
const $filterByCategoriesInput = $filterDialog.querySelector(
  "#filter-by-categories"
);
const $cancleButton = document.querySelector("#cancel");
const $filterButton = document.querySelector("#filter");

const fetchJSON = (path) => fetch(path).then((res) => res.json());
const POSTS = await fetchJSON("../../json/posts.json");
const CATEGORIES = await fetchJSON("../../json/categorys.json");
const MEMBERS = await fetchJSON("../../json/members.json");

// global states
const modalState = new Proxy(
  { open: false },
  {
    set(target, key, value) {
      enableScroll();
      if (key === "open" && value) {
        disableScroll();
      }
      target[key] = value;
      return true;
    },
  }
);

const scrollStates = {
  postStartIndex: 0,
  postEndIndex: 30,
  arr: POSTS,
  totalResultCount: POSTS.length,
  updateScrollState: function () {
    this.postStartIndex = this.postEndIndex;
    this.postEndIndex += 30;
  },
  resetIndex: function () {
    this.postStartIndex = 0;
    this.postEndIndex = 30;
  },
  updateResult: function (arr) {
    this.arr = arr;
    this.totalResultCount = arr.length;
  },
};
const keyPressStates = {};
const filterStates = {
  username: "",
  categories: [],
  reset: function () {
    this.categories = [];
    this.username = "";
  },
};

// util functions
const removePosts = () =>
  document.querySelectorAll(".post").forEach(($post) => $post.remove());
const getUser = (memberIndex) =>
  MEMBERS.find(({ index }) => memberIndex === index);
const getCategories = (categoryIndexArray) =>
  CATEGORIES.filter(({ index }) => categoryIndexArray.includes(index));
const makeCategoryInnerHTML = (categoriesArray) =>
  categoriesArray.reduce(
    (innerHTML, { name, color }) =>
      (innerHTML += `<span style="background-color: ${color}" class="category">${name}</span>`),
    ""
  );
const categoryNameTocategoryId = (categoryName) =>
  CATEGORIES.find(({ name }) => name === categoryName).index;
const isValidCategory = (category) =>
  !filterStates.categories.includes(categoryNameTocategoryId(category));
const filterByCategories = (arr, categories) =>
  arr.filter(({ categorys }) =>
    categories.every((categoryID) => categorys.includes(categoryID))
  );
const filterByUsername = (arr, username) => {
  const userData = MEMBERS.find(({ name }) => name === username);
  if (!userData) return false;
  return arr.filter(({ memberIndex }) => memberIndex === userData.index);
};
function filterSearch(posts, { username, categories }) {
  const filteredByUsername = filterByUsername(posts, username);
  const fileredByCategories = filterByCategories(posts, categories);

  if (categories && !filteredByUsername) return fileredByCategories;
  if (!filteredByUsername) return false;
  if (filteredByUsername && !categories) return filteredByUsername;
  return filterByCategories(filteredByUsername, categories);
}

function preventScroll(e) {
  e.preventDefault();
  e.stopPropagation();
  return false;
}
function disableScroll() {
  document.body.addEventListener("wheel", preventScroll, { passive: false });
}
function enableScroll() {
  document.body.removeEventListener("wheel", preventScroll, { passive: false });
}

// main
POSTS.sort((a, b) => new Date(b.date) - new Date(a.date));
POSTS.slice(0, 30).forEach(renderPosts);

window.onscroll = () => {
  const fullPageHeight = document.body.clientHeight;
  if (window.scrollY + window.innerHeight >= fullPageHeight - 200) {
    const { postStartIndex, postEndIndex, totalResultCount, arr } =
      scrollStates;
    if (postStartIndex >= totalResultCount) return;
    console.log(scrollStates);
    scrollStates.updateScrollState();
    console.log(scrollStates);
    arr.slice(postStartIndex, postEndIndex).forEach(renderPosts);
  }
};

$detailDialog.addEventListener("click", (e) => {
  if (e.target === $detailDialog) {
    $detailDialog.close();
    modalState.open = false;
  }
});

window.addEventListener("keyup", (e) => delete keyPressStates[e.key]);

window.addEventListener("keydown", (e) => {
  if (modalState.open) return;
  keyPressStates[e.key] = true;
  if (keyPressStates.Shift && keyPressStates.Control) {
    modalState.open = true;
    $filterDialog.showModal();
  }
});

$filterDialog.addEventListener("click", (e) => {
  if (e.target === $filterDialog || e.target === $cancleButton) {
    $filterDialog.close();
    modalState.open = false;
  }
});

$filterByCategoriesInput.addEventListener("keydown", (e) => {
  const { categories } = filterStates;
  const { value } = $filterByCategoriesInput;
  if (!value) return;
  if (e.key === "Enter" && isValidCategory(value.toLowerCase())) {
    filterStates.categories = [
      ...categories,
      categoryNameTocategoryId(value.toLowerCase()),
    ];
    $filterByCategoriesInput.value = "";
    console.log(filterStates);
  }
});

$filterButton.addEventListener("click", () => {
  const username = $filterByUsernameInput.value;
  filterStates.username = username;

  console.log(filterStates);
  const filteredPosts = filterSearch(POSTS, filterStates);
  window.scrollTo(0, 0);
  scrollStates.resetIndex();
  scrollStates.updateResult(filteredPosts);
  removePosts();
  filterStates.reset();
  modalState.open = false;
  $filterDialog.close();
  console.log(filteredPosts, scrollStates);
});

function renderPosts({ title, contents, date, memberIndex, categorys }) {
  const { name } = getUser(Number(memberIndex));
  const $post = document.createElement("article");

  $post.className = "post";
  $post.innerHTML = `
    <div class="image"></div>
    <h3 class="title">${title}</h3>
    <p class="content">${contents}</p>
    <section class="post-details">
      <span class="created-by">${name}</span>
      <span class="timestamp">${date}</span>
    </section>
  `;

  $post.addEventListener("click", () => {
    modalState.open = true;
    showPostDetailModal(title, contents, date, name, categorys);
  });
  $app.appendChild($post);
}

function showPostDetailModal(title, contents, date, username, categorys) {
  const categoriesArray = getCategories(categorys);
  const categoryInnerHTML = makeCategoryInnerHTML(categoriesArray);
  $detailDialog.showModal();

  $detailDialog.innerHTML = `
    <div>
      <div class="image"></div>
      <h3 class="title">${title}</h3>
      <p class="content">${contents}</p>
      <section class="categories">${categoryInnerHTML}</section>
      <section class="post-details">
        <span class="created-by">${username}</span>
        <span class="timestamp">${date}</span>
      </section>
    </div>
  `;
}
