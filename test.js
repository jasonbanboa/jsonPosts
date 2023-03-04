

// categoryInput.addEventListener('keydown', (event) => {

    //     if (event.keyCode === 13) {
    //         // prevents modal from closing and filtering
    //         event.preventDefault();
            

    //         // ONLY IF category is in categories and not already in category list
    //         // appends user input to list
    //         const userCategoryInput = categoryInput.value.toLowerCase();
            
    //         if (categories.includes(userCategoryInput) && !SEARCH_CATEGORY_LIST.includes(userCategoryInput)) {
    //             const categoryData = cat.filter(c => c.name === userCategoryInput)[0];
                
    //             SEARCH_CATEGORY_LIST.push(userCategoryInput);


    //             // making div for output and appending
    //             const $categoryOutput = document.createElement('div');
    //             $categoryOutput.style.backgroundColor = `${categoryData.color}`
    //             $categoryOutput.className = 'category-output';
    //             $categoryOutput.innerHTML = `#${categoryData.name} `;

    //             const $remove = document.createElement('span');

    //             $remove.className = 'category-remove';
    //             $remove.innerHTML = '&#10539;';
    //             $remove.dataset.name = userCategoryInput;
                
    //             // once span X is clicked removes category
    //             $remove.addEventListener('click', () => {
    //                 // set animation effect 
    //                 $categoryOutput.style.animation = 'remove 0.4s';
    //                 $categoryOutput.innerHTML = '';
                   
    //                 // console.log($remove.dataset.name);
    //                 SEARCH_CATEGORY_LIST = SEARCH_CATEGORY_LIST.filter(elem => elem !== $remove.dataset.name);
    //                 // console.log(SEARCH_CATEGORY_LIST);

    //                 // remove element
    //                 setTimeout(() => {
    //                     $categoryOutput.remove();
    //                 }, 350);
    //             })

            
    //             $categoryOutput.appendChild($remove);
    //             cateogryListOutput.appendChild($categoryOutput); 
    //         }
    //         // resets the value of input to blank
    //         categoryInput.value = '';
    //     }
    // });


 // // event listener for infinity scroll
    // window.onscroll = () => {
    //     // if window reaches the end renders more banners
    //     // if filtered section is shown
    //     if (container.style.display === 'none') {

    //         if (window.scrollY + window.innerHeight >= (filteredContainer.scrollHeight - 200)) {
    //             // ADD INFINITY SCROLL FEATURE

    //             if (searchStartIndex > FINAL_FILTERED_DATA.length) return;
                
    //             loadPosts(searchStartIndex, searchEndIndex, FINAL_FILTERED_DATA);
    //             searchStartIndex = searchEndIndex;
    //             searchEndIndex += 20;
    //         }
    //     // default main container is shown
    //     } else {

    //         if (window.scrollY + window.innerHeight >= (container.scrollHeight - 200)) {
    //             if (startIndex > 300) return;
    //             startIndex = endIndex;
    //             endIndex += 20;
    //             loadPosts(startIndex, endIndex);
    //         }
    //     }
    // }



    // main function loads posts from index start to end
// async function loadPosts(start = 0, end = 0, postsList = null) {
//     const filteredContainer = document.getElementById('filtered-container');
//     const postModal = document.getElementById('post-modal');
//     const container = document.getElementById('main-container');

//     // fetching data and storing in a variable
//     const posts = await getPosts();
//     const members = await getMembers();
//     const categories = await getCategories();

//     // sorts its by latest first
//     posts.sort((post1, post2) => new Date(post2.date) - new Date(post1.date)); 

//     // could make this into a function making indipost
//     // if postList was not given
//     if (postsList === null) {
   
//         // make a div for every post
//         posts.slice(start, end).map((post) => {

//             // Making the indi-posts
//             const indiPost = document.createElement('div');
            
//             // getting the memeber with the same post.memberIndex
//             const memberName = members.filter(member => member.index === post.memberIndex)[0].name;

//             indiPost.classList.add('indi-post');
//             indiPost.innerHTML = `<div class="img">${post.index}</div>
//                                 <div class="title">${post.title}</div>
//                                 <div class="content">${post.contents}</div>
//                                 <div class="details"><div>by <strong style="color: #313131">${memberName}</strong></div> <div>${post.date}</div></div>`;
            
//             // eventlistener activates when a indi-post is clicked and shows the popup
//             indiPost.addEventListener('click', () => {

//                 // sets appropirate data for the popup
//                 const modalTitle = postModal.querySelector('.title');
//                 const modalContent = postModal.querySelector('.content');
//                 const modalCategories = postModal.querySelector('.categories')
//                 const modalName = postModal.querySelector('.name');
//                 const modalDate = postModal.querySelector('.date');

//                 const postCategories = categories.filter((category) => post.categorys.includes(category.index) );
//                 let categoriesString = '';

//                 // gettng categories 
//                 postCategories.forEach(category => {
//                     categoriesString += `<div style="background-color: ${category.color}">#${category.name}</div>`;
//                 });

//                 // setting data for modal
//                 modalTitle.innerHTML = post.title;
//                 modalContent.innerHTML =  post.contents;
//                 modalCategories.innerHTML = categoriesString;
//                 modalName.innerHTML =  `by ${memberName}`;
//                 modalDate.innerHTML = post.date;

//                 // show modal and prevent scroll
//                 postModal.showModal();
//                 disableScroll();
                
//             });

//             // appending individual post to the container
//             container.appendChild(indiPost);
            
//         });
//     // IF postList was given 
//     } else {

//         // sorts posts to latest
//         postsList.sort((post1, post2) => new Date(post2.date) - new Date(post1.date)); 

//         postsList.slice(start, end).map((post) => {
//             // Making the indi-posts
//             const indiPost = document.createElement('div');
            
//             // getting the memeber with the same post.memberIndex
//             const memberName = members.filter(member => member.index === post.memberIndex)[0].name;

//             indiPost.classList.add('indi-post');
//             indiPost.innerHTML = `<div class="img">${post.index}</div>
//                                 <div class="title">${post.title}</div>
//                                 <div class="content">${post.contents}</div>
//                                 <div class="details"><div>by <strong style="color: #313131">${memberName}</strong></div> <div>${post.date}</div></div>`;
            
//             // eventlistener activates when a indi-post is clicked and shows the popup
//             indiPost.addEventListener('click', () => {

//                 // sets appropirate data for the popup
//                 const modalTitle = postModal.querySelector('.title');
//                 const modalContent = postModal.querySelector('.content');
//                 const modalCategories = postModal.querySelector('.categories')
//                 const modalName = postModal.querySelector('.name');
//                 const modalDate = postModal.querySelector('.date');

//                 const postCategories = categories.filter((category) => post.categorys.includes(category.index) );
//                 let categoriesString = '';

//                 // gettng categories 
//                 postCategories.forEach(category => {
//                     categoriesString += `<div style="background-color: ${category.color}">#${category.name}</div>`;
//                 });

//                 // setting data for modal
//                 modalTitle.innerHTML = post.title;
//                 modalContent.innerHTML =  post.contents;
//                 modalCategories.innerHTML = categoriesString;
//                 modalName.innerHTML =  `by ${memberName}`;
//                 modalDate.innerHTML = post.date;

//                 // show modal and prevent scroll
//                 postModal.showModal();
//                 disableScroll();
                
//             });
//             filteredContainer.appendChild(indiPost);
//         });
             
//     }

// } 


// function makeIndiPost(post) {
//     const indiPost = document.createElement('div');

//     // getting the memeber with the same post.memberIndex
//     const memberName = members.filter(member => member.index === post.memberIndex)[0].name;

//     indiPost.classList.add('indi-post');
//     indiPost.innerHTML = `<div class="img">${post.index}</div>
//                         <div class="title">${post.title}</div>
//                         <div class="content">${post.contents}</div>
//                         <div class="details"><div>by <strong style="color: #313131">${memberName}</strong></div> <div>${post.date}</div></div>`;

//     // eventlistener activates when a indi-post is clicked and shows the popup
//     indiPost.addEventListener('click', () => {

//         // sets appropirate data for the popup
//         const modalTitle = postModal.querySelector('.title');
//         const modalContent = postModal.querySelector('.content');
//         const modalCategories = postModal.querySelector('.categories')
//         const modalName = postModal.querySelector('.name');
//         const modalDate = postModal.querySelector('.date');

//         const postCategories = categories.filter((category) => post.categorys.includes(category.index));
//         let categoriesString = '';

//         // gettng categories 
//         postCategories.forEach(category => {
//             categoriesString += `<div style="background-color: ${category.color}">${category.name}</div>`
//         });

//         // setting data for modal
//         modalTitle.innerHTML = post.title;
//         modalContent.innerHTML = post.contents;
//         modalCategories.innerHTML = categoriesString;
//         modalName.innerHTML = `by ${memberName}`;
//         modalDate.innerHTML = post.date;

//         // show modal and prevent scroll
//         postModal.showModal();
//         disableScroll();
//     });
//     // appending individual post to the container
//     return indiPost;
// }




// TODO DOESNT RENDER ALL THE POSTS ONLY RENDER PARTIAL 
// function that filteres when history search is clicked
async function filterCategoryAndName(list, name) {

    removePosts();
    if (list.length === 0) {
        console.log(name);
         // filter data by value of name input
            const filteredPostsName = await filterName(name);

            console.log(filteredPostsName)

            // if return is a string render a page with h2 that says error
            if (typeof (filteredPostsName) == 'string') {
                filteredContainer.innerHTML = `<h2 id="error-h2">${filteredPostsName}</h2>`;
            
            // load posts with filtered data
            } else {
                FINAL_FILTERED_DATA = filteredPostsName;
                // removes h2 and posts in section container so previous filtered posts wont show 
                

                loadPosts(0, 30, FINAL_FILTERED_DATA);
                searchStartIndex = 30;
                searchEndIndex = 50;
            }

    } else if (name === '없음') {

        // sets to lowercase and filter
        const filteredPostCategory = await filterCategory(list);

            FINAL_FILTERED_DATA = filteredPostCategory

             loadPosts(0, 30, FINAL_FILTERED_DATA);
             searchStartIndex = 30;
             searchEndIndex = 50;
                
        

    } else {
        try {
                const members = await getMembers();
                // get the member by username
                const member = members.filter(m => m.name === name)[0];

                console.log(member);
                // filter by all the category that was given by user
                const filteredPostCategory = await filterCategory(list);

                // filter posts that was filtered by category by name
                const finalFilteredData = filteredPostCategory.filter(post => post.memberIndex === member.index)
                FINAL_FILTERED_DATA = finalFilteredData;


                console.log(FINAL_FILTERED_DATA);
                loadPosts(0, 30, FINAL_FILTERED_DATA);
                searchStartIndex = 30;
                searchEndIndex = 50;
    
            } catch {
                filteredContainer.innerHTML = `<h2 id="error-h2">result not found</h2>`;
            }
    }
}




