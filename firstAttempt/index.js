
// TODO 
// first REFRACTOR 645 lines to 564
// second REFRACTOR 564 lines to  558
// style buttons delete and search

// html elements
const container = document.getElementById('main-container');
const searchModal = document.getElementById('seach-modal');
const searchModalMain = document.getElementById('search-modal-main');
const searchModalHistory = document.getElementById('search-modal-history');
const postModal = document.getElementById('post-modal');
const filteredContainer = document.getElementById('filtered-container');
const cateogryListOutput = document.getElementById('category-list-output');
const nameInput = searchModal.querySelector('.search-name');
const categoryInput = searchModal.querySelector('.search-category');
const historyButton = searchModal.querySelector('#search-modal-history-button');

// post modal contents
const modalTitle = postModal.querySelector('.title');
const modalContent = postModal.querySelector('.content');
const modalCategories = postModal.querySelector('.categories')
const modalName = postModal.querySelector('.name');
const modalDate = postModal.querySelector('.date');

// stores user search history if history in local storage sets it to it else just a empty list
// deleting or updating this array will also update localstorage on submit search
let SEARCH_CONDITION_HISTORY = JSON.parse(localStorage.getItem('SEARCH_HISTORY')) || [];
let SEARCH_HISTORY_PK = Number(localStorage.getItem('search_history_pk')) || 0;

let SEARCH_CONDITION_TEMP = {
    id: 0,
    member: {},
    category: [],
    datetime: '',
}

/*
    global list that has all the filtered obj posts
    that matches users input   
*/
let FINAL_FILTERED_DATA = [];

let searchStartIndex = 0;
let searchEndIndex = 0;


document.addEventListener('DOMContentLoaded', async () => {

    // CREATES history for search modal
    renderHistory(SEARCH_CONDITION_HISTORY);

    const cat = await getCategories();
    const categories = cat.map(category => category.name);

    // list for storing valid user input
    let SEARCH_CATEGORY_LIST = [];

    // render 30 posts by defualt
    let startIndex = 0;
    let endIndex = 30;
    loadPosts(startIndex, endIndex);

    // event listener for infinity scroll
    window.onscroll = () => {
    
        // if filtered section is shown
        if (container.style.display === 'none') {

            if (window.scrollY + window.innerHeight >= (filteredContainer.scrollHeight - 200)) {
                if (searchStartIndex > FINAL_FILTERED_DATA.length) return;
                
                loadPosts(searchStartIndex, searchEndIndex, FINAL_FILTERED_DATA);
                searchStartIndex = searchEndIndex;
                searchEndIndex += 20;
            }
        }

        // main section
        if (window.scrollY + window.innerHeight >= (container.scrollHeight - 200)) {
            if (startIndex > 300) return;
            startIndex = endIndex;
            endIndex += 20;
            loadPosts(startIndex, endIndex);
        }
    }

    // once ctrl + shift is clicked shows modal disables scroll
    document.addEventListener('keydown', event => {
        if (event.ctrlKey && event.shiftKey) {
            searchModal.showModal();
            disableScroll();
        }
    });

     // once user clicks outside the modal closes the modal enables scroll
    postModal.addEventListener('click', event => {
        if (event.target === postModal) {
            postModal.close();
            enableScroll();
        }
    });

    // once user clicks outside the modal or cancel button it closes the modal enables scroll
    searchModal.addEventListener('click', (event) => {
        const cancelButtton = document.getElementById('search-modal-cancel')
        if (event.target === searchModal || event.target === cancelButtton) {
            event.preventDefault();
            searchModal.close();
            enableScroll();
            searchModalMain.style.display = 'block';
            searchModalHistory.style.display = 'none';
        }
    });

    // once history button is clicked it shows history and when a single history is clicked it searches the history
    historyButton.addEventListener('click', event => {
        // toggle view for modal history is hidden by default
        event.preventDefault();
        searchModalMain.style.display = 'none';
        searchModalHistory.style.display = 'block';
    });

    // category filter search 
    categoryInput.addEventListener('keydown', (event) => {
        // if key code is enter
        if (event.keyCode === 13 ) {
            // prevents modal from closing and filtering
            event.preventDefault();
    
            // stores users input and converts to lowercase
            const userCategoryInput = categoryInput.value.toLowerCase();
    
            // if user input isnt in the category list or already is in the global cateogry list returns
            if (!categories.includes(userCategoryInput)) return;
            if (SEARCH_CATEGORY_LIST.includes(userCategoryInput)) return;
            
            const categoryData = cat.filter(c => c.name === userCategoryInput)[0];
                        
            SEARCH_CATEGORY_LIST.push(userCategoryInput);
    
            // making div for output and appending
            const $categoryOutput = document.createElement('div');
            $categoryOutput.style.backgroundColor = `${categoryData.color}`;
            $categoryOutput.className = 'category-output';
            $categoryOutput.innerHTML = `#${categoryData.name} `;
    
            // span x with remove button
            const $remove = document.createElement('span');
            $remove.className = 'category-remove';
            $remove.innerHTML = '&#10539;';
            $remove.dataset.name = userCategoryInput;
            
            // once span X is clicked removes category
            $remove.addEventListener('click', () => {
                // set animation effect 
                $categoryOutput.style.animation = 'remove 0.4s';
                $categoryOutput.innerHTML = '';
                
                SEARCH_CATEGORY_LIST = SEARCH_CATEGORY_LIST.filter(elem => elem !== $remove.dataset.name);
    
                // deletes after animation triggers
                setTimeout(() => {
                    $categoryOutput.remove();
                }, 350);
            });
    
            // appends span x and category to output
            $categoryOutput.appendChild($remove);
            cateogryListOutput.appendChild($categoryOutput); 
    
            // resets the value of input to blank
            categoryInput.value = '';
            console.log(SEARCH_CATEGORY_LIST)
        }
    }); 

    // only when modal is submitted
    searchModal.addEventListener('submit', async () => {
        // toggle visiblity
        container.style.display = 'none';
        filteredContainer.style.display = 'flex';
        // removes h2 and posts in section container so previous filtered posts wont show
        removePosts();

        const date = new Date();
        console.log(SEARCH_CATEGORY_LIST)
        // filterCategoryAndName(SEARCH_CATEGORY_LIST, nameInput.value);

        // if only name is given
        if (SEARCH_CATEGORY_LIST < 1 && nameInput.value !== '') {

            filterCategoryAndName([], nameInput.value);
            const members = await getMembers();
            const member = members.filter(m => m.name === nameInput.value)[0];
            SEARCH_CONDITION_TEMP.member = member;
            SEARCH_CONDITION_TEMP.category = [];
            
            
        // if only category is given
        } else if (SEARCH_CATEGORY_LIST.length > 0 && nameInput.value === '') {

            filterCategoryAndName(SEARCH_CATEGORY_LIST, undefined);
            SEARCH_CONDITION_TEMP.member = {};

            const categories = await getCategories();

            // convert an array of strings to array of objs with category 
            const convertedCategories = categories.filter(category => SEARCH_CATEGORY_LIST.includes(category.name));
            
            SEARCH_CONDITION_TEMP.category = convertedCategories;

        // if both is given
        } else {
            try {

                filterCategoryAndName(SEARCH_CATEGORY_LIST, nameInput.value);
                const members = await getMembers();
                const member = members.filter(m => m.name === nameInput.value)[0];
                SEARCH_CONDITION_TEMP.member = member;

                const categories = await getCategories();

            // convert an array of strings to array of objs with category 
            const convertedCategories = categories.filter(category => SEARCH_CATEGORY_LIST.includes(category.name));
            
            SEARCH_CONDITION_TEMP.category = convertedCategories;
    
            } catch {
                filteredContainer.innerHTML = `<h2 id="error-h2">result not found</h2>`;
            }
        }
        
        // enables scroll when submitted
        enableScroll();
        // set id for search condition;
        SEARCH_CONDITION_TEMP.id = Number(SEARCH_HISTORY_PK);

        // time when searched
        SEARCH_CONDITION_TEMP.datetime = date.toString();

        // append search data to history
        SEARCH_CONDITION_HISTORY.push(SEARCH_CONDITION_TEMP);

        // make / update history append new search condition to history
        renderHistory([SEARCH_CONDITION_TEMP]);

        // clear temp to store next search data
        SEARCH_CONDITION_TEMP = { id: 0, member: {}, category: [], datetime: date.toString() }  

        SEARCH_HISTORY_PK++;
        // set SEARCH_HISTORY_LIST to localstorage for history usage
        localStorage.setItem("SEARCH_HISTORY", JSON.stringify(SEARCH_CONDITION_HISTORY)); 
        localStorage.setItem('search_history_pk', SEARCH_HISTORY_PK);
    });   
});

// utility functions: fetch json
const toJson = res => res.json();
const getPosts = () => fetch('../json/posts.json').then(toJson);
const getMembers = () => fetch('../json/members.json').then(toJson);
const getCategories = () => fetch('../json/categorys.json').then(toJson);

// utiliity for disabling and enabling scroll
function preventScroll(e) { e.preventDefault(); e.stopPropagation(); return false; }

function disableScroll() { document.body.addEventListener('wheel', preventScroll, { passive: false }); }

function enableScroll() { document.body.removeEventListener('wheel', preventScroll, { passive: false }); }

// removes all posts in filtered container 
function removePosts() {
    const section = document.getElementById('filtered-container');
    const h2 = document.getElementById('error-h2');

    // check if h2 exists then delete if it does 
    if (h2) h2.remove();

    // removes all filtered indi-post
    section.querySelectorAll('.indi-post').forEach(post => {post.remove()});
}

// rEMOVES ALL CATEGORY SPANS AND PARENTS 
function removeSearchHistoryRows() { document.querySelectorAll('.indi-history').forEach(e => e.remove()); }

// function that filters by name: string
async function filterName(name) {

    // function for fetching data again and filtering it;
    // fetching data
    const posts = await getPosts();
    const members = await getMembers();

    // getting the first user with the name
    const member = members.filter(m => m.name === name)[0];

    // if member is not valid
    if (member == null) {
        return `Results for "${name}" not Found`;
    }

    // test sets member that was use to filter data
    SEARCH_CONDITION_TEMP.member = member;
    
    return posts.filter(post => post.memberIndex === member.index);

}

// function that filters by categoires : list: string
async function filterCategory(categoriesList) {

    // fetching data
    const posts = await getPosts();
    const categories = await getCategories();

    // convert an array of strings to array of objs with category 
    const convertedCategories = categories.filter(category => categoriesList.includes(category.name));

    let checker = (arr, target) => target.every(v => arr.includes(v.index));

    SEARCH_CONDITION_TEMP.category = convertedCategories;
    
    return posts.filter(post => checker(post.categorys, convertedCategories));
}

// main function loads posts from index start to end
async function loadPosts(start = 0, end = 0, postsList = null) {

    // fetching data and storing in a variable
    const posts = await getPosts();
    const members = await getMembers();
    const categories = await getCategories();

    // sorts its by latest first
    posts.sort((post1, post2) => new Date(post2.date) - new Date(post1.date)); 

    // if postList was not given
    if (postsList === null) {
   
        // make a div for every post
        posts.slice(start, end).map((post) => {

            // make a single post and append
            const indiPost = makeIndiPost(post, members, categories);

            // appending individual post to the container
            container.appendChild(indiPost);
        });
    // IF postList was given 
    } else {
        // sorts posts to latest
        postsList.sort((post1, post2) => new Date(post2.date) - new Date(post1.date)); 

        postsList.slice(start, end).map((post) => {

            // make a single post and append
            const indiPost = makeIndiPost(post, members, categories);

            // appending individual post to the container
            filteredContainer.appendChild(indiPost);
        });        
    }
} 

// makes a individual post 
function makeIndiPost(post, members, categories) {
    const indiPost = document.createElement('div');

    // getting the memeber with the same post.memberIndex
    const memberName = members.filter(member => member.index === post.memberIndex)[0].name;

    indiPost.classList.add('indi-post');
    indiPost.innerHTML = `<div class="img">${post.index}</div>
                        <div class="title">${post.title}</div>
                        <div class="content">${post.contents}</div>
                        <div class="details"><div>by <strong style="color: #313131">${memberName}</strong></div> <div>${post.date}</div></div>`;

    // eventlistener activates when a indi-post is clicked and shows the popup
    indiPost.addEventListener('click', () => {

        const postCategories = categories.filter((category) => post.categorys.includes(category.index));
        let categoriesString = '';

        // gettng categories 
        postCategories.forEach(category => {
            categoriesString += `<div style="background-color: ${category.color}">${category.name}</div>`
        });

        // sets appropirate data for the popup elements
        modalTitle.innerHTML = post.title;
        modalContent.innerHTML = post.contents;
        modalCategories.innerHTML = categoriesString;
        modalName.innerHTML = `by ${memberName}`;
        modalDate.innerHTML = post.date;

        // show modal and prevent scroll
        postModal.showModal();
        disableScroll();
    });
    // appending individual post to the container
    return indiPost;
}

/*
takes a list of history and renders a table
can search and delete a instance of a history
*/
function renderHistory(historyList) {

    const tbody = document.querySelector('#history-data');
    
    historyList.forEach(search => {
        
        // list of strings
        let categoryList = [];
        // string name

        let categorySpan = '';
        search.category.map(category => {
            categorySpan += `<div class="category-span" style="background-color: ${category.color}">#${category.name}</div>`;
            categoryList.push(category.name);
        });

        const deleteButton = document.createElement('button');
        const searchButton = document.createElement('button');

        // functionality to delete button
        deleteButton.className = "delete-history hidden-button";
        deleteButton.innerHTML = 'Remove &#10539;';
        
        // when delete button is clicked REMOVEs history from localhistory
        deleteButton.addEventListener('click', () => {

            SEARCH_CONDITION_HISTORY = SEARCH_CONDITION_HISTORY.filter(condition => condition.id !== Number(tr.dataset.id));

            localStorage.setItem("SEARCH_HISTORY", JSON.stringify(SEARCH_CONDITION_HISTORY)); 

            // REmove all history and render history again
            removeSearchHistoryRows();
            renderHistory(SEARCH_CONDITION_HISTORY);

        });

        searchButton.className = "search-history hidden-button";
        searchButton.innerHTML = 'Search';

        // when search button is clicked searches 
        searchButton.addEventListener('click', () => {

            searchModal.close();
            enableScroll();
            container.style.display = "none";
            filteredContainer.style.display = 'flex';
            removePosts();
            console.log(search.member.name);
            filterCategoryAndName(categoryList, search.member.name);
        
        });

        // table row
        const tr = document.createElement('tr');
        tr.className = "indi-history";
        tr.dataset.id = search.id;
        tr.style.border = '1px solid black';
        tr.innerHTML = `<td>${search.datetime.split(' GMT')[0]}</td>
                        <td>${search.member.name || '없음'}</td>
                        <td class="category-span-container">${categorySpan || `없음`}</td>`;
                    
    
        // append button
        tr.appendChild(searchButton);
        tr.appendChild(deleteButton);

        tbody.appendChild(tr);
    });
}

// TODO DOESNT RENDER ALL THE POSTS ONLY RENDER PARTIAL 
// function that filteres when history search is clicked
async function filterCategoryAndName(list, name) {

    // removes h2 and posts in section container so previous filtered posts wont show 
    removePosts();
    console.log('start filter')
    if (name === undefined && list.length > 0) {
        console.log('no name and list exists', name, list);
        // sets to lowercase and filter
        const filteredPostCategory = await filterCategory(list);

        if (typeof (filteredPostCategory) == 'string') {
            filteredContainer.innerHTML = `<h2 id="error-h2">${filteredPostCategory}</h2>`;
        } else {
            FINAL_FILTERED_DATA = filteredPostCategory;

            SEARCH_CONDITION_TEMP.member = {};
            
             loadPosts(0, 30, FINAL_FILTERED_DATA);
             searchStartIndex = 30;
             searchEndIndex = 50;
                
        }

    } else if (list.length < 1 && name) {
        console.log('name exists but list doesnt', list, name);
         // filter data by value of name input
            const filteredPostsName = await filterName(name);
            
            // get the member by username
            const members = await getMembers();
            const member = members.filter(m => m.name === name)[0];

            console.log(filteredPostsName)

            // if return is a string render a page with h2 that says error
            if (typeof (filteredPostsName) == 'string') {
                filteredContainer.innerHTML = `<h2 id="error-h2">${filteredPostsName}</h2>`;
            
            // load posts with filtered data
            } else {
                FINAL_FILTERED_DATA = filteredPostsName;

                SEARCH_CONDITION_TEMP.category = [];
                SEARCH_CONDITION_TEMP.member = member;

                loadPosts(0, 30, FINAL_FILTERED_DATA);
                searchStartIndex = 30;
                searchEndIndex = 50;
            }

    } else {
        try {
            console.log('name and list exists', name, list);
                const members = await getMembers();
                // get the member by username
                const member = members.filter(m => m.name === name)[0];

                console.log(member);
                // filter by all the category that was given by user
                const filteredPostCategory = await filterCategory(list);

                // filter posts that was filtered by category by name
                const finalFilteredData = filteredPostCategory.filter(post => post.memberIndex === member.index);


                FINAL_FILTERED_DATA = finalFilteredData;

                SEARCH_CONDITION_TEMP.member = member;

                console.log(FINAL_FILTERED_DATA);
                loadPosts(0, 30, FINAL_FILTERED_DATA);
                searchStartIndex = 30;
                searchEndIndex = 50;
    
            } catch {
                filteredContainer.innerHTML = `<h2 id="error-h2">result not found</h2>`;
            }
    }
}