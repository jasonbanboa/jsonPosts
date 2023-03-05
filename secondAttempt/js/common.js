
const $app = document.querySelector('#app');
 

const fetchJSON = path => fetch(path).then(res => res.json());

const POSTS = await fetchJSON('../../json/posts.json');
const CATEGORIES = await fetchJSON('../../json/categorys.json');
const MEMBERS = await fetchJSON('../../json/members.json');
console.log({ POSTS, CATEGORIES, MEMBERS });

// util  functions
const getUser = memberIndex => MEMBERS.find(({ index }) => memberIndex === index);

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

function renderPosts({ title, contents, date, memberIndex }) {
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
  $app.appendChild($post);
}