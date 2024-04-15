const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const messagesFilePath = path.join(__dirname, 'messages.json');
let messages = [];

if (fs.existsSync(messagesFilePath)) {
    console.log('File exists:', messagesFilePath);
    try {
        const data = fs.readFileSync(messagesFilePath);
        messages = JSON.parse(data);
    } catch (err) {
        console.error('Error reading file:', err);
    }
} else {
    console.log('File does not exist:', messagesFilePath);
}

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'name.html'));
});

app.get('/index.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

io.on('connection', (socket) => {
    console.log('User connected');

    socket.emit('storedMessages', messages);

    socket.on('message', (message) => {
        console.log('Message received:', message);
        messages.push(message);
        io.emit('message', message);

        try {
            fs.writeFileSync(messagesFilePath, JSON.stringify(messages));
        } catch (err) {
            console.error('Error saving messages to file:', err);
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
