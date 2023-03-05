
const $app = document.querySelector('#app');
 

const fetchJSON = path => fetch(path).then(res => res.json());

const POSTS = await fetchJSON('../../json/posts.json');
const CATEGORIES = await fetchJSON('../../json/categorys.json');
const MEMBERS = await fetchJSON('../../json/members.json');
console.log({ POSTS, CATEGORIES, MEMBERS });

// util  functions
const getUser = memberIndex => MEMBERS.filter(({ index }) => memberIndex === index)[0];

// main
POSTS.sort((a, b) => new Date(b.date) - new Date(a.date));
POSTS.forEach(post => renderPosts(post));


function renderPosts({ title, contents, date, memberIndex }) {
  const { name } = getUser(Number(memberIndex));
  console.log(name);
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