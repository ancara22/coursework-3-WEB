

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
    let msg = {
        sourse: message.sourse,
        destination: message.destination,
        message: message.body
    }

    let filter = {
        method: 'POST',
        body: JSON.stringify(msg),
        headers: new Headers({
            'Accept': 'application/json, text/plain, */*',
            "Content-Type": "application/json"
        })
    }

    await fetch("/message", filter)
        .then((respons) => {
            return respons.json();
        }).then((respons) => {
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

            let name = contacts[i].querySelector(".user_data span").textContent;

            topName.textContent = name;

        });
    }
}


//Set events

getUser({ email: "denis@gmail.com", password: "qwer1234" }, (userData) => {
    renderUser(userData);
    getUserContacts(userData.user_id);
});


let sendBtn = document.getElementById("send_button");

sendBtn.addEventListener("click", () => {
    let message = getMessage();

    if (message != "")
        sendMessage(message);

});

