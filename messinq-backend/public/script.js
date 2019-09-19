window.onload = (event) => {
    var username = prompt("Please enter your username to continue");
    var socket = new WebSocket("ws://localhost:3000/");

    var clientList = document.querySelector("#clients");

    socket.onopen = (event) => {
        socket.send(JSON.stringify({
            event: "client_register",
            data: {
                username: username,
            },
        }));
    };

    socket.onmessage = (event) => {
        // retrieve message using event.data
        try {
            var data = JSON.parse(event.data);

            switch (data.event) {
                case "client_register":
                    alert(data.data.message);
                    socket.send(JSON.stringify({
                        event: "client_list",
                    }));
                    break;
                case "message":
                    console.log(`From '${data.data.from}': ${data.data.message}`);
                    break;
                case "client_list":
                    console.log("Client list", data.data.clients);
                    break;
                default:
                    console.error(`Unknown event ${data.event}`);
                    break;
            }
        } catch (ex) {
            console.error(ex);
            alert("exception during parsing server message");
        }
    };

    socket.onclose = (event) => {

    };

};
