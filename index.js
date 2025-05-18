require("dotenv/config.js");
const http = require("http");
const { app } = require("./src/app.js");
const setupSocket = require("./src/utils/socket.js"); // or correct path

const PORT = process.env.PORT || 3000;

const server = http.createServer(app);

// 🔥 Attach socket.io
setupSocket(server);

server.listen(PORT, () =>
    console.log(`App is running on port http://127.0.0.1:${PORT}`)
);
