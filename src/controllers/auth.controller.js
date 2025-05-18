const expressAsyncHandler = require("express-async-handler");
const db = require("../models/index.js");
const {
    serverErrorResponse,
    successResponse,
    notFoundResponse,
} = require("../utils/response.js");

const { createToken } = require("../utils/jwt.js");
const auth = require("../utils/auth.js");
const verifyToken = require("../middleware/auth.middleware.js");



const AuthController = {};


AuthController.loginAdmin = [
    expressAsyncHandler(async (req, res) => {
        try {
            const { email, password } = req.body;

            if (!(email && password)) {
                return successResponse(res, {
                    status: false,
                    message: "Please fill out all required fields",
                });
            }

            const login = await db.login.findOne({
                attributes: ["salt", "hashedPassword"], // Include role attribute
                where: { email },
            });
            if (!login) {
                return successResponse(res, {
                    status: false,
                    message: "Sorry, this account does not exist",
                });
            }
            auth.salt = login.salt;
            auth.hashedPassword = login.hashedPassword;
            if (!auth.authenticate(password)) {
                return successResponse(res, {
                    status: false,
                    message: "Verify your account with valid credential",
                });
            }

            const [user, created] = await db.user.findOrCreate({
                where: { email: email.toLowerCase() },
                defaults: {
                    email: email.toLowerCase(),
                    ...req.body,
                },
            });

            // // Check if the role is 1 (admin)
            // if (user.role !== 1) {
            //     return successResponse(res, {
            //         status: false,
            //         message: "You are not authorized to access this resource",
            //     });
            // }

            const payload = { id: user?.id, email: user?.email, role: user?.role };
            const token = createToken(payload);




            const loginRecord = await db.login.findOne({ where: { email } });

            if (loginRecord) {
                // Add new session
                loginRecord.loginSessions = token;

                // Save
                await loginRecord.save();
            }
            return successResponse(res, {
                message: "Your account is verified successfully",
                status: true,
                token,
                user,
            });
        } catch (error) {
            console.log(error);
            return serverErrorResponse(res, error);
        }
    }),
];
AuthController.changePassword = [
    verifyToken, // Ensure the user is logged in
    expressAsyncHandler(async (req, res) => {
        try {
            const { oldPassword, newPassword, email, } = req.body;
            const { role } = req.user; // from token payload

            if ((!oldPassword || !newPassword) && role !== 1) {
                return successResponse(res, {
                    status: false,
                    message: "Both old and new passwords are required",
                });
            }

            const login = await db.login.findOne({ where: { email } });

            if (!login) {
                return successResponse(res, {
                    status: false,
                    message: "Account not found",
                });
            }


            // Set old credentials for verification
            auth.salt = login.salt;
            auth.hashedPassword = login.hashedPassword;

            if (role == 1) {

                // Generate new hashed password and salt
                const newauth = auth.password(newPassword);

                await login.update({
                    hashedPassword: newauth.hashedPassword,
                    salt: newauth.salt,
                });

                return successResponse(res, {
                    status: true,
                    message: "Password changed successfully",
                });
            }

            if (!auth.authenticate(oldPassword)) {
                return successResponse(res, {
                    status: false,
                    message: "Old password is incorrect",
                });
            }

            // Generate new hashed password and salt
            const newauth = auth.password(newPassword);

            await login.update({
                hashedPassword: newauth.hashedPassword,
                salt: newauth.salt,
            });

            return successResponse(res, {
                status: true,
                message: "Password changed successfully",
            });
        } catch (error) {
            console.log(error);
            return serverErrorResponse(res, error);
        }
    }),
];
AuthController.register = [
    expressAsyncHandler(async (req, res) => {
        try {
            const { email, password } = req.body;
            if (!(email && password)) {
                return successResponse(res, {
                    status: false,
                    message: "please fill out all required fields",
                });
            }



            const [user, created] = await db.user.findOrCreate({
                where: { email: email.toLowerCase() },
                defaults: {
                    email: email.toLowerCase(),
                    ...req.body,
                },
            });

            const newauth = auth.password(password);
            const [login] = await db.login.findOrCreate({
                where: { email },
                defaults: {
                    email,
                    hashedPassword: newauth.hashedPassword,
                    salt: newauth.salt,
                },
            });

            return successResponse(res, {
                status: created ? true : false,
                message: created
                    ? "your account created successfully"
                    : "this account is already associated",
            });
        } catch (error) {
            console.log(error);
            return serverErrorResponse(res, error);
        }
    }),
];
AuthController.staffRegister = [
    verifyToken,
    expressAsyncHandler(async (req, res) => {
        try {
            const { email, password } = req.body;
            const { id, role } = req.user;
            if (!(email && password)) {
                return successResponse(res, {
                    status: false,
                    message: "please fill out all required fields",
                });
            }


            // Check if the role is 1 (admin)
            if (role !== 1) {
                return successResponse(res, {
                    status: false,
                    message: "You are not authorized to access this resource",
                });
            }



            const [user, created] = await db.user.findOrCreate({
                where: { email: email.toLowerCase() },
                defaults: {
                    email: email.toLowerCase(),
                    ...req.body,
                    role: 0,
                    reporting_to: id,
                },
            });

            const newauth = auth.password(password);
            const [login] = await db.login.findOrCreate({
                where: { email },
                defaults: {
                    email,
                    hashedPassword: newauth.hashedPassword,
                    salt: newauth.salt,
                },
            });

            return successResponse(res, {
                status: created ? true : false,
                message: created
                    ? "your account created successfully"
                    : "this account is already associated",
            });
        } catch (error) {
            console.log(error);
            return serverErrorResponse(res, error);
        }
    }),
];
AuthController.logout = [
    verifyToken,
    expressAsyncHandler(async (req, res) => {
        try {
            const { email } = req.body
            const loginRecord = await db.login.findOne({ where: { email } });
            if (!loginRecord) {
                return successResponse(res, {
                    status: false,
                    message: "Sorry, this account does not exist",
                });
            }
            loginRecord.loginSessions = null
            const logout = await loginRecord.save()
            return successResponse(res, {
                status: logout ? true : false,
                message: logout
                    ? "your account logout successfully"
                    : "this account is already associated",
            });


        } catch (error) {
            console.log(error);
            return serverErrorResponse(res, error);

        }
    })
]

module.exports = AuthController;
