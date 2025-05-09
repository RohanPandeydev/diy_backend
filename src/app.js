const cors = require("cors");
const morgan = require("morgan");
const express = require("express");
const compression = require("compression");

const router = require("./routes");

const app = express();

app.use(cors("*"));
app.use(morgan("dev"));
app.use(compression());
app.use(express.json({ limit: "50mb" }));
// app.use(body.urlencoded({ extended: true, limit: "25mb" }));
app.use("/public", express.static("./public"));

app.use("/api", router);

app.get("*", (req, res) => {
    res.status(200).json({
        Message: "Server is On",
    });
});


exports.app = app;
