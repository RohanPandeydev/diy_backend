const crypto = require("node:crypto");

const auth = {
    salt: "",
    hashedPassword: "",

    generatePassword: function () {
        return Math.floor(10000000 + Math.random() * 99999999)
            .toString()
            .slice(0, 6)
            .toString();
    },

    makeSalt: function () {
        return Math.round(
            new Date().valueOf() * Math.round(1 + Math.random() * 9)
        ).toString(16);
    },

    encryptPassword: function (password) {
        if (!password) return "";
        try {
            return crypto
                .createHmac("sha1", this.salt.toString())
                .update(password.toString())
                .digest("hex");
        } catch (err) {
            return "";
        }
    },

    password: function (password) {
        this.salt = this.makeSalt();
        this.hashedPassword = this.encryptPassword(password);
        return this;
    },

    authenticate: function (plainText) {
        return this.encryptPassword(plainText) === this.hashedPassword;
    },
};
module.exports = auth;
