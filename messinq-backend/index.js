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

                for (var client in clients) {
                    try {
                        sendClientList(clients[client]);
                    } catch (ex) {
                        console.warn(`Exception while sending updated client list to '${client}', removing him from the client list.`);
                        delete clients[client];
                    }
                }

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
    websocket.on("close", () => {
        for (var client in clients) {
            if (clients[client] === websocket) {
                delete clients[client];

                console.info(`Removed client '${client}'`);
                return;
            }
        }
    });
})

app.listen(3001, () => {
    console.log("Ready to go, we're listening to ya on port 3001!");
});
