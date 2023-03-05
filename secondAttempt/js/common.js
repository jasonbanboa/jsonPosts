
const $app = document.querySelector('#app');
const $detailDialog = document.querySelector('#post-detail-dialog');
const $filterDialog = document.querySelector('#filter-dialog');
const $filterByUsernameInput = $filterDialog.querySelector('#filter-by-username');
const $filterByCategoriesInput = $filterDialog.querySelector('#filter-by-categories');
const $cancleButton = document.querySelector('#cancel');
const $filterButton = document.querySelector('#filter');

const fetchJSON = path => fetch(path).then(res => res.json());
const POSTS = await fetchJSON('../../json/posts.json');
const CATEGORIES = await fetchJSON('../../json/categorys.json');
const MEMBERS = await fetchJSON('../../json/members.json');

// global states
const modalStateObj = { 
  open: false,
};
const modalStatehandler = {
  set(target, key, value) {
    enableScroll();
    if (key === 'open' && value) {
      disableScroll();
    }
    target[key] = value;
    return true;
  }
};

const modalState = new Proxy(modalStateObj, modalStatehandler);
const scrollStates = { 
  // add upadting totalresultcount function
  postStartIndex: 0,
  postEndIndex: 30,
  totalResultCount: POSTS.length,
  updateScrollState: function() {
    this.postStartIndex = this.postEndIndex;
    this.postEndIndex += 30;
  }
};
const keyPressStates = {};
const filterStates = {
  username: '',
  categories: [],
  reset: function() {
    this.categories = [];
    this.username = '';
  }
}

// util  functions
const getUser = (memberIndex) => MEMBERS.find(({ index }) => memberIndex === index);
const getPost = (postId) => POSTS.find(({ index }) => index === postId);
const getCategories = (categoryIndexArray) => CATEGORIES.filter(({ index }) => categoryIndexArray.includes(index));
const makeCategoryInnerHTML = (categoriesArray) => categoriesArray.reduce((innerHTML, { name, color }) => innerHTML += `<span style="background-color: ${color}" class="category">${name}</span>`, '');
const getUserByUsername = (username) => MEMBERS.find(({ name }) => name === username);
const getCategoryByName = (categoryName) => CATEGORIES.find(({ name }) => name === categoryName); // currently not using
const categoryNameTocategoryId = (categoryName) => CATEGORIES.find(({ name }) => name === categoryName).index;
const isValidCategory = (category) => !filterStates.categories.includes(CATEGORIES.find(({ name }) => name === category).index); 

function preventScroll(e) { e.preventDefault(); e.stopPropagation(); return false; }
function disableScroll() { document.body.addEventListener('wheel', preventScroll, { passive: false }); }
function enableScroll() { document.body.removeEventListener('wheel', preventScroll, { passive: false }); }

// main

POSTS.sort((a, b) => new Date(b.date) - new Date(a.date));
POSTS.slice(0, 30).forEach(renderPosts);

window.onscroll = () => {
  const fullPageHeight = document.body.clientHeight;
  if (window.scrollY + window.innerHeight >= fullPageHeight - 200) {
    const { postStartIndex, postEndIndex, totalResultCount } = scrollStates;
    if (postEndIndex >= totalResultCount) return;
    scrollStates.updateScrollState();
    POSTS.slice(postStartIndex, postEndIndex).forEach(renderPosts);
  }
}

$detailDialog.addEventListener('click', (e) => {
  if (e.target === $detailDialog) { 
    $detailDialog.close(); 
    modalState.open = false;
  }
});

window.addEventListener('keyup', (e) => delete keyPressStates[e.key]);

window.addEventListener('keydown', (e) => { 
  if (modalState.open) return;
  keyPressStates[e.key] = true;
  if (keyPressStates.Shift && keyPressStates.Control) {
    modalState.open = true;
    $filterDialog.showModal();
  }
});

$filterDialog.addEventListener('click', (e) => {
  if (e.target === $filterDialog || e.target === $cancleButton) {
    $filterDialog.close(); 
    modalState.open = false;
  }
});

// filter name only first
$filterButton.addEventListener('click', () => {
  const username = $filterByUsernameInput.value;
  filterStates.username = username;

  console.log(filterStates);
  const filteredPosts = filterSearch(POSTS, filterStates);
  console.log(filteredPosts);
  
  filterStates.reset();
  modalState.open = false;
  $filterDialog.close();
});

$filterByCategoriesInput.addEventListener('keydown', (e) => {
  const { categories } = filterStates;
  const { value } = $filterByCategoriesInput;
  if (!value) return;
  if (e.key === 'Enter' && isValidCategory(value.toLowerCase())) {
    filterStates.categories = [...categories, categoryNameTocategoryId(value.toLowerCase())];
    $filterByCategoriesInput.value = '';
    console.log(filterStates);
  }
})

// CURRENTLY ONLY FILTERS BY CATEGORIES
function filterSearch(posts, { username, categories }) {

  const data = posts.filter(({ categorys }) => categories.every(categoryID => categorys.includes(categoryID)));
  return data;
  // const { index: userID } = getUserByUsername(username);
  // const data = posts.filter(({ memberIndex }) => memberIndex == userID);
  // console.log(data);
}

function renderPosts({ title, contents, date, memberIndex, categorys }) {
  const { name } = getUser(Number(memberIndex));
  const $post = document.createElement('article');

  $post.className = 'post';
  $post.innerHTML = `
    <div class="image"></div>
    <h3 class="title">${title}</h3>
    <p class="content">${contents}</p>
    <section class="post-details">
      <span class="created-by">${name}</span>
      <span class="timestamp">${date}</span>
    </section>
  `;    

  $post.addEventListener('click', () => {
    modalState.open = true;
    showPostDetailModal(title, contents, date, name, categorys);
  });
  $app.appendChild($post);
}

function showPostDetailModal(title, contents, date, username, categorys) {
  const categoriesArray = getCategories(categorys);
  const categoryInnerHTML = makeCategoryInnerHTML(categoriesArray)
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



