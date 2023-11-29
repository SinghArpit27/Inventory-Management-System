const { statusId, isDeleted } = require('../../core/constant/constantData');
const { statusCode, responseStatus, responseMessage } = require('../../core/constant/responseMessage');
const hashPassword = require('../../helper/hashPassword');
const httpResponse = require('../../helper/httpResponse');
const { createAccessToken, createRefreshToken } = require('../../middleware/jwtAuthentication');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require("uuid");
const db = require('../../models/dbConnection');
const generateInvoice = require('../../helper/generateInvoice');
const User = db.users;
const Inward = db.inwards;
const Godown = db.godowns;
const Delivery = db.deliveries;
const Invoice = db.invoice;
const Return = db.returns;



const login = async (req, res) => {
    try {

        const { email, password } = req.body;

        const userData = await User.findOne({ where: { email: email } });
        if (!userData) {
            return httpResponse(res, statusCode.BAD_REQUEST, responseStatus.FAILED, responseMessage.INCORRECT_CREDENTIALS);
        }

        const checkPassword = await bcrypt.compare(password, userData.password);
        if (!checkPassword) {
            return httpResponse(res, statusCode.BAD_REQUEST, responseStatus.FAILED, responseMessage.INCORRECT_CREDENTIALS);
        }

        // If User is Inactive
        if (userData.user_statusId === statusId.INACTIVE) {
            return httpResponse(res, statusCode.UNAUTHORIZED, responseStatus.FAILED, responseMessage.ACCOUNT_SUSPENDED);
        }

        const accessToken = await createAccessToken(userData.uuid);
        const refreshToken = await createRefreshToken(userData.uuid);

        httpResponse(res, statusCode.OK, responseStatus.SUCCESS, responseMessage.LOGIN_SUCCESS, {
            accessToken,
            refreshToken,
            user: userData
        });

    } catch (error) {
        httpResponse(res, statusCode.INTERNAL_SERVER_ERROR, responseStatus.FAILED, responseMessage.INTERNAL_SERVER_ERROR);
    }
}

const changePassword = async (req, res) => {
    try {

        const uuid = req.uuid;
        const userData = await User.findOne({ where: { uuid: uuid } });
        if (!userData) {
            return httpResponse(res, statusCode.BAD_REQUEST, responseStatus.FAILED, responseMessage.INCORRECT_CREDENTIALS);
        }

        if (userData.user_statusId === statusId.INACTIVE) {
            return httpResponse(res, statusCode.BAD_REQUEST, responseStatus.FAILED, responseMessage.ACCOUNT_SUSPENDED);
        }

        const password = req.body.password;

        // Hash the password with a hashPassword function
        const passwordSalt = parseInt(process.env.SALT_ROUNDS);
        const hashedPassword = await hashPassword(password, passwordSalt);

        const updatedData = await User.update(
            { password: hashedPassword },
            { where: { uuid: req.uuid } }
        );

        if (!updatedData) {
            return httpResponse(res, statusCode.BAD_REQUEST, responseStatus.FAILED, responseMessage.PASSWORD_CHANGED_FAILED);
        }

        httpResponse(res, statusCode.OK, responseStatus.SUCCESS, responseMessage.PASSWORD_CHANGED_SUCCESS);

    } catch (error) {
        httpResponse(res, statusCode.INTERNAL_SERVER_ERROR, responseStatus.FAILED, responseMessage.INTERNAL_SERVER_ERROR);
    }
}

const inwardProducts = async (req, res) => {
    try {

        const uuid = req.uuid;
        const userData = await User.findOne({ where: { uuid: uuid } });
        if (!userData) {
            return httpResponse(res, statusCode.BAD_REQUEST, responseStatus.FAILED, responseMessage.UNAUTHORIZED);
        }
        if (userData.user_statusId === statusId.INACTIVE) {
            return httpResponse(res, statusCode.BAD_REQUEST, responseStatus.FAILED, responseMessage.ACCOUNT_SUSPENDED);
        }

        const { nameOfSupplier, itemName, quantityInQuintals, amount } = req.body;
        const godown_uuid = req.query.guuid;


        const godownData = await Godown.findOne({ where: { uuid: godown_uuid } });
        if (!godownData) {
            return httpResponse(res, statusCode.BAD_REQUEST, responseStatus.FAILED, responseMessage.GODOWN_NOT_FOUND);
        }
        if (godownData.godown_statusId === statusId.INACTIVE) {
            return httpResponse(res, statusCode.BAD_REQUEST, responseStatus.FAILED, responseMessage.GODOWN_SUSPENDED);
        }
        if (godownData.remainingCapacityInQuintals < quantityInQuintals) {
            const responseMsg = `quantity is greater than space we have remaining space in this godown is ${godownData.remainingCapacityInQuintals}`
            return httpResponse(res, statusCode.BAD_REQUEST, responseStatus.FAILED, responseMsg);
        }

        const invoice = await generateInvoice(nameOfSupplier, godownData.location, itemName, quantityInQuintals, amount);

        const inwardData = await Inward.create({
            uuid: uuidv4(),
            nameOfSupplier: nameOfSupplier,
            godownId: godownData.id,
            itemName: itemName,
            quantityInQuintals: quantityInQuintals,
            amount: amount,
            is_deleted: isDeleted.NOT_DELETED
        });

        if (!inwardData) {
            return httpResponse(res, statusCode.BAD_REQUEST, responseStatus.FAILED, responseMessage.INWARDS_ADDEDD_FAILED);
        }

        const remainingCapacity = godownData.remainingCapacityInQuintals - quantityInQuintals;
        const usedCapacity = godownData.usedCapacityInQuintals + quantityInQuintals;
        console.log("usedCapacity", usedCapacity);

        const updatedGodown = await Godown.update({ remainingCapacityInQuintals: remainingCapacity, usedCapacityInQuintals: usedCapacity }, { where: { id: godownData.id } });
        if (!updatedGodown) {
            return httpResponse(res, statusCode.BAD_REQUEST, responseStatus.FAILED, responseMessage.INWARDS_ADDEDD_FAILED);
        }

        const invoiceData = await Invoice.create({
            uuid: uuidv4(),
            recipient: nameOfSupplier,
            quantity: quantityInQuintals,
            operationId: inwardData.id,
            itemName: itemName,
            amount: amount,
            is_deleted: isDeleted.NOT_DELETED
        });

        if (!invoiceData) {
            return httpResponse(res, statusCode.BAD_REQUEST, responseStatus.FAILED, responseMessage.INWARDS_ADDEDD_FAILED);
        }

        httpResponse(res, statusCode.CREATED, responseStatus.SUCCESS, responseMessage.INWARDS_ADDEDD_SUCCESS, {
            invoice,
            inwardData
        });


    } catch (error) {
        httpResponse(res, statusCode.INTERNAL_SERVER_ERROR, responseStatus.FAILED, responseMessage.INTERNAL_SERVER_ERROR, error.message);
    }
}

const deliveryProducts = async (req, res) => {
    try {
        const uuid = req.uuid;
        const userData = await User.findOne({ where: { uuid: uuid } });
        if (!userData) {
            return httpResponse(res, statusCode.BAD_REQUEST, responseStatus.FAILED, responseMessage.UNAUTHORIZED);
        }
        if (userData.user_statusId === statusId.INACTIVE) {
            return httpResponse(res, statusCode.BAD_REQUEST, responseStatus.FAILED, responseMessage.ACCOUNT_SUSPENDED);
        }

        const { nameOfConsumer, itemName, quantityInQuintals, amount } = req.body;
        const godown_uuid = req.query.guuid;


        const godownData = await Godown.findOne({ where: { uuid: godown_uuid } });
        if (!godownData) {
            return httpResponse(res, statusCode.BAD_REQUEST, responseStatus.FAILED, responseMessage.GODOWN_NOT_FOUND);
        }
        if (godownData.godown_statusId === statusId.INACTIVE) {
            return httpResponse(res, statusCode.BAD_REQUEST, responseStatus.FAILED, responseMessage.GODOWN_SUSPENDED);
        }
        // console.log("godownData.usedCapacityInQuintals", godownData);
        if (godownData.usedCapacityInQuintals < quantityInQuintals) {
            const responseMsg = `This godown have only ${godownData.usedCapacityInQuintals} quantity`
            return httpResponse(res, statusCode.BAD_REQUEST, responseStatus.FAILED, responseMsg);
        }

        const deliveredData = await Delivery.create({
            uuid: uuidv4(),
            nameOfConsumer: nameOfConsumer,
            godownId: godownData.id,
            itemName: itemName,
            quantityInQuintals: quantityInQuintals,
            amount: amount,
            is_deleted: isDeleted.NOT_DELETED
        });
        if (!deliveredData) {
            return httpResponse(res, statusCode.BAD_REQUEST, responseStatus.FAILED, responseMessage.DELIVERY_FAILED);
        }

        const remainingCapacity = godownData.remainingCapacityInQuintals + quantityInQuintals;
        const usedCapacity = godownData.usedCapacityInQuintals - quantityInQuintals;

        const updatedGodown = await Godown.update({ remainingCapacityInQuintals: remainingCapacity, usedCapacityInQuintals: usedCapacity }, { where: { id: godownData.id } });
        if (!updatedGodown) {
            return httpResponse(res, statusCode.BAD_REQUEST, responseStatus.FAILED, responseMessage.INWARDS_ADDEDD_FAILED);
        }

        const invoice = await generateInvoice(nameOfConsumer, godownData.location, itemName, quantityInQuintals, amount);

        const invoiceData = await Invoice.create({
            uuid: uuidv4(),
            recipient: nameOfConsumer,
            quantity: quantityInQuintals,
            operationId: deliveredData.id,
            itemName: itemName,
            amount: amount,
            is_deleted: isDeleted.NOT_DELETED
        });

        if (!invoiceData) {
            return httpResponse(res, statusCode.BAD_REQUEST, responseStatus.FAILED, responseMessage.INWARDS_ADDEDD_FAILED);
        }

        httpResponse(res, statusCode.CREATED, responseStatus.SUCCESS, responseMessage.INWARDS_ADDEDD_SUCCESS, {
            invoice: invoiceData,
            deliveredData: deliveredData
        });

    } catch (error) {
        httpResponse(res, statusCode.INTERNAL_SERVER_ERROR, responseStatus.FAILED, responseMessage.INTERNAL_SERVER_ERROR, error.message);
    }
}

const returnProducts = async (req, res) => {
    try {

        const uuid = req.uuid;
        const userData = await User.findOne({ where: { uuid: uuid } });
        if (!userData) {
            return httpResponse(res, statusCode.BAD_REQUEST, responseStatus.FAILED, responseMessage.UNAUTHORIZED);
        }
        if (userData.user_statusId === statusId.INACTIVE) {
            return httpResponse(res, statusCode.BAD_REQUEST, responseStatus.FAILED, responseMessage.ACCOUNT_SUSPENDED);
        }

        // const godown_uuid = req.query.guuid;
        const productDeliveryUUID = req.query.pd_uuid;
        const { returnByName, itemName, quantityInQuintals, returnPurpose } = req.body;

        const productDeliveryData = await Delivery.findOne({ where: { uuid: productDeliveryUUID, is_deleted: isDeleted.NOT_DELETED } });
        if (!productDeliveryData) {
            return httpResponse(res, statusCode.BAD_REQUEST, responseStatus.FAILED, responseMessage.PRODUCT_HISTORY_NOT_FOUND);
        }

        const godownData = await Godown.findOne({ where: { id: productDeliveryData.godownId } });
        if (!godownData) {
            return httpResponse(res, statusCode.BAD_REQUEST, responseStatus.FAILED, responseMessage.GODOWN_NOT_FOUND);
        }
        if (godownData.godown_statusId === statusId.INACTIVE) {
            return httpResponse(res, statusCode.BAD_REQUEST, responseStatus.FAILED, responseMessage.GODOWN_SUSPENDED);
        }

        // Check if product history matches
        if (productDeliveryData.itemName !== itemName || productDeliveryData.quantityInQuintals !== quantityInQuintals || productDeliveryData.nameOfConsumer !== returnByName) {
            return httpResponse(res, statusCode.BAD_REQUEST, responseStatus.FAILED, responseMessage.PRODUCT_HISTORY_NOT_FOUND);
        }

        const returnData = await Return.create({
            uuid: uuidv4(),
            returnByName: returnByName,
            godownId: godownData.id,
            itemName: itemName,
            quantityInQuintals: quantityInQuintals,
            amount: productDeliveryData.amount,
            returnPurpose: returnPurpose,
            is_deleted: isDeleted.NOT_DELETED
        });

        if (!returnData) {
            return httpResponse(res, statusCode.BAD_REQUEST, responseStatus.FAILED, responseMessage.PRODUCT_RETURN_FAILED);
        }

        const remainingCapacity = godownData.remainingCapacityInQuintals - quantityInQuintals;
        const usedCapacity = godownData.usedCapacityInQuintals + quantityInQuintals;

        const updatedGodown = await Godown.update({ remainingCapacityInQuintals: remainingCapacity, usedCapacityInQuintals: usedCapacity }, { where: { id: godownData.id } });
        if (!updatedGodown) {
            return httpResponse(res, statusCode.BAD_REQUEST, responseStatus.FAILED, responseMessage.INWARDS_ADDEDD_FAILED);
        }


        const invoice = await generateInvoice(returnByName, godownData.location, itemName, quantityInQuintals, productDeliveryData.amount);

        const invoiceData = await Invoice.create({
            uuid: uuidv4(),
            recipient: returnByName,
            quantity: quantityInQuintals,
            operationId: returnData.id,
            itemName: itemName,
            amount: productDeliveryData.amount,
            is_deleted: isDeleted.NOT_DELETED
        });

        if (!invoiceData) {
            return httpResponse(res, statusCode.BAD_REQUEST, responseStatus.FAILED, responseMessage.PRODUCT_RETURN_FAILED);
        }

        return httpResponse(res, statusCode.OK, responseStatus.SUCCESS, responseMessage.PRODUCT_RETURN_SUCCESS, {
            invoice: invoice,
            returnInfo: returnData
        });




    } catch (error) {
        httpResponse(res, statusCode.INTERNAL_SERVER_ERROR, responseStatus.FAILED, responseMessage.INTERNAL_SERVER_ERROR, error.message);
    }
}


module.exports = {
    login,
    changePassword,
    inwardProducts,
    deliveryProducts,
    returnProducts
}