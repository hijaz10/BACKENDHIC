// menuController.js
const bcrypt = require("bcrypt");
const MenuModel = require('../models/menuModel');
const UserModel = require('../models/userModel');
const CartItem = require('../models/cartModel');
const sellers = require('../models/sellersmodel');


const Addproduct = async (req, res, next) => {
    var product = req.body.product;
    var price = req.body.price;
    var email = req.body.email;
    var password = req.body.password;
    var remaining = req.body.remaining;
    var company_name= req.body.company_name;


    try {
        const user = await sellers.findOne({ email });

        if (!user) {
            return res.status(404).json({
                message: "Seller not found, please sign up or check your email",
            });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (isPasswordValid) {
            const menuData = {
                product,
                price,
                remaining,
                company_name,
                user: user._id,
            };

            const addedMenu = await MenuModel.create(menuData);

            return res.status(200).json({
                message: "Product item added successfully\nPLEASE DO NOT SHARE YOUR PRODUCT ID AS YOU WILL BE NEEDING IT TO UPDATE YOUR PRODUCT.",
                product: addedMenu,
            });
        } else {
            return res.status(401).json({
                message: "Invalid password",
            });
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            message: "Unknown error occurred",
            err,
        });
    }
};

function updateproductbyId(req, res, next) {
        let id = req.params.id;
        var updatedMenu = req.body;
      
      
        MenuModel.findById(id)
            .then((menu) => {
                if (!menu) {
                    res.status(404).json({ message: "Menu not found" });
                } else {
                    MenuModel.updateOne({ _id: id }, updatedMenu)
                        .then(() => {
                            res.status(200).json({ message: "Menu updated successfully",NewMenu:updatedMenu });
                        })
                        .catch((err) => {
                            res.status(500).json({ message: "Failed to update menu" });
                        });
                }
            })

      };

    const listproducts = async (req, res, next) => {
        try {
            const productsList = await MenuModel.find().select("-_id -user");
            res.status(200).json({ productsList});
        } catch (err) {
            res.status(500).json({ message: "Unknown error occurred", err });
        }
    };

    const searchproduct = async (req, res, next) => {
        try {
          const { productName } = req.params;

          const foundProduct = await MenuModel.find({ product: productName }).select("-_id -user");
      
          if (foundProduct) {
            res.json({ foundProduct })
          } else {
            res.status(404).json({ message: `Product ${productName} not found` });
          }
        } catch (error) {
          console.error(error);
          res.status(500).json({ error: 'Internal Server Error' });
        }
      };
function deleteproduct(req,res,next){
        let { product, price } = req.body;
        let id = req.params.id
       const identifyseller = sellers.findById({id})
       if(!identifyseller){
        return res.status(500).json({message : "Seller not found"})
       }
       else{
        MenuModel.deleteOne({ product })
            .then((done) => {
                res.status(200).json({
                    message: `Product ${product} deleted succesfully`,
                    done,
                });
            })
            .catch((err) => {
                res.status(500).json({
                    message: "Deletion failed",
                });
            });
       }
        
    };
const addToCart = async (req, res, next) => {
        try {
          const product = req.body.product;
          const email = req.body.email;
          const quantity = req.body.quantity;
      
          const menuProduct = await MenuModel.findOne({ product }).select("-_id -user");
          if (!menuProduct) {
            return res.status(404).json({ message: 'Product not found' });
          }
            cartItem = new CartItem({
              email,
              product,
              quantity: parseInt(quantity, 10),
              price: menuProduct.price * quantity,
            });
      
          // Save or update the cart item
          await cartItem.save();
          res.status(200).json({ message: 'Item added to cart successfully', cartItem });
        } catch (error) {
          console.error(error);
          res.status(500).json({ message: 'Error adding item to cart' });
        }
      };
      
      
const getCart = async (req, res, next) => {
        try {
          const email = req.params.email; // Assuming the user's email is part of the URL parameters
      
          // Find all cart items for the specified user
          const cartItems = await CartItem.find({ email }).select("-_id -user");
      
          if (!cartItems || cartItems.length === 0) {
            return res.status(404).json({ message: 'Cart is empty ' });
          }


    // Calculate the total amount
    const totalAmount = cartItems.reduce((acc, item) => acc + item.price, 0);
      
          res.status(200).json({ cartItems,totalAmount});
        } catch (error) {
          console.error(error);
          res.status(500).json({ message: 'Error fetching cart items' });
        }
      };
      
     
          

module.exports = {
    Addproduct,
    updateproductbyId,
    listproducts,
    searchproduct,
    deleteproduct,
    addToCart,
    getCart,
};
