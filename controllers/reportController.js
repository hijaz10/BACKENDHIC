const Faileddelivery = require("../models/Complainsmodel")
const reportcompany = require("../models/Complainsmodel")

const Faileddeliverycomplains = async(res,req,next) => {
    let email= req.body.email
    let message = req.body.message

    const data = {
        email,
        message,
    }
    const addeddata = await Faileddelivery.create(data)
    .then((done) => {
        if(done){
            res.status(200).json({message:"We have recieved Your complain and we are reviewing it...", addeddata})
        }
        else{
            res.status(500).json({message:"Unable to report your complains please try again,Thank You..."})
        }
    })
    .catch((err)=>{
        res.status(500).json({message:"Unknown Error Ocuured"})
    })
}

const reportcompanycomplains = async (res,req,next) => {
    let email= req.body.email
    let message = req.body.message

    const data = {
        email,
        message,
    }
    const addeddata = await reportcompany.create(data)
    .then((done) => {
        if(done){
            res.status(200).json({message:"We have recieved Your complain and we are reviewing it...", addeddata})
        }
        else{
            res.status(500).json({message:"Unable to report your complains please try again,Thank You..."})
        }
    })
    .catch((err)=>{
        res.status(500).json({message:"Unknown Error Ocuured"})
    })
}




module.exports = {
    Faileddeliverycomplains,
    reportcompanycomplains,
}