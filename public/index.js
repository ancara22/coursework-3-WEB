//alert("User list:\n email: denis@gmail.com   password: qwer1234 \n email: garry@gmail.com  password: qwer1234\n email: bad@gmail.com  password: qwer1234\n email: ella@gmail.com  password: qwer1234\n email: jack@gmail.com  password: qwer1234");


function getFetchSettings(body) {
    let filter = {
        method: 'POST',
        body: JSON.stringify(body),
        headers: new Headers({
            'Accept': 'application/json, text/plain, */*',
            "Content-Type": "application/json"
        })
    }

    return filter;
}

async function sendFetch(to, filter, callback) {
    await fetch(to, filter)
        .then((respons) => {
            return respons.json();
        }).then((respons) => {
            callback(respons);
        })
}

async function getUserContacts(user_id) {
    let filter = getFetchSettings({ user_id: user_id });

    sendFetch("/user/contact", filter, (respons) => {
        let idsArray = [];

        respons.forEach(contact => {
            if (contact.user_id == user_id) {
                idsArray.push(contact.friend_id);
            } else if (contact.friend_id == user_id) {
                idsArray.push(contact.user_id);
            }
        });
        renderContacts(idsArray);
    });
}

async function getUser(user, callback) {
    let userData = {
        email: user.user_email,
        password: user.user_password
    }

    let filter = getFetchSettings(userData);

    sendFetch("/user", filter, (respons) => {
        callback(respons[0]);
    });
}

async function getUserByID(user_id, callback) {
    let filter = getFetchSettings({ user_id: user_id });

    sendFetch("/user/id", filter, (respons) => {
        callback(respons[0]);
    });
}

async function getMessages(user_id, contact_id) {
    let filter = getFetchSettings({ user_id: user_id, contact_id: contact_id });

    sendFetch("/contact/messages", filter, (respons) => {
        let messages = [];

        respons.forEach(msg => {
            if ((msg.sender_id == user_id && msg.receiver_id == contact_id) || (msg.sender_id == contact_id && msg.receiver_id == user_id)) {
                messages.push(msg);
            }
        });
        renderMessages(messages);
    });
}

async function sendMessage(message) {
    let filter = getFetchSettings(message);

    sendFetch("/message", filter, (respons) => {
        getMessages(getUserCookie().user_id, Number(getContactID()));
    });
}

async function login(email, pass, callback) {
    let filter = getFetchSettings({ login_email: email, user_pass: pass });

    sendFetch("/user/login", filter, (respons) => {
        callback(respons);
    });
}

async function findContactAndCreate(email, callback) {
    let filter = getFetchSettings({ contact_email: email });

    sendFetch("/user/exist", filter, (respons) => {
        createContact(respons[0], callback);
    });
}

async function createContact(respons, callback) {
    let filter = getFetchSettings({ friend_id: respons.user_id, user_id: getUserCookie().user_id });

    sendFetch("/user/contact/create", filter, (r) => {
        callback();
    });
}

async function createAccount(data) {
    let filter = getFetchSettings(data);

    sendFetch("/user/new", filter, (r) => {
        changeToLoginForm();
    });

}

//Renders
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

    let list = contactsList.filter((value, index, array) => array.indexOf(value) === index);

    list.forEach(contact_id => {
        getUserByID(contact_id, (userData) => {

            let contactBody = `<div class="user" data-id=${userData.user_id}>
                    <div class="user_img">
                        <img src=${userData.user_img} alt="" onerror='this.src="https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";'>
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

function bindLoginEvent() {
    let login_btn = document.getElementById("login_btn")

    login_btn.addEventListener("click", (e) => {

        let login_email = document.getElementById("login_email"),
            login_pass = document.getElementById("login_pass");

        let email = login_email.value,
            pass = login_pass.value;

        if (email != "" && pass != "") {
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

    bindRegistrationEvent();

}

function changeToRegistrationForm() {
    let box = document.getElementById("login_box");

    box.innerHTML = ` 
        <span>Registration</span>
        <input id="reg_first_name" type="text" placeholder="firstname">
        <input id="reg_last_name" type="text" placeholder="lastname">
        <input id="reg_email" type="text" placeholder="email">
        <input id="reg_pass" type="password" placeholder="password">
        <input id="reg_img" type="text" placeholder="image url">
        <button id="reg_btn">Registration</button>
        <button id="log_btn">login</button>`;

    let log_btn = document.getElementById("log_btn");

    log_btn.addEventListener("click", (e) => {
        changeToLoginForm();
    })
}

function changeToLoginForm() {
    let box = document.getElementById("login_box");

    box.innerHTML = `
        <span>Login</span>
        <input id="login_email" type="text" placeholder="email">
        <input id="login_pass" type="password" placeholder="password">
        <button id="login_btn">Login</button>
        <button id="registration_btn">Registration</button>`;

    bindLoginEvent();

}

function bindRegistrationEvent() {
    let registration_btn = document.getElementById("registration_btn");

    registration_btn.addEventListener("click", (e) => {
        changeToRegistrationForm();
        bindCreateAccountevent();
    })
}

function bindLogoutEvent() {
    let logout_btn = document.getElementById("logout_btn");

    logout_btn.addEventListener("click", (e) => {
        localStorage.isLogedIn = false;
        sessionStorage.contactID = "";
        document.cookie = "user=={};"

        showLogin();
        location.reload();

    })
}

function bindAddContactEvent() {
    let add_contact_input = document.querySelector("#add_contact input"),
        add_contact_btn = document.querySelector("#add_contact button");


    add_contact_btn.addEventListener("click", (e) => {
        let val = add_contact_input.value;
        findContactAndCreate(val, (data) => {
            getUserContacts(getUserCookie().user_id);

        });
        add_contact_input.value = "";
    })

}

function bindCreateAccountevent() {
    let reg_btn = document.getElementById("reg_btn");

    reg_btn.addEventListener("click", (e) => {
        let data = getRegistrationData();

        console.log('data', data)

        if (data != false) {
            createAccount(data);
        }
    })
}

function getRegistrationData() {
    let first_name = document.getElementById("reg_first_name").value,
        last_name = document.getElementById("reg_last_name").value,
        email = document.getElementById("reg_email").value,
        password = document.getElementById("reg_pass").value,
        img = document.getElementById("reg_img").value;

    if (first_name != "" && last_name != "" && email != "" && password != "" && img != "") {
        return {
            first_name,
            last_name,
            email,
            password,
            img
        }
    }

    return false;

}


window.onload = () => {
    if (localStorage.isLogedIn != undefined && JSON.parse(localStorage.isLogedIn) == true) {
        setChat();
        hideLogin()
    }

    bindLoginEvent();
    bindRegistrationEvent();
    bindLogoutEvent();
    bindAddContactEvent();
}
