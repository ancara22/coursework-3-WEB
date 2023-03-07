
async function getUser(user, callback) {

    let filter = {
        method: 'POST',
        body: JSON.stringify(user),
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
            setUserSesssions(userData);

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

function swipe(arr, i, j) {
    let t = arr[i];
    arr[i] = arr[j];
    arr[j] = t;
}

function renderMessages(messages) {
    let message_box = document.getElementById("messages_box");
    let user_id = getUserID();

    message_box.innerHTML = "";

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
    });


}


function getUserID() {
    let userID = JSON.parse(sessionStorage.user).user_id;
    return userID;
}

function setUserSesssions(userData) {
    sessionStorage.user = JSON.stringify(userData);
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

function getMessage() {
    let messageeBox = document.getElementById("message");
    let message = messageeBox.value;
    messageeBox.value = "";

    return message;
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
            getMessages(getUserID(), Number(getContactID()));
            console.log(respons)
        })
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

            let userID = getUserID();
            getMessages(userID, id);

        });
    }
}

function setContactID(id) {
    sessionStorage.contactID = JSON.stringify(id);
}

function getContactID() {
    let contactID = JSON.parse(sessionStorage.contactID);

    return contactID;
}



//Set events

getUser({ email: "denis@gmail.com", password: "qwer1234" }, (userData) => {
    renderUser(userData);
    getUserContacts(userData.user_id);

});


let sendBtn = document.getElementById("send_button");

sendBtn.addEventListener("click", () => {
    let message = getMessage();

    if (message != "") {
        let msg = {
            sender_id: getUserID(),
            receiver_id: getContactID(),
            message_body: message,
        }


        sendMessage(msg);


    }




});
