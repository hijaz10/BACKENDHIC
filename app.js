const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const nodemailer =require("nodemailer");
const app = express();

const port = 2000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get("/", (req, res, next) => {
    res.send("Hello, Welcome");
});


const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },

});

const menuSchema = new mongoose.Schema({
    menu: {
        type: String,
        required: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
    },
});

const MenuModel = mongoose.model("menu", menuSchema);
const UserModel = mongoose.model("users", userSchema);


app.post("/register", (req, res, next) => {
    let name = req.body.name;
    let email = req.body.email;
    let password = req.body.password;


    UserModel.create({
        name,
        email,
        password,
        
    })
        .then((done) => {
            res.status(200).json({
                message: "Registration was successful",
            });
        })
        .catch((err) => {
            let msg = err;
            if (err.hasOwnProperty("code") && err.code == "11000") {
                msg = "Email has been used by another user, please change your email address";
            }

            res.status(500).json({
                message: "Registration was not successful",
                err: msg,
            });
        });
});

app.post("/login", (req, res, next) => {
    let email = req.body.email;
    let password = req.body.password;

    UserModel.findOne({ email })
        .then((done) => {
            if (done == null) {
                res.status(404).json({
                    message: "user not found",
                });
            } else {
                user = done;
                if (done.password == password) {
                    done.password = "";
                    res.status(200).json(done);
                } else {
                    res.status(401).json({
                        message: "you entered a wrong password",
                    });
                }
            }
        })
        .catch((err) => {
            res.status(500).json({
                message: "unknown error occurred",
            });
        });
});


//ADD MENU//
app.post("/login/menu", (req, res, next) => {
    var menu = req.body.menu;
    var email = req.body.email;
    var password = req.body.password;

    UserModel.findOne({ email }) // Use findOne to check if the user exists
        .then((user) => {
            if (!user) {
                res.status(401).json({
                    message: "User not found, please signup or check your email",
                });
            } else {
                if (user.password === password) {
                    MenuModel.create({
                        menu,
                        user : user._id,
                    })
                        .then((done) => {
                            res.status(200).json({
                                message: "Menu item added successfully",
                                done,
                                
                            });
                        })
                        .catch((err) => {
                            res.status(500).json({
                                message: "Failed to add menu item",
                                err: err,
                            });
                        });
                } else {
                    res.status(401).json({
                        message: "Invalid password",
                    });
                }
            }
        })
        .catch((err) => {
            res.status(500).json({
                message: "Unknown error occurred",
                err,
            });
        });
});

//UPDATE MENU BY ID
app.patch("/:id/updatemenu", (req, res, next) => {
    const id = req.params.id;
    
    var updatedMenu = req.body;

    MenuModel.findById(id)
        .then((menu) => {
            if (!menu) {
                res.status(404).json({ message: "Menu not found" });
            } else {
                MenuModel.updateOne({ _id: id }, updatedMenu)
                    .then(() => { 
                        res.status(200).json({ message: "Menu updated successfully" })
                                     
                    })
                    .catch((err) => {
                        res.status(500).json({ message: "Failed to update menu", });
                    });
            }
        })
        .catch((err) => {
            res.status(500).json({ message: "Unknown error occurred", err });
        });
});

//Find user by id//
//I will add authurization here

app.get("/:id", (req, res, next) => {
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
});


//LIST MENU BY ID//
app.post("/:id/listmenu", (req, res, next) => {
    const id = req.params.id; 

    MenuModel.findById(id)
        .then((menu) => {
            if (!menu) {
                res.status(404).json({ message: "Menu not found" });
            } else {
                res.status(200).json({ menu });
            }
        })
        .catch((err) => {
            res.status(500).json({ message: "Unknown error occurred", err });
        });
});



// CHANGE PASSWORD//
app.patch("/change-password", (req, res, next) => {
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
                    message: "Password changed was successful",
                });
            }
        })
        .catch((err) => {
            res.status(500).json({
                message: "Unknown error occurred",
                err,
            });
        });
});

// UPDATE USER INFORMATIONS //
app.patch("/update", (req, res, next) => {
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
            let message = "update was successful";
            if (done.hasOwnProperty("modifiedCount") && done.modifiedCount == 0) {
                message = "update was successful, but no modification was made. please enter a different data from the existing ones";
            }
            res.status(200).json({
                message,
                done,
            });
        })
        .catch((err) => {
            res.status(500).json({
                message: "unknown error occurred",
            });
        });
});

//FORGET PASSWORD //

function Token(length) {
    const characters = "0123456789"; 
    const tokenArray = [];
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        tokenArray.push(characters[randomIndex]);
    }
    return tokenArray; 
}

app.post("/forgot-password", (req, res, next) => {
    let userEmail = req.body.email; 
    let newPassword = req.body.password;
    let resetToken = Token(4);


    if (!userEmail) {
        res.status(500).json({ message: "No email found, please check your email and try again" });
    } else {
        const transporter = nodemailer.createTransport({
            host: "smtp.forwardemail.net",
            port: 465,
            secure: true,
            auth: {
              // TODO: replace `user` and `pass` values from <https://forwardemail.net>
              user: "backendtesting10", 
              pass: "20232024", 
            }
          });
        
        const mail = {
            from: "backendtesting10",
            to: userEmail,
            subject: "Password Reset Request",
            text: `You have requested a password reset. Click on the following link to reset your password: http://localhost:2000/forgot-password?token=${resetToken}`,
        };

        transporter.sendMail(mail,function (error, info) {
            if (error) {
               return res.status(500).json({ message: "Error sending email", error: error });
            } else {
                return res.status(200).json({ message: "Password reset email sent", info: info.response });
            }
        });
        
    }
    UserModel.updateOne({ userEmail }, { password: newPassword })
        .then((done) => {
            res.status(200).json({
                 message: "Password reset successfully",
                 done,  });
        })
        .catch((err) => {
            res.status(500).json({
                message: "Unknown error occurred",
                err,
            });
        });
});


// DELETE USER//
app.delete("/delete", (req, res, next) => {
    let { email, name, password } = req.body;

    UserModel.deleteOne({ email })
        .then((done) => {
            res.status(200).json({
                message: "deletion was successful",
                done,
            });
        })
        .catch((err) => {
            res.status(500).json({
                message: "deletion failed",
            });
        });
});

mongoose
    .connect("mongodb://127.0.0.1:27017/hic")
    .then((done) => {
        console.log("DB connection was successful");
        app.listen(port, () => {
            console.log("server is ready on port", port);
        });
    })
    .catch((err) => {
        console.log(`an error occurred, hence the server was unable to start. ${err}`);
    })