
const $app = document.querySelector('#app');
const $detailDialog = document.querySelector('#post-detail-dialog');

const fetchJSON = path => fetch(path).then(res => res.json());
const POSTS = await fetchJSON('../../json/posts.json');
const CATEGORIES = await fetchJSON('../../json/categorys.json');
const MEMBERS = await fetchJSON('../../json/members.json');


// util  functions
const getUser = (memberIndex) => MEMBERS.find(({ index }) => memberIndex === index);
const getPost = (postId) => POSTS.find(({ index }) => index === postId);
const getCategories = (categoryIndexArray) => CATEGORIES.filter(({ index }) => categoryIndexArray.includes(index));
const makeCategoryInnerHTML = (categoriesArray) => categoriesArray.reduce((innerHTML, { name, color }) => innerHTML += `<span style="background-color: ${color}" class="category">${name}</span>`, '');
// main

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

POSTS.sort((a, b) => new Date(b.date) - new Date(a.date));
POSTS.slice(0, 30).forEach(renderPosts);

window.onscroll = () => {
  const fullPageHeight = document.body.clientHeight;
  const clientView = window.innerHeight;
  const scrollDistance = window.scrollY;
  if (scrollDistance + clientView >= fullPageHeight - 200) {
    const { postStartIndex, postEndIndex, totalResultCount } = scrollStates;
    if (postEndIndex >= totalResultCount) return;
    scrollStates.updateScrollState();
    POSTS.slice(postStartIndex, postEndIndex).forEach(renderPosts);
  }
}

$detailDialog.addEventListener('click', (e) => {
  if (e.target === $detailDialog) $detailDialog.close();
})

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

