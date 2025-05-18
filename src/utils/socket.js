const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

const UserPermissionController = require("../controllers/userpermission.controller");

module.exports = function setupSocket(server) {
    const io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
        },
    });

    io.use((socket, next) => {
        const authHeader = socket.handshake.auth.token || socket.handshake.headers['authorization'];


        if (!authHeader) {
            return next(new Error("Authorization header missing"));
        }

        const token = authHeader;
        if (!token) {
            return next(new Error("Token missing in header"));
        }

        try {
            const user = jwt.verify(token, process.env.JWT_SECRET_KEY);
            socket.user = user;
            next();
        } catch (err) {
            return next(new Error("Invalid token"));
        }
    });
    io.on("connection", (socket) => {
        console.log("Socket connected:", socket.user);

        // Emit confirmation to client
        socket.emit("connected", {
            message: "Socket connection established",
            user: socket.user,
        });

        // Listen for "ping" event
        socket.on("ping", () => {
            console.log("Received: ping");
            socket.emit("pong", "pong!");
        });

        // Listen for RBAC checks or events
        socket.on("rbac", async (data) => {
            console.log("RBAC event received:", socket.user, { data });

            if (socket.user.role == 1) {
                return socket.emit("rbac-response", {
                    status: true,
                    message: "Admin access granted",
                    permission: true,
                });
            }
            const permissionCheck = await UserPermissionController.checkIsUserHasPermissionSocket(socket.user, data);

            console.log(permissionCheck, "4")

            socket.emit("rbac-response", {
                status: !!permissionCheck,
                message: permissionCheck ? "Permission granted" : "Permission denied",
                permission: !!permissionCheck,
            });
        });


        // On disconnect
        socket.on("disconnect", () => {
            console.log("Socket disconnected:", socket.user?.email || socket.id);
        });
    });

};
