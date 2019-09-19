var express = require('express');
var app = express();
var expressWs = require('express-ws')(app);

var clients = {};

var sendClientList = (websocket) => {
    websocket.send(JSON.stringify({
        event: "client_list",
        data: {
            clients: Object.keys(clients),
        },
    }));
};

var onMessage = (websocket, request) => (message) => {
    try {
        var data = JSON.parse(message);

        switch (data.event) {
            case "client_register":
                clients[data.data.username] = websocket;
                websocket.send(JSON.stringify({
                    event: "client_register",
                    data: {
                        message: `Registered as ${data.data.username}`,
                    },
                }));
                break;
            case "message":
                clients[data.data.recipient].send(JSON.stringify({
                    event: "message",
                    data: {
                        from: data.data.sender,
                        to: data.data.recipient,
                        message: data.data.message,
                    },
                }));
                break;
            case "client_list":
                sendClientList(websocket);
                break;
            default:
                websocket.send(JSON.stringify({
                    event: "error",
                    data: {
                        message: `Unknown command ${data.event}`,
                    },
                }));
                break;
        }
    } catch (e) {
        console.error(e);
    }
};

app.use(express.static('public'));

// register web socket on /, will fire on new websocket connections
app.ws('/', (websocket, request) => {
    websocket.on("message", onMessage(websocket, request));
})

app.listen(3000, () => {
    console.log("Ready to go, we're listening to ya on port 3000!");
});
