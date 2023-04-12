import axios from 'axios';
import Noty from 'noty';
import moment from 'moment';
import Typewriter from 'typewriter-effect/dist/core';
import { gsap } from 'gsap/index.js';

document.querySelector('.logoImg').addEventListener('click', (evt) => {
    evt.preventDefault();
    location.assign('/');
});

if (document.querySelector('.section-hero')) {
    // GSAP animation for hero image
    gsap.from(".hero-img", {
        duration: 3,
        scale: 0.5,
        opacity: 0,
        delay: 0.5,
        stagger: 0.2,
        ease: "elastic",
        force3D: true
    });
    // GSAP animation for hero text box
    gsap.from(".hero-text-box", { 
        duration: 2.5,
        x: -400 
    });
}

// Smooth Scroll
const learnMore = document.querySelector('.learnMore');
const aboutUs = document.querySelector('#aboutUs');
if(learnMore){
    learnMore.addEventListener('click', (evt) => {
        evt.preventDefault();
        aboutUs.scrollIntoView({ behavior: 'smooth' });
    });
}



// Intersection observer API (for typewritter effect )
if (aboutUs) { // we are surely on home page
    const descriptionText = document.querySelector('.companyDesription');

    const interSection = function (entries, observer) {
        const entry = entries[0];

        if (entry.isIntersecting == true) {
            console.log("Intersected");

            // Typewritter animation
            var typewriter = new Typewriter(descriptionText, {
                loop: false
            });


            typewriter.typeString('Introducing <b class="companyDesriptionBrand">MealMate</b> ,').changeDelay(2)
                .pauseFor(1000)
                .typeString(' delivering, healthy, and delicious <b class="boldBig">homemade like meals</b> straight to your doorstep. ')
                .typeString('With a variety of meal options catering to different dietary needs and preferences, our menu is updated regularly for a <b class="boldBig"> new experience </b> every time. ')
                .pauseFor(1000)
                .typeString('Subscribe via our easy-to-use online ordering system, and our friendly and reliable delivery team will ensure your tiffin box <b class="boldBig">always arrives on time</b>. ')
                .pauseFor(1000)
                .typeString('Enjoy the convenience and <b class="boldBig">affordability</b> of homemade meals without the stress. Try us out today and savor the joy of delicious, healthy food delivered to you. ')
                .pauseFor(1000)
                .typeString('Enjoy your happy meal my friend with <b class="companyDesriptionBrand">MealMate</b> 😊')
                .pauseFor(1000)
                .start();

            observer.unobserve(entry.target);
        }
    };

    const sectionObserver = new IntersectionObserver(interSection, {
        root: null,
        threshold: 0.1, // 0.1 means 10% errorMargin
    });

    sectionObserver.observe(descriptionText);
}


if (document.querySelector('.menuWrapper')) {
    
    // ----------- Sorting Menu (UI) ------------
    const menuCardArray = document.querySelectorAll('.cardWrapper');
    const sortWalaLink = document.querySelectorAll('.sortLink');

    sortWalaLink.forEach((sortLink) => {
        sortLink.addEventListener('click', (evt) => {
            evt.preventDefault();

            if (sortLink.classList.contains('sortLinkActive')) { // already active wala btn pe click kiye, so reset
                sortLink.classList.remove('sortLinkActive');
                menuCardArray.forEach((card) => {
                    card.style.display = "unset";
                    card.style.height = "100%";
                });
            }
            else { // duste inactive btn pe click hua hai
                // first of all remove all existing 'active' class from all links (if any)
                sortWalaLink.forEach((sortLnkInside) => {
                    if (sortLnkInside.classList.contains('sortLinkActive')) {
                        sortLnkInside.classList.remove('sortLinkActive');
                    }
                });

                // add 'active' class to this link
                sortLink.classList.add('sortLinkActive');

                // first of all show all card (make display: unset)
                menuCardArray.forEach((card) => {
                    card.style.display = "unset";
                    card.style.height = "100%";
                });

                //make those card's display none whose 'foodType' is !== sortLink.textContent
                menuCardArray.forEach((card) => {
                    let txt = sortLink.textContent;
                    if (txt === 'Main') { txt = 'Main Course'; }
                    if (card.querySelector('.foodType').textContent !== txt) {
                        card.style.display = "none";
                        card.style.height = "100%";
                    }
                });
            }
        });
    });

}


if (document.querySelector('.orders')) {
    // ----------- Sorting Order (UI) ------------
    const tbodyArray = document.querySelectorAll('.tableBody');
    const sortWalaLink = document.querySelectorAll('.sortLink');

    sortWalaLink.forEach((sortLink) => {
        sortLink.addEventListener('click', (evt) => {
            evt.preventDefault();

            if (sortLink.classList.contains('sortLinkActive')) { // already active wala btn pe click kiye, so reset
                sortLink.classList.remove('sortLinkActive');
                tbodyArray.forEach((tbody) => {
                    tbody.style.display = "revert";
                });
            }
            else {
                // first of all remove all existing 'active' class from all links (if any)
                sortWalaLink.forEach((sortLnkInside) => {
                    if (sortLnkInside.classList.contains('sortLinkActive')) {
                        sortLnkInside.classList.remove('sortLinkActive');
                    }
                });

                // add 'active' class to this link
                sortLink.classList.add('sortLinkActive');

                // first of all show all card (make display: unset)
                tbodyArray.forEach((tbody) => {
                    tbody.style.display = "revert";
                });

                //make those card's display none whose 'foodType' is !== sortLink.textContent
                tbodyArray.forEach((tbody) => {
                    const txt = tbody.querySelector('.orderStatus').textContent;
                    if (sortLink.textContent === 'Active Orders' && (txt === 'completed' || txt === 'cancelled' || txt === 'refunded' || txt === 'reject-refund')) {
                        tbody.style.display = "none";
                    }
                    if (sortLink.textContent === 'Completed Orders' && txt !== 'completed') {
                        tbody.style.display = "none";
                    }
                    if (sortLink.textContent === 'Cancelled Orders' && !(txt === 'cancelled' || txt === 'refunded' || txt === 'reject-refund')) {
                        tbody.style.display = "none";
                    }
                });
            }

        });
    });
}



// ----------- Half-Full (UI) ------------
function amountInNumber(amountSelector, conversion) {
    let amount = amountSelector.innerText;
    amount = amount.substring(1);
    amount = parseInt(amount, 10);
    if (conversion === "Full->Half") {
        return parseInt(amount / 2, 10) + 5;
    }
    else if (conversion === "Half->Full") {
        return (amount - 5) * 2;
    }
    return amount;
}

// First things first, if user click on 'Half' / 'Full' button, it should change accordingly
const halfs = document.querySelectorAll('.half');
const fulls = document.querySelectorAll('.full');

halfs.forEach((half) => {
    half.addEventListener('click', (evt) => {
        evt.preventDefault();
        if (half.classList.contains('activeHF') === false) {
            // ise active karo, aur sideways nextSibling se active hatao
            half.classList.add('activeHF');
            half.nextElementSibling.classList.remove('activeHF');
            const amountSelector = half.closest('.text').querySelector('.price');
            amountSelector.innerText = '₹' + amountInNumber(amountSelector, 'Full->Half');
        }
    });
});
fulls.forEach((full) => {
    full.addEventListener('click', (evt) => {
        evt.preventDefault();
        if (full.classList.contains('activeHF') === false) {
            // ise active karo, aur sideways prevSibling se active hatao
            full.classList.add('activeHF');
            full.previousElementSibling.classList.remove('activeHF');
            const amountSelector = full.closest('.text').querySelector('.price');
            amountSelector.innerText = '₹' + amountInNumber(amountSelector, 'Half->Full');
        }
    });
});




// Here we will keep all our client side code
const addToCart = document.querySelectorAll('.add-to-cart');
const cartCounter = document.querySelector('#cartCounter');
const removeFromCart = document.querySelectorAll('.removeItem');
const addFromCart = document.querySelectorAll('.addItemFromCart');

const successMsg = (msg) => {
    new Noty({
        type: 'success',
        timeout: 600,
        text: msg,
        progressBar: true
        // ,layout: 'bottomLeft'
    }).show();
}
const failureMsg = (errMsg) => {
    new Noty({
        type: 'error',
        timeout: 5000,
        text: errMsg,
        progressBar: true
        // ,layout: 'bottomLeft'
    }).show();
}

const addCart = async (pizza) => {
    try {
        const res = await axios({
            method: 'POST',
            url: '/add-cart',
            // data that should be passed in API as body 
            data: pizza,
            withCredentials: true
        });

        if (res.data.status === 'Success') {
            cartCounter.innerText = res.data.totalQty;
            successMsg('Item added to cart');
        }

    } catch (err) {
        failureMsg(err.response.data.message);
    }
}

const addItemFromCart = async (pizza) => {
    try {
        const res = await axios({
            method: 'POST',
            url: '/add-item-from-cart',
            // data that should be passed in API as body 
            data: pizza,
            withCredentials: true
        });

        if (res.data.status === 'Success') {
            successMsg('Item added to cart');
        }
    } catch (err) {
        failureMsg(err.response.data.message);
    }
}

const removeCart = async (pizza) => {
    try {
        const res = await axios({
            method: 'POST',
            url: '/remove-cart',
            // data that should be passed in API as body 
            data: pizza,
            withCredentials: true
        });

        if (res.data.status === 'Success') {
            successMsg('Item removed from cart');
        }
    } catch (err) {
        failureMsg(err.response.data.message);
    }
}

addToCart.forEach((btn) => {
    btn.addEventListener('click', (evt) => {
        const pizza = JSON.parse(btn.dataset.pizza); // (string --> JSON)
        if (pizza.halfFull === true) {
            const closestHalfBtn = btn.closest('.text').querySelector('.half');
            const closestFullBtn = btn.closest('.text').querySelector('.full');
            console.log(closestHalfBtn, closestFullBtn);

            if (closestFullBtn.classList.contains('activeHF') === true) {
                pizza.hfStatus = 'Full';
                addCart(pizza);
            }
            else {
                pizza.hfStatus = 'Half';
                addCart(pizza);
            }
        }
        else {
            pizza.hfStatus = 'Full'; // by deafault
            addCart(pizza);
        }
    });
});

removeFromCart.forEach((btn) => {
    btn.addEventListener('click', (evt) => {
        const pizza = JSON.parse(btn.dataset.pizza); // (string --> JSON)
        removeCart(pizza);
        window.setTimeout(() => {
            location.assign('/cart'); // This is how we redirect to new route (here home route)
        }, 1000);
    });
});

addFromCart.forEach((btn) => {
    btn.addEventListener('click', (evt) => {
        const pizza = JSON.parse(btn.dataset.pizza); // (string --> JSON)
        addItemFromCart(pizza);
        window.setTimeout(() => {
            location.assign('/cart'); // This is how we redirect to new route (here home route)
        }, 1000);
    });
});






const registerForm = document.querySelector('.registerWalaForm');

const register = async (username, email, phone, password, confirmPassword) => {
    try {

        const res = await axios({
            method: 'POST',
            url: '/register-user',
            data: {
                username: username,
                email: email,
                phone: phone,
                password: password,
                confirmPassword: confirmPassword
            },
            withCredentials: true
        });

        if (res.data.status === 'Success') {
            successMsg('Sign up successful ... ');

            window.setTimeout(() => {
                location.assign('/login'); // redirect to login route
            }, 1000);
        }

    } catch (err) {
        failureMsg(err.response.data.message);
    }
}

if (registerForm) {
    registerForm.addEventListener('submit', (evt) => {
        evt.preventDefault();
        const username = document.querySelector('#username').value;
        const email = document.querySelector('#email').value;
        const phone = document.querySelector('#phone').value;
        const password = document.querySelector('#password').value;
        const confirmPassword = document.querySelector('#confirmPassword').value;

        if (!username || !email || !phone || !password || !confirmPassword) {
            failureMsg('All fields are mandatory');
            window.setTimeout(() => {
                location.reload();
            }, 1000);
        }
        else {
            register(username, email, phone, password, confirmPassword);
        }
    });
}





const logInForm = document.querySelector('.logInWalaForm');

const login = async (email, password) => {
    try {
        const res = await axios({
            method: 'POST',
            url: '/login-user',
            data: {
                email: email,
                password: password
            },
            withCredentials: true
        });

        if (res.data.status === 'Success') {
            successMsg('Login successful ... ');

            window.setTimeout(() => {
                location.assign('/'); // This is how we redirect to new route (here home route)
            }, 1000);
        }
    } catch (err) {
        failureMsg(err.response.data.message);
    }
}

if (logInForm) {
    logInForm.addEventListener('submit', (evt) => {
        evt.preventDefault();
        const email = document.querySelector('#email').value;
        const password = document.querySelector('#password').value;

        if (!email || !password) {
            failureMsg('All fields are mandatory');
            window.setTimeout(() => {
                location.reload();
            }, 1000);
        }
        else {
            login(email, password);
        }

    });
}




const logOutBtn = document.querySelector('.logoutBtn');

const logOut = async () => {
    try {
        const res = await axios({
            method: 'GET',
            url: '/logout-user',
            withCredentials: true
        });

        if (res.data.status === 'Success') {
            successMsg('Logout successful ... ');

            window.setTimeout(() => {
                location.assign('/'); // This is how we redirect to new route (here home route)
            }, 1000);
        }
    } catch (err) {
        failureMsg(err.response.data.message);
    }
}

if (logOutBtn) {
    logOutBtn.addEventListener('click', (evt) => {
        evt.preventDefault();
        logOut();
    });
}






const forgotPasswordForm = document.querySelector('.forgotWalaForm');

const forgotPassword = async (email) => {
    try {
        const res = await axios({
            method: 'POST',
            url: '/forgot-password-user',
            data: {
                email: email
            },
            withCredentials: true
        });

        if (res.data.status === 'Success') {
            const resetMsg = document.querySelector('.forgotPasswordMessage');
            resetMsg.classList.remove('hidden');
            successMsg('Reset link sent Successfully');
        }
    } catch (err) {
        failureMsg(err.response.data.message);
    }
}

if (forgotPasswordForm) {
    forgotPasswordForm.addEventListener('submit', (evt) => {
        evt.preventDefault();

        const email = document.querySelector('#email').value;

        if (!email) {
            failureMsg('All fields are mandatory');
            window.setTimeout(() => {
                location.reload();
            }, 1000);
        }
        else {
            forgotPassword(email);
        }
    });
}





const resetPasswordForm = document.querySelector('.resetWalaForm');

const resetPassword = async (password, confirmPassword, token) => {
    try {
        const res = await axios({
            method: 'PATCH',
            url: '/reset-password-user',
            data: {
                password: password,
                confirmPassword: confirmPassword,
                token: token
            },
            withCredentials: true
        });

        if (res.data.status === 'Success') {
            successMsg('Password Resetted Successfully');

            window.setTimeout(() => {
                location.assign('/login'); // This is how we redirect to new route (here home route)
            }, 1000);
        }
    } catch (err) {
        failureMsg(err.response.data.message);
    }
}

if (resetPasswordForm) {
    resetPasswordForm.addEventListener('submit', (evt) => {
        evt.preventDefault();

        const password = document.querySelector('#password').value;
        const confirmPassword = document.querySelector('#confirmPassword').value;
        const str = window.location.href;
        const arr = str.split('/'); const size = arr.length;
        const token = arr[size - 1];

        if (!password || !confirmPassword) {
            failureMsg('All fields are mandatory');
            window.setTimeout(() => {
                location.reload();
            }, 1000);
        }
        else {
            resetPassword(password, confirmPassword, token);
        }
    })
}





// Change Order Status (in singleOrder page)
const hiddenInput = document.querySelector('#hiddenInput'); // input whose value is storing current order object
const allStatus = document.querySelectorAll('.status_line'); // all 5 steps
let time = document.createElement('small'); // to display time beside current process
// creating this tag <small></small>

const updateOrderStatus = async (order) => {
    // RESET
    allStatus.forEach((status) => {
        status.classList.remove('step-completed');
        status.classList.remove('current');
    });

    // form [starting till order.status] is 'step-completed', nextSibling after order.status is 'current'
    let stepCompleted = true;
    allStatus.forEach((status) => {
        let dataProp = status.dataset.status;
        if (stepCompleted) {
            status.classList.add('step-completed');
        }
        if (dataProp === order.status) {
            stepCompleted = false;
            time.innerText = moment(order.updatedAt).format('hh:mm A');
            status.appendChild(time);

            if (status.nextElementSibling) {
                status.nextElementSibling.classList.add('current');
            }
            // break;
        }
    });
}

if (hiddenInput) {
    const order = JSON.parse(hiddenInput.value);  // string --> JSON
    updateOrderStatus(order);
}







const cancelOrderBtn = document.querySelector('.cancelOrderBtn');

const cancelOrder = async (order) => {
    try {
        const res = await axios({
            method: 'PATCH',
            url: '/cancel-order',
            data: {
                orderID: order._id
            },
            withCredentials: true
        });

        if (res.data.status === 'Success') {
            successMsg('Order cancelled successfully');

            window.setTimeout(() => {
                location.assign('/customer-order'); // This is how we redirect to new route (here home route)
            }, 1000);
        }
    } catch (err) {
        failureMsg(err.response.data.message);
    }
}

if (cancelOrderBtn) {
    cancelOrderBtn.addEventListener('click', (evt) => {
        evt.preventDefault();

        const order = JSON.parse(cancelOrderBtn.dataset.order);
        cancelOrder(order);
        location.assign('/customer-order');
    });
}


const userImg = document.querySelector('.userImg');
if (userImg) {
    userImg.addEventListener('click', (evt) => {
        evt.preventDefault();
        window.setTimeout(() => {
            location.assign('/update-info'); // redirect to update info page when user click on userImg
        }, 1000);
    })
}


const updateInfoForm = document.querySelector('.updateInfoWalaForm');

const updateInfo = async (updateObj) => {
    try {
        const res = await axios({
            method: 'PATCH',
            url: '/update-info-user',
            data: updateObj,
            withCredentials: true
        });

        if (res.data.status === 'Success') {
            successMsg('User data updated .. ');

            window.setTimeout(() => {
                location.assign('/me'); // redirect to login route
            }, 1000);
        }

    } catch (err) {
        failureMsg(err.response.data.message);
    }
}

if (updateInfoForm) {
    updateInfoForm.addEventListener('submit', (evt) => {
        evt.preventDefault();

        const updateForm = new FormData();
        if (document.querySelector('#username').value) { updateForm.append('username', document.querySelector('#username').value); }
        if (document.querySelector('#email').value) { updateForm.append('email', document.querySelector('#email').value); }
        if (document.querySelector('#phone').value) { updateForm.append('phone', document.querySelector('#phone').value); }
        if (document.querySelector('#photo').files) { updateForm.append('photo', document.querySelector('#photo').files[0]); } // for this reason, we need to do it in this way

        updateInfo(updateForm);
    });
}






const updatePasswordForm = document.querySelector('.updatePasswordWalaForm');

const updatePassword = async (currentPassword, newPassword, newConfirmPassword) => {
    try {
        const res = await axios({
            method: 'PATCH',
            url: '/update-password-user',
            data: {
                currentPassword: currentPassword,
                newPassword: newPassword,
                newConfirmPassword: newConfirmPassword
            },
            withCredentials: true
        });

        if (res.data.status === 'Success') {
            successMsg('User password updated .. ');

            window.setTimeout(() => {
                location.assign('/login'); // redirect to login route
            }, 1000);
        }
    } catch (err) {
        failureMsg(err.response.data.message);
    }
}

if (updatePasswordForm) {
    updatePasswordForm.addEventListener('submit', (evt) => {
        evt.preventDefault();

        const currentPassword = document.querySelector('#currentPassword').value;
        const newPassword = document.querySelector('#newPassword').value;
        const newConfirmPassword = document.querySelector('#newConfirmPassword').value;

        if (!currentPassword || !newPassword || !newConfirmPassword) {
            failureMsg("All fields are mandatory");
            window.setTimeout(() => {
                location.reload();
            }, 1000);
        }
        else {
            updatePassword(currentPassword, newPassword, newConfirmPassword);
        }
    })
}





const deactivateAcc = document.querySelector('.deactivateAcc');

const deactivateUser = async () => {
    try {
        const res = await axios({
            method: 'PATCH',
            url: '/deactivate-user',
            withCredentials: true
        });

        if (res.status === 204) {
            successMsg('User account deactivated ... ');

            window.setTimeout(() => {
                location.assign('/'); // redirect to home route
            }, 1000);
        }
    } catch (err) {
        failureMsg(err.response.data.message);
    }
}

if (deactivateAcc) {
    deactivateAcc.addEventListener('click', (evt) => {
        evt.preventDefault();

        deactivateUser();
    });
}



const addFoodForm = document.querySelector('.addFoodWalaForm');

const addFood = async (updateForm) => {
    try {
        const res = await axios({
            method: 'POST',
            url: '/admin-backend-add-food',
            data: updateForm,
            withCredentials: true
        });

        if (res.data.status === 'Success') {
            successMsg('Food item added to menu');

            window.setTimeout(() => {
                location.assign('/me'); // redirect to home route
            }, 1000);
        }
    } catch (err) {
        failureMsg(err.response.data.message);
    }
}

if (addFoodForm) {
    addFoodForm.addEventListener('submit', (evt) => {
        evt.preventDefault();

        const name = document.querySelector('#name').value;
        const foodType = document.querySelector('#foodType').value;
        const isVeg = (document.querySelector('#isVeg').checked) ? true : false;
        const halfFull = (document.querySelector('#halfFull').checked) ? true : false;
        const price = Number(document.querySelector('#price').value);
        const description = document.querySelector('#description').value;

        if (!name || !foodType || !price || !description) {
            failureMsg("Name, Food Type, Price and Description are mandatory");
            window.setTimeout(() => {
                location.reload();
            }, 1000);
        }
        else {
            const updateForm = new FormData();
            if (name) { updateForm.append('name', name); }
            if (foodType) { updateForm.append('foodType', foodType); }
            if (isVeg) { updateForm.append('isVeg', isVeg); }
            if (halfFull) { updateForm.append('halfFull', halfFull); }
            if (price) { updateForm.append('price', price); }
            if (description) { updateForm.append('description', description); }
            if (document.querySelector('#foodPhoto').files) { updateForm.append('foodPhoto', document.querySelector('#foodPhoto').files[0]); } // for this reason, we need to do it in this way

            addFood(updateForm);
        }
    });
}


/* ---------------- MAP INTEGRATION ----------------- */

// getting content from dataset property
const mapID = document.getElementById('map');
//const locations= JSON.parse(mapID.dataset.locations); // string --> Object/JSON

if (mapID) {
    const interSectionMap = function (entries, observer) {
        const entry = entries[0];

        if (entry.isIntersecting == true) {
            console.log("Intersected");

            // Actual Map Integration
            //console.log(locations);
            /*
            [
              {
                coordinates: [-80.128473, 25.781842],
                day: 1,
                description: "Lummus Park Beach",
                ....
              },
              {} ....
            ]
            */

            const locations = [
                {
                    coordinates: [88.4137187, 22.5573695],
                    description: "RA-422, Chingrighata, Sector 4",
                },
                {
                    coordinates: [88.4515353, 22.5781405],
                    description: "Newtown, Rajarhat, Sector 5",
                },
                {
                    coordinates: [88.3533401, 22.6321847],
                    description: "Belur Math, Belur, Howrah",
                }
            ];

            console.log(locations);

            var map = new maplibregl.Map({
                container: 'map', // that id in which map will be placed
                style: 'https://api.maptiler.com/maps/streets/style.json?key=k9IFWLIKRlgFFrLE2I20', // style of map
                scrollZoom: true // scroll to zoom set to false


                // OTHER OPTIONS
                // zoom: 10
                // center: [-118.113491, 34.111745],
                // interactive: false
            });

            const bounds = new maplibregl.LngLatBounds();

            locations.forEach(loc => {
                // Create marker
                const el = document.createElement('div'); // create div
                el.className = 'marker';  // apply pre defined style class named 'marker'

                // Add marker
                new maplibregl.Marker({
                    element: el,
                    anchor: 'bottom' // point will be at the bottom of pin (image in 'marker')
                })
                    .setLngLat(loc.coordinates)
                    .addTo(map);

                // Add popup
                new maplibregl.Popup({
                    offset: 30
                })
                    .setLngLat(loc.coordinates)
                    .setHTML(`<p>${loc.description}</p>`) // what will be written on each of the marker
                    .addTo(map);

                // Extend map bounds to include current location. [OR adjust map zoom to accomodate all location]
                bounds.extend(loc.coordinates);
            });

            map.fitBounds(bounds, {
                // Manual padding (not mandatory, but useful if your map is not completely visible due to styling of your webpage)
                padding: {
                    top: 100,
                    bottom: 100,
                    left: 100,
                    right: 100
                }
            });

            observer.unobserve(entry.target);
        }
    };

    const sectionObserverMap = new IntersectionObserver(interSectionMap, {
        root: null,
        threshold: 0.1, // 0.1 means 10% errorMargin
    });

    sectionObserverMap.observe(mapID);
}




/* ---------------------  SOCKET IO INTEGRATION ------------------ */


// Creating socket connection on client side
let socket = io(); // due to '<script src="/socket.io/socket.io.js"></script>' in 'layout.ejs'

// Task 1 : on changing order status on '/admin-order', it should reflect to '/customer-order/:orderID' (singleOrder) in realtime
if (hiddenInput) {
    const order = JSON.parse(hiddenInput.value);  // string --> JSON

    // as we need separate rooms for separate orders
    const roomName = `order_${order._id}`;
    socket.emit('joinRoom', roomName); // emit socket event to with event name 'joinRoom' to sever join the uniuqe room

    socket.on('statusUpdateFromSever', (data) => { // listning to event named 'statusUpdateFromSever' and update order status
        const updatedOrder = { ...order };
        updatedOrder.updatedAt = moment().format();
        updatedOrder.status = data.status

        successMsg('Order status updated successfully');
        updateOrderStatus(updatedOrder);
    });
}


// Task 2: on creating new order at route '/order-cart', it should reflect to '/admin-order' (with a autometic page reload)
const isAdminPage = document.querySelector('#orderTableBody');

if (isAdminPage) {
    // Indide this 'if' means we are either 'adminOrderPage' or 'adminRefundPage'
    socket.emit('joinRoom', 'adminRoom');  // will be listened by server

    socket.on('orderPlaceFromServer', () => { // listning to event named 'orderPlaceFromServer' and update admin-order page
        // we can't render 'adminOrder' with all orders (which '/admin-order' can), so
        location.reload();
        successMsg('New order arrived ... ');
    });

    socket.on('orderCancelFromServer', () => {
        location.reload();
        failureMsg('Order was cancelled :( ');
    });
}