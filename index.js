require("dotenv/config.js");
const { app } = require("./src/app.js");

const PORT = process.env.PORT ? process.env.PORT : 3000;

app.listen(PORT, () =>
    console.log(`App is running on port http://127.0.0.1:${PORT}`)
);
