window.onload = (event) => {
    var username = prompt("Please enter your username to continue");
    var socket = new WebSocket(`ws://${location.host}/`);

    var clientsList = document.querySelector("#clients");
    var dialog = document.querySelector("#messages_container");
    var messageForm = document.querySelector("#message_form");
    var messageText = document.querySelector("#message_text");
    var messages = {};

    var updateMessageWindow = () => {
        const selectedUser = clientsList.options[clientsList.selectedIndex].value;

        if (messages.hasOwnProperty(selectedUser)) {
            var dialogText = `<p>Showing messages with ${selectedUser}</p>\n`;

            messages[selectedUser].forEach(({ from, message }) => {
                dialogText += `<p><strong>${from}: </strong>${message}</p>\n`;
            });

            dialog.innerHTML = dialogText;
        } else {
            dialog.innerHTML = `<p>No messages with user ${selectedUser} yet.</p>`;
        }
    };

    clientsList.onchange = (event) => updateMessageWindow();

    messageForm.onsubmit = (event) => {
        event.preventDefault();

        const recipient = clientsList.options[clientsList.selectedIndex].value;

        if (recipient === "") {
            alert("Please select the user you want to send your message to.");
            return false;
        } else if (recipient === username) {
			alert("You cannot send a message to yourself");
            return false;
		}

        socket.send(JSON.stringify({
            event: "message",
            data: {
                sender: username,
                recipient: clientsList.options[clientsList.selectedIndex].value,
                message:  messageText.value,
            },
        }));

        if (messages.hasOwnProperty(recipient)) {
            messages[recipient].push({
                from: username,
                to: recipient,
                message: messageText.value,
            });
        } else {
            messages[recipient] = [{
                from: username,
                to: recipient,
                message: messageText.value,
            }];
        }

        updateMessageWindow();

        return false;
    };

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
                    const { from, to, message } = data.data;

                    if (messages.hasOwnProperty(from)) {
                        messages[from].push({
                            from,
                            to,
                            message,
                        });
                    } else {
                        messages[from] = [{
                            from,
                            to,
                            message,
                        }];
                    }

                    updateMessageWindow();

                    break;
                case "client_list":
                    var clients = data.data.clients;
                    var clientsOptions = "<option value=''>Select user</option>";
                    clients.forEach(client => {
                        clientsOptions += `<option value='${client}'>${client}</option>`;
                    });
                    clientsList.innerHTML = clientsOptions;
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
