const Faileddelivery = require("../models/faileddelivery");
const reportcompany = require("../models/reportcompany");


const Faileddeliverycomplains = async (req, res, next) => {
    let email = req.body.email;
    let message = req.body.message;

    const data = {
        email,
        message,
    };

    try {
        const addeddata = await Faileddelivery.create(data);
        res.status(200).json({ message: "We have received Your complain and we are reviewing it...", addeddata });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Unable to report your complaints, please try again. Thank You..." });
    }
};

const reportcompanycomplains = async (req, res, next) => {
    let email = req.body.email;
    let message = req.body.message;

    const data = {
        email,
        message,
    };

    try {
        const addeddata = await reportcompany.create(data);
        res.status(200).json({ message: "We have received Your complain and we are reviewing it...", addeddata });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Unable to report your complaints, please try again. Thank You..." });
    }
};

module.exports = {
    Faileddeliverycomplains,
    reportcompanycomplains,
};
