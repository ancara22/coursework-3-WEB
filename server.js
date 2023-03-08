
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


app.post("/message", (request, response) => {
    let data = request.body;


    let sqlRequest = `
        INSERT INTO Messages (sender_id, receiver_id, message_body, message_time)
        VALUE (${data.sender_id}, ${data.receiver_id}, '${data.message_body}', now())`;

    sendQuerry(sqlRequest, () => {
        response.send({ "status": true });
    })
});

app.post("/user/login", (request, response) => {
    let user = request.body;
    console.log(JSON.stringify(user));

    let sqlRequest = `
        SELECT * FROM Users us 
        WHERE us.user_email="${user.login_email}" 
            AND us.user_password="${user.user_pass}"`;

    sendQuerry(sqlRequest, (data) => {
        response.send(data);
    })

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
        response.send(data);
    })


})


app.post("/contact/messages", (request, response) => {
    let data = request.body;


    let sqlRequest = `
        SELECT * FROM Messages msg
        WHERE msg.sender_id=${data.user_id} 
        AND msg.receiver_id=${data.contact_id}
            OR msg.sender_id=${data.contact_id} 
            AND msg.receiver_id=${data.user_id} 
        ORDER BY message_time ASC`;

    sendQuerry(sqlRequest, (data) => {
        response.send(data);
    })


})


app.listen(8890);



