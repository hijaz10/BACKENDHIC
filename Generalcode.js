const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const paystack = require("paystack")(
    "sk_test_3a1b83d8e002eed3bf6cd0f7711b8e431c901fe7"
  );

require("dotenv").config();

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

const tokenSchema = new mongoose.Schema({
    token: {
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
const TokenModel = mongoose.model("Token", tokenSchema);

// Hash the user's password before saving to the database
userSchema.pre("save", async function (next) {
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

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
            if (err.code === 11000) {
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
        .then(async (user) => {
            if (!user) {
                res.status(404).json({
                    message: "user not found",
                });
            } else {
                const match = await bcrypt.compare(password, user.password);
                if (match) {
                    user.password = "";
                    res.status(200).json(user);
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

// ADD MENU //
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
                        user: user._id,
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

// UPDATE MENU BY ID//
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
                        res.status(200).json({ message: "Menu updated successfully" });
                    })
                    .catch((err) => {
                        res.status(500).json({ message: "Failed to update menu" });
                    });
            }
        })
        .catch((err) => {
            res.status(500).json({ message: "Unknown error occurred", err });
        });
});

// Find user by id **//
// I will add authorization here

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

// LIST MENU BY ID//
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
});

// UPDATE USER INFORMATION //
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
});

// FORGET PASSWORD //

app.post("/forgot-password", async (req, res, next) => {
    try {
      let userEmail = req.body.email;
      let newPassword = req.body.password;
  
      const token = crypto.randomBytes(10).toString("hex");
  
      if (!userEmail) {
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
          user: "muhdhijaz10@gmail.com",
          accessToken:
          "ya29.a0AfB_byDiCTRNscEAgKt4XRgLVI-seQyAUpiqtuORpMJzTKLSF0KNFuE55Q1AEg4sEpb2nj0jYLPaDYRUrzprIGtHh8Xw9K7LP44SnWq8mJ4gF1Xa-iCzt-XUBXIH4a7RQGWM8K6F85-GSR9tGGF5NrcWVrWzkKYUa5d9aCgYKAQ4SARMSFQHGX2MiWX3GpqCqorBmR1UaL-Cv4A0171" }
      });
  
  
      const mail = {
        from: "backendtesting10",
        to: userEmail,
        subject: "Password Reset Request",
        text:`You have requested a password reset. Click on the following link to reset your password: http://localhost:2000/change-forgotpassword?token=${token}`,
      };
  
      // Send email
      const emailResponse = await transporter.sendMail(mail);
  
      // Update user password
      await TokenModel.create({token});
  
      return res.status(200).json({
        message: "Password reset Email sent successfully",
        token,
        emailResponse,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        message: "Unknown error occurred",
        error: error.message,
});
}
  })
app.post("/change-forgotpassword", (req, res, next) => {
    let userEmail = req.body.email;
    let newPassword = req.body.password; 
    let token = req.body.token;

    TokenModel.findOne({userEmail,token})
    .then((done) =>  {
        if (done.userEmail == userEmail && done.token == token) {
            UserModel.updateOne({ userEmail }, {password:newPassword})
            then((done)=>{
                return res.status(200).json({
                message: "Password reset successfully",
                emailResponse,
                updateResponse
            });})
           .catch((err)=>{
            return res.status(200).json({
                message: "Password reset was not successfull"
            });
           })
        }
    })
    
    .catch((error) => {
        return res.status(500).json({
            message: "Unknown error occurred",
            error: error.message,
        });
    });
 })

//PAYMENT ROUTE//
function generatePaymentReference() {
  const randomString = crypto.randomBytes(16).toString('hex');
  return randomString;
}

app.post("/pay", async (req, res) => {
    try {
      const price = 50000;
      let amountConverted = parseFloat(price).toFixed(2); // to make it price.00
      console.log(amountConverted);
      const paymentReference = generatePaymentReference();
  
      const response = await paystack.transaction.initialize({
        email: "muhdhijaz10@gmail.com",
        amount: amountConverted,
        reference: paymentReference,
      });
  
      const { authorization_url, access_code } = response.data;
  
      console.log(response);
      res.status(200).json({
        authorization_url,
        paymentReference,
      });
    } catch (error) {
      console.error(error);
      res.status(500).send("Error initiating payment");
    }
  });
  
  // Paystack webhook route
  app.post("/webhook", async (req, res) => {
    try {
      console.log(req.body);
      // Only handle charge success events
      if (req.body.event === "charge.success") {
        res.status(200).json("Payment confirmed");
      } else {
        res.status(500).json("Error verifying payment");
      }
    } catch (error) {
      console.error(error);
      res.status(500).send("Error verifying payment");
  }
  });

// DELETE USER//
app.delete("/delete", (req, res, next) => {
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
});

mongoose
    .connect("mongodb://127.0.0.1:27017/hic")
    .then((done) => {
        console.log("DB connection was successful");
        app.listen(port, () => {
            console.log("Server is ready on port", port);
        });
    })
    .catch((err) => {
        console.log(`An error occurred, hence the server was unable to start. ${err}`);
    });
