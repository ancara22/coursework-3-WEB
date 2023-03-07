
const express = require("express");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());
app.use(express.static("public"));


//Database
const mysql = require("mysql");

function sendQuerry(query, callback) {
    const connection = mysql.createPool({
        connectionLimit: 1,
        host: "127.0.0.1",
        user: "root",
        password: "coursework3",
        database: "Chat",
        debug: false
    });

    connection.query(query, (err, result) => {
        if (err) {
            console.error("Error executiong querry: " + JSON.stringify(err));
        } else {
            callback(JSON.stringify(result));
        }

    })




}


let contactsArray = [
    {
        id: 2,
        img: "./img/profile-picture.jpeg",
        name: "Garry1 Heizerbeg",
        email: "garry@gmail.com"
    },
    {
        id: 3,
        img: "./img/profile-picture.jpeg",
        name: "Garry2 Heizerbeg",
        email: "garry@gmail.com"

    },
    {
        id: 4,
        img: "./img/profile-picture.jpeg",
        name: "Garry3 Heizerbeg",
        email: "garry@gmail.com"

    },
    {
        id: 5,
        img: "./img/profile-picture.jpeg",
        name: "Garry4 Heizerbeg",
        email: "garry@gmail.com"

    }

];



app.post("/message", (request, response) => {
    let data = request.body;

    console.log(JSON.stringify(data));
    response.send({ "message": "Message sent!" });
});


app.post("/user", (request, response) => {
    let user = request.body;

    let sqlRequest = `
        SELECT * FROM Users us 
        WHERE us.user_email="${user.email}" 
            AND us.user_password="${user.password}"`;

    sendQuerry(sqlRequest, (data) => {
        response.send(data);
    })
})


app.post("/user/id", (request, response) => {
    let user = request.body;

    let sqlRequest = `
        SELECT * FROM Users us 
        WHERE us.user_id="${user.user_id}"`;

    sendQuerry(sqlRequest, (data) => {
        response.send(data);
    })
})





app.post("/user/contact", (request, response) => {
    let user = request.body;

    let sqlRequest = `
        SELECT * FROM Contacts ct 
        WHERE ct.user_id="${user.user_id}" 
            OR ct.friend_id="${user.user_id}"`;

    sendQuerry(sqlRequest, (data) => {
        console.log(JSON.stringify(data));
        response.send(data);
    })


})


app.post("/contact/messages", (request, response) => {
    let data = request.body;

    console.log(JSON.stringify(data));
    response.send({ "message": "Get messages!" });
})


app.listen(8890);