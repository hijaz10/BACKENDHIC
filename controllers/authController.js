// authController.js
require("dotenv").config();
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const jwt = require ("jsonwebtoken")
const UserModel = require('../models/userModel');
const sellers = require('../models/sellersmodel');
const Admins = require('../models/Adminsmodel');


function register(req, res, next) {
    let name = req.body.name;
    let email = req.body.email;
    let password = req.body.password;

    // Hash the password
    bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) {
            return res.status(500).json({
                message: 'Error hashing the password',
                err: err,
            });
        }

        UserModel.create({
            name,
            email,
            password: hashedPassword, // Save the hashed password
        })
            .then((done) => {
                res.status(200).json({
                    message: 'Registration was successful',
                });
            })
            .catch((err) => {
                let msg = err;
                if (err.code === 11000) {
                    msg = 'Email has been used by another user, please change your email address';
                }

                res.status(500).json({
                    message: 'Registration was not successful',
                    err: msg,
                });
            });
    });
}

const registerAsAdmin = async (req, res, next) => {
    try {
        let email = req.body.email;
        let password = req.body.password;
        let name = req.body.name
        let company = req.body.company

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        const AdminsData = {
            email,
            password: hashedPassword, // Save the hashed password
            name,
            company,
        };

        const addedAdmins = await Admins.create(AdminsData);
        res.status(200).json({ message: "Admin Successfully Added", addedAdmins });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error registering admin', error });
    }
};

const registerseller = async (req, res, next) => {
    try {
        let email = req.body.email;
        let password = req.body.password;
        let company = req.body.company;
        let location = req.body.location;

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        const sellersData = {
            email,
            password: hashedPassword, // Save the hashed password
            company,
            location,
        };

        const addedsellers = await sellers.create(sellersData);
        res.status(200).json({ message: "Seller Successfully Added", addedsellers });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error registering seller', error });
    }
};


const loginAsAdmin = async (req, res, next) => {
    try {
        let email = req.body.email;
        let password = req.body.password;

        const findAdmin = await Admins.findOne({ email });

        if (!findAdmin) {
            res.status(400).json({ message: "You are not an Admin" });
        } else {
            // Compare the provided password with the hashed password in the database
            const passwordMatch = await bcrypt.compare(password, findAdmin.password);

            if (passwordMatch) {
                const token = jwt.sign(
                    { id: findAdmin.id, email: findAdmin.email },
                    process.env.JWT_SECRET,
                    { expiresIn: "1h" }
                  );
                res.status(200).json({
                    message: "Welcome Back Here Is Your Token: ",token,
                });
            } else {
                res.status(400).json({ message: "Incorrect password" });
            }
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Cant login as Admin " });
    }
};



/*
  const token = jwt.sign(
          { id: foundUser.id, email: foundUser.email },
          process.env.JWT_SECRET,
          { expiresIn: "1h" }
        );
        
*/



const bcrypt = require('bcrypt');

async function login(req, res, next) {
    try {
        let email = req.body.email;
        let password = req.body.password;

        // Find the user by email
        const user = await UserModel.findOne({ email });

        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        // Compare the provided password with the hashed password from the database
        const match = await bcrypt.compare(password, user.password);

        if (match) {
            // If the passwords match, clear the password field before sending the user object
            user.password = "";
            return res.status(200).json(user);
        } else {
            // If passwords don't match, return a 401 Unauthorized response
            return res.status(401).json({
                message: "Incorrect password",
            });
        }
    } catch (err) {
        // Handle any unexpected errors
        console.error("Error during login:", err);
        return res.status(500).json({
            message: "Unknown error occurred",
        });
    }
}

function changePassword(req, res, next) {
    var email = req.body.email;
    let newPassword = req.body.password;
    
    UserModel.updateOne({ email }, { password: newPassword })
        .then((done) => {
            if (done.nModified === 0) {
                res.status(200).json({
                    message: "Update was successful, but no modification was made. Please enter a different password.",
                });
            } else {
                res.status(200).json({
                    message: "Password change was successful",
                });
            }
        })
        .catch((err) => {
            res.status(500).json({
                message: "Unknown error occurred",
                err,
            });
        });
}
async function forgotPassword(req, res, next) {
    try {
        let userEmail = req.body.email;
        let newPassword = req.body.password;

        const token = crypto.randomBytes(10).toString("hex");

        verifyemail = await UserModel.findOne({userEmail})
        if (!verifyemail) {
            return res.status(500).json({
                message: "No email found, please check your email and try again",
            });
        }

        let transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: {
                type: "OAuth2",
                user: process.env.USER,
                accessToken: process.env.PASS,
            },
        });

        const mail = {
            from: "backendtesting10",
            to: userEmail,
            subject: "Password Reset Request",
            text: `You have requested a password reset. Click on the following link to reset your password: http://localhost:2000/change-forgotpassword?token=${token}`,
        };

        // Send email
        const emailResponse = await transporter.sendMail(mail);

        // Update user password
        await UserModel.updateOne({ email: userEmail }, { password: newPassword });

        return res.status(200).json({
            message: "Password reset successfully",
            emailResponse,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Unknown error occurred",
            error: error.message,
        });
    }
}

function changeforgetpass(req, res, next) {
    app.post("/change-forgotpassword", (req, res, next) => {
        let userEmail = req.body.email;
        let newPassword = req.body.password;
        let token = req.body.token;

        TokenModel.findOne({ userEmail, token })
            .then((done) => {
                if (done && done.userEmail === userEmail && done.token === token) {
                    return UserModel.updateOne({ userEmail }, { password: newPassword });
                } else {
                    return res.status(401).json({
                        message: "Invalid token or email",
                    });
                }
            })
            .then((updateResponse) => {
                return res.status(200).json({
                    message: "Password reset successfully",
                    updateResponse,
                });
            })
            .catch((error) => {
                return res.status(500).json({
                    message: "Unknown error occurred",
                    error: error.message,
                });
            });
    });
}

function findbyid(req, res, next) {
    const id = req.params.id;

    UserModel.findById(id)
        .then((user) => {
            if (!user) {
                res.status(404).json({ message: "User not found" });
            } else {
                res.status(200).json({ user });
            }
        })
        .catch((err) => {
            res.status(500).json({ message: "Unknown error occurred", err });
        });
}

function updateuserinfo(req, res, next) {
        let email = req.body.email;
        let newData = {};

        if (req.body.hasOwnProperty("name")) {
            newData.name = req.body.name;
        }

        if (req.body.hasOwnProperty("password")) {
            newData.password = req.body.password;
        }

        UserModel.updateOne({ email }, newData)
            .then((done) => {
                let message = "Update was successful";
                if (done.hasOwnProperty("modifiedCount") && done.modifiedCount == 0) {
                    message = "Update was successful, but no modification was made. Please enter different data from the existing ones";
                }
                res.status(200).json({
                    message,
                    done,
                });
            })
            .catch((err) => {
                res.status(500).json({
                    message: "Unknown error occurred",
                });
            });
    };


function deleteuser(req,res,next){
    let { email, name, password } = req.body;

    UserModel.deleteOne({ email })
        .then((done) => {
            res.status(200).json({
                message: "Deletion was successful",
                done,
            });
        })
        .catch((err) => {
            res.status(500).json({
                message: "Deletion failed",
            });
        });
};



module.exports = {
    register,
    login,
    changePassword,
    forgotPassword,
    changeforgetpass,
    findbyid,
    updateuserinfo,
    deleteuser,
    registerAsAdmin,
    registerseller,
    loginAsAdmin,
};
