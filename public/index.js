alert("User list:\n email: denis@gmail.com   password: qwer1234 \n email: garry@gmail.com  password: qwer1234\n email: bad@gmail.com  password: qwer1234\n email: ella@gmail.com  password: qwer1234\n email: jack@gmail.com  password: qwer1234");


async function getUser(user, callback) {
    let userData = {
        email: user.user_email,
        password: user.user_password
    }
    let filter = {
        method: 'POST',
        body: JSON.stringify(userData),
        headers: new Headers({
            'Accept': 'application/json',
            "Content-Type": "application/json"
        })
    }

    await fetch("/user", filter)
        .then((respons) => {
            return respons.json();
        }).then((respons) => {
            let userData = respons[0];

            callback(userData);

        })
}

async function getUserByID(user_id, callback) {

    let filter = {
        method: 'POST',
        body: JSON.stringify({ user_id: user_id }),
        headers: new Headers({
            'Accept': 'application/json',
            "Content-Type": "application/json"
        })
    }

    await fetch("/user/id", filter)
        .then((respons) => {
            return respons.json();
        }).then((respons) => {
            let userData = respons[0];

            callback(userData);

        })
}

async function getUserContacts(user_id) {
    let filter = {
        method: 'POST',
        body: JSON.stringify({ user_id: user_id }),
        headers: new Headers({
            'Accept': 'application/json, text/plain, */*',
            "Content-Type": "application/json"
        })
    }

    await fetch("/user/contact", filter)
        .then((respons) => {
            return respons.json();
        }).then((respons) => {
            let idsArray = [];

            respons.forEach(contact => {
                if (contact.user_id == user_id) {
                    idsArray.push(contact.friend_id);
                } else if (contact.friend_id == user_id) {
                    idsArray.push(contact.user_id);
                }
            });
            renderContacts(idsArray);
        })
}

async function getMessages(user_id, contact_id) {
    console.log('user_id: ', user_id)
    console.log('contact_id: ', contact_id)

    let filter = {
        method: 'POST',
        body: JSON.stringify({ user_id: user_id, contact_id: contact_id }),
        headers: new Headers({
            'Accept': 'application/json, text/plain, */*',
            "Content-Type": "application/json"
        })
    }

    await fetch("/contact/messages", filter)
        .then((respons) => {
            return respons.json();
        }).then((respons) => {
            let messages = [];

            respons.forEach(msg => {
                if ((msg.sender_id == user_id && msg.receiver_id == contact_id) || (msg.sender_id == contact_id && msg.receiver_id == user_id)) {
                    messages.push(msg);
                }
            });
            renderMessages(messages);
        })
}

async function sendMessage(message) {

    let filter = {
        method: 'POST',
        body: JSON.stringify(message),
        headers: new Headers({
            'Accept': 'application/json, text/plain, */*',
            "Content-Type": "application/json"
        })
    }

    await fetch("/message", filter)
        .then((respons) => {
            return respons.json();
        }).then((respons) => {
            getMessages(getUserCookie().user_id, Number(getContactID()));
            console.log(respons)
        })
}

async function login(email, pass, callback) {
    let filter = {
        method: 'POST',
        body: JSON.stringify({ login_email: email, user_pass: pass }),
        headers: new Headers({
            'Accept': 'application/json, text/plain, */*',
            "Content-Type": "application/json"
        })
    }

    await fetch("/user/login", filter)
        .then((respons) => {
            return respons.json()
        }).then((respons) => {
            callback(respons);
        })
}

function swipe(arr, i, j) {
    let t = arr[i];
    arr[i] = arr[j];
    arr[j] = t;
}

function renderMessages(messages) {
    let message_box = document.getElementById("messages_box");
    let user_id = getUserCookie().user_id;

    message_box.innerHTML = "";

    if (messages.length == 0) {
        message_box.innerHTML = "<span id='empty_conversation'>No messages yet!</span>";
    }

    messages.forEach(msg => {
        let body = "";
        if (msg.sender_id == user_id) {
            body = `<div class="message message_right">
                                <p>${msg.message_body}</p>
                            </div>`;
        } else if (msg.receiver_id == user_id) {
            body = `<div class="message message_left">
                                <p>${msg.message_body}</p>
                            </div>`;
        }

        message_box.innerHTML += body;


        message_box.scrollTop = message_box.scrollHeight;
    });


}

function renderUser(user) {
    let user_img = document.getElementById("user_img"),
        userData_name = document.querySelector("#user_data h2"),
        userData_email = document.querySelector("#user_data p");

    try {
        user_img.src = user.user_img;
        userData_name.textContent = user.first_name + " " + user.last_name;
        userData_email.textContent = user.user_email;
    } catch (e) {
        console.log("No user");
    }


}

function renderContacts(contactsList) {
    let contactsBox = document.getElementById("contacts");

    contactsBox.innerHTML = "";

    contactsList.forEach(contact_id => {
        getUserByID(contact_id, (userData) => {

            let contactBody = `<div class="user" data-id=${userData.user_id}>
                    <div class="user_img">
                        <img src=${userData.user_img} alt="">
                    </div>
                    <div class="user_data">
                        <span>${userData.first_name} ${userData.last_name}</span>
                        <p>${userData.user_email}</p>
                    </div>
                </div>
                <div class="line"></div>`;

            contactsBox.innerHTML += contactBody;
            setButtons();
        });

    });
}

function removeBackground(contacts) {
    for (let i = 0; i < contacts.length; i++) {
        contacts[i].style.backgroundColor = "";
    }
}

function setButtons() {
    let contacts = [...document.getElementsByClassName("user")];
    let topName = document.querySelector("#top_line span");

    for (let i = 0; i < contacts.length; i++) {
        contacts[i].addEventListener("click", () => {
            removeBackground(contacts);

            contacts[i].style.backgroundColor = "rgb(83, 83, 188)";

            let id = contacts[i].dataset.id;
            setContactID(id);

            let name = contacts[i].querySelector(".user_data span").textContent;

            topName.textContent = name;

            let userID = getUserCookie().user_id;
            getMessages(userID, id);

        });
    }
}

function getMessage() {
    let messageeBox = document.getElementById("message");
    let message = messageeBox.value;
    messageeBox.value = "";

    return message;
}

function getUserCookie() {
    let cookie = {};
    document.cookie.split(';').forEach(function (el) {
        let [key, value] = el.split('==');
        cookie[key.trim()] = value;
    })
    if (cookie["user"] == "{}")
        showLogin();

    return JSON.parse(cookie["user"]);
}

function setContactID(id) {
    sessionStorage.contactID = JSON.stringify(id);
}

function getContactID() {
    let contactID = JSON.parse(sessionStorage.contactID);

    return contactID;
}

function setChat() {
    getUser(getUserCookie(), (userData) => {
        renderUser(userData);
        getUserContacts(userData.user_id);

    });

    let sendBtn = document.getElementById("send_button");

    sendBtn.addEventListener("click", () => {
        let message = getMessage();

        if (message != "") {
            let msg = {
                sender_id: getUserCookie().user_id,
                receiver_id: getContactID(),
                message_body: message,
            }
            sendMessage(msg);
        }
    });
}

function showLogin() {
    let el = document.getElementById("login_back");
    el.style.display = "block";
}

function hideLogin() {
    let el = document.getElementById("login_back");
    el.style.display = "none";
}


if (localStorage.isLogedIn != undefined && JSON.parse(localStorage.isLogedIn) == true) {
    setChat();
    hideLogin()
}



let login_btn = document.getElementById("login_btn");


login_btn.addEventListener("click", (e) => {

    let login_email = document.getElementById("login_email"),
        login_pass = document.getElementById("login_pass");

    let email = login_email.value,
        pass = login_pass.value;

    if (email != "" && pass != "") {
        console.log('email', email)
        console.log('pass', pass)
        login(email, pass, (data) => {
            if (data.length != 0) {
                localStorage.isLogedIn = true;

                document.cookie = "user==" + JSON.stringify(data[0]) + ";";
                let innerEl = document.getElementById("login_box");

                innerEl.innerHTML = "<h3 id='welcome_message'>Welcome</h3>"

                setTimeout((e) => {
                    hideLogin();
                    setChat();

                    innerEl.innerHTML = ` <span>Login</span>
                        <input id="login_email" type="text" placeholder="email">
                        <input id="login_pass" type="password" placeholder="password">
                        <button id="login_btn">Login</button>`;
                }, 2000)

            }

        });
    }
})



let logout_btn = document.getElementById("logout_btn");

logout_btn.addEventListener("click", (e) => {
    localStorage.isLogedIn = false;
    sessionStorage.contactID = "";
    document.cookie = "user=={};"

    showLogin();
    location.reload();

})


