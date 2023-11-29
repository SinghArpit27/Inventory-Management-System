const { userRoleId, isDeleted, statusId, contactAdmin } = require('../../core/constant/constantData');
const { statusCode, responseStatus, responseMessage } = require('../../core/constant/responseMessage');
const httpResponse = require('../../helper/httpResponse');
const db = require('../../models/dbConnection');
const User = db.users;
const Role = db.userRole;
const Status = db.status;
const Godown = db.godowns;
const Inward = db.inwards;
const Delivery = db.deliveries;
const Invoice = db.invoice;
const Return = db.returns;


const { v4: uuidv4 } = require("uuid");
const mailControl = require('../../helper/mailController');
const hashPassword = require('../../helper/hashPassword');
const generateDefaultPassword = require('../../helper/generateDefaultPassword');
const bcrypt = require('bcrypt');
const { createAccessToken, createRefreshToken } = require('../../middleware/jwtAuthentication');
const { where } = require('sequelize');



// ==============================   ASSOCIATION  ================================


User.belongsTo(Status, {
    foreignKey: 'user_statusId'
});

User.belongsTo(Role, {
    foreignKey: "user_roleId"
});

Godown.belongsTo(Status, {
    foreignKey: 'godown_statusId'
});

Godown.belongsTo(User, {
    foreignKey: 'godown_managerId'
});

Godown.hasMany(Inward, {
    foreignKey: 'godownId'
});

Godown.hasMany(Delivery, {
    foreignKey: 'godownId'
});

Godown.hasMany(Return, {
    foreignKey: 'godownId'
});



const addStaticData = async (req, res) => {
    try {

        const { name } = req.body;

        // // Role Table Code
        // const roleData = await Role.create({
        //     uuid: uuidv4(),
        //     name: name,
        //     is_deleted: isDeleted.NOT_DELETED
        // });
        // httpResponse(res, statusCode.CREATED, responseStatus.SUCCESS, responseMessage.SUCCESS, roleData);


        // // Status Table Code
        // const statusData = await Status.create({
        //     uuid: uuidv4(),
        //     name: name,
        //     is_deleted: isDeleted.NOT_DELETED
        // });
        // httpResponse(res, statusCode.CREATED, responseStatus.SUCCESS, responseMessage.SUCCESS, statusData);

    } catch (error) {
        httpResponse(res, statusCode.INTERNAL_SERVER_ERROR, responseStatus.FAILED, responseMessage.INTERNAL_SERVER_ERROR);
    }
}

const createUser = async (req, res) => {
    try {

        const uuid = req.uuid;
        const adminData = await User.findOne({ where: { uuid: uuid, user_statusId: statusId.ACTIVE, user_roleId: userRoleId.ADMIN_ROLE } });
        if (!adminData) {
            return httpResponse(res, statusCode.BAD_REQUEST, responseStatus.FAILED, responseMessage.PERMISSION_DENIED);
        }

        const { name, email, currentLocation, } = req.body;

        // Generate Password
        const password = generateDefaultPassword(name);

        // Hash the password with a hashPassword function
        const passwordSalt = parseInt(process.env.SALT_ROUNDS);
        const hashedPassword = await hashPassword(password, passwordSalt);

        const userRole = await Role.findOne({ where: { id: userRoleId.USER_ROLE, is_deleted: isDeleted.NOT_DELETED } });
        const userStatus = await Status.findOne({ where: { id: statusId.ACTIVE, is_deleted: isDeleted.NOT_DELETED } });

        if (!userRole && !userStatus) {
            return httpResponse(res, statusCode.BAD_REQUEST, responseStatus.FAILED, responseMessage.REGISTRATION_FAILED);
        }

        const userData = await User.create({
            uuid: uuidv4(),
            name: name,
            email: email,
            password: hashedPassword,
            currentLocation: currentLocation,
            user_roleId: userRole.id,
            user_statusId: userStatus.id
        });

        if (!userData) {
            return httpResponse(res, statusCode.BAD_REQUEST, responseStatus.FAILED, responseMessage.REGISTRATION_FAILED);
        }
        // Send Email (Login Credentials)
        await mailControl.addEmployMail(name, email, password);
        httpResponse(res, statusCode.CREATED, responseStatus.SUCCESS, responseMessage.REGISTRATION_SUCCESS, userData);

    } catch (error) {
        httpResponse(res, statusCode.INTERNAL_SERVER_ERROR, responseStatus.FAILED, responseMessage.INTERNAL_SERVER_ERROR, error.message);
    }
}

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

const getUsersList = async (req, res) => {
    try {

        const uuid = req.uuid;
        const adminData = await User.findOne({ where: { uuid: uuid, user_roleId: userRoleId.ADMIN_ROLE, user_statusId: statusId.ACTIVE } });
        if (!adminData) {
            httpResponse(res, statusCode.BAD_REQUEST, responseStatus.FAILED, responseMessage.PERMISSION_DENIED);
        }

        const userList = await User.findAll({
            attributes: ["id", "uuid", "name", "email", "currentLocation"],
            where: { user_roleId: userRoleId.USER_ROLE },
            include: [
                {
                    model: Role,
                    attributes: ["name"],
                    where: { is_deleted: isDeleted.NOT_DELETED },
                }, {
                    model: Status,
                    attributes: ["name"],
                    where: { is_deleted: isDeleted.NOT_DELETED }
                }
            ]
        });

        if (!userList) {
            httpResponse(res, statusCode.BAD_REQUEST, responseStatus.FAILED, responseMessage.FAILED_TO_LOAD_USER);
        }

        const responseData = userList.map((user) => ({
            id: user.id,
            uuid: user.uuid,
            name: user.name,
            email: user.email,
            currentLocation: user.currentLocation,
            user_role: user.user_role.name,
            user_status: user.user_status.name
        }));

        httpResponse(res, statusCode.OK, responseStatus.SUCCESS, responseMessage.SUCCESS, responseData);

    } catch (error) {
        console.log(error.message);
        httpResponse(res, statusCode.INTERNAL_SERVER_ERROR, responseStatus.FAILED, responseMessage.INTERNAL_SERVER_ERROR, error.message);
    }
}

const updateUserDetails = async (req, res) => {
    try {

        const uuid = req.uuid;
        const adminData = await User.findOne({ where: { uuid: uuid, user_statusId: statusId.ACTIVE, user_roleId: userRoleId.ADMIN_ROLE } });
        if (!adminData) {
            return httpResponse(res, statusCode.BAD_REQUEST, responseStatus.FAILED, responseMessage.PERMISSION_DENIED);
        }


        const user_uuid = req.query.uuid;
        const { name, email, currentLocation, user_roleId } = req.body;

        // Update User Information
        const userUpdatedData = await User.update(
            { name: name, email: email, currentLocation: currentLocation, user_roleId: user_roleId },
            { where: { uuid: user_uuid } }
        );

        if (!userUpdatedData) {
            return httpResponse(res, statusCode.BAD_REQUEST, responseStatus.FAILED, responseMessage.FAILED_TO_UPDATE_USER);
        }

        httpResponse(res, statusCode.OK, responseStatus.SUCCESS, responseMessage.UPDATE_SUCCES);

    } catch (error) {
        httpResponse(res, statusCode.INTERNAL_SERVER_ERROR, responseStatus.FAILED, responseMessage.INTERNAL_SERVER_ERROR, error.message);
    }
}

const addGodown = async (req, res) => {
    try {

        const uuid = req.uuid;
        const adminData = await User.findOne({ where: { uuid: uuid, user_statusId: statusId.ACTIVE, user_roleId: userRoleId.ADMIN_ROLE } });
        if (!adminData) {
            return httpResponse(res, statusCode.BAD_REQUEST, responseStatus.FAILED, responseMessage.PERMISSION_DENIED);
        }

        const { location, capacityInQuintals } = req.body;

        const statusData = await Status.findOne({ where: { id: statusId.ACTIVE, is_deleted: isDeleted.NOT_DELETED } });
        if (!statusData) {
            return httpResponse(res, statusCode.BAD_REQUEST, responseStatus.FAILED, responseMessage.FAILED_TO_ADD_GODOWN);
        }

        const godownData = await Godown.create({
            uuid: uuidv4(),
            location: location,
            capacityInQuintals: capacityInQuintals,
            remainingCapacityInQuintals: capacityInQuintals,
            usedCapacityInQuintals: 0,
            godown_managerId: adminData.id,
            godown_statusId: statusData.id
        });

        if (!godownData) {
            return httpResponse(res, statusCode.BAD_REQUEST, responseStatus.FAILED, responseMessage.FAILED_TO_ADD_GODOWN);
        }

        httpResponse(res, statusCode.CREATED, responseStatus.SUCCESS, responseMessage.GODOWN_ADDEDD_SUCCESS, godownData);

    } catch (error) {
        httpResponse(res, statusCode.INTERNAL_SERVER_ERROR, responseStatus.FAILED, responseMessage.INTERNAL_SERVER_ERROR, error.message);
    }
}

const addGodownManager = async (req, res) => {
    try {

        const uuid = req.uuid;
        const adminData = await User.findOne({ where: { uuid: uuid, user_statusId: statusId.ACTIVE, user_roleId: userRoleId.ADMIN_ROLE } });
        if (!adminData) {
            return httpResponse(res, statusCode.BAD_REQUEST, responseStatus.FAILED, responseMessage.PERMISSION_DENIED);
        }

        const user_uuid = req.query.uuid;
        const godown_uuid = req.query.guuid;

        const userData = await User.findOne({ where: { uuid: user_uuid, user_roleId: userRoleId.USER_ROLE } });
        if (!userData) {
            httpResponse(res, statusCode.BAD_REQUEST, responseStatus.FAILED, responseMessage.USER_NOT_FOUND);
        }
        if (userData.user_statusId === statusId.INACTIVE) {
            return httpResponse(res, statusCode.BAD_REQUEST, responseStatus.FAILED, responseMessage.USER_DELETED_ALERT);
        }

        const godownData = await Godown.findOne({ where: { uuid: godown_uuid } });
        if (!godownData) {
            return httpResponse(res, statusCode.BAD_REQUEST, responseStatus.FAILED, responseMessage.GODOWN_NOT_FOUND);
        }

        const updatedGodownData = await Godown.update(
            { godown_managerId: userData.id },
            { where: { uuid: godown_uuid } }
        );

        if (!updatedGodownData) {
            return httpResponse(res, statusCode.OK, responseStatus.SUCCESS, responseMessage.MANAGER_ADDED_FAILED);
        }

        httpResponse(res, statusCode.OK, responseStatus.SUCCESS, responseMessage.MANAGER_ADDED_SUCCESSFULL);

    } catch (error) {
        httpResponse(res, statusCode.INTERNAL_SERVER_ERROR, responseStatus.FAILED, responseMessage.INTERNAL_SERVER_ERROR, error.message);
    }
}

const getGodownList = async (req, res) => {
    try {
        const uuid = req.uuid;
        const adminData = await User.findOne({ where: { uuid: uuid, user_roleId: userRoleId.ADMIN_ROLE, user_statusId: statusId.ACTIVE } });
        if (!adminData) {
            httpResponse(res, statusCode.BAD_REQUEST, responseStatus.FAILED, responseMessage.PERMISSION_DENIED);
        }

        const godownList = await Godown.findAll({
            attributes: ["id", "uuid", "location", "capacityInQuintals", "remainingCapacityInQuintals", "usedCapacityInQuintals"],
            where: { godown_statusId: statusId.ACTIVE },
            include: [
                {
                    model: User,
                    attributes: ["name"],
                    where: { user_statusId: statusId.ACTIVE },
                }, {
                    model: Status,
                    attributes: ["name"],
                    where: { is_deleted: isDeleted.NOT_DELETED }
                }, {
                    model: Inward,
                    attributes: ["id", "uuid", "nameOfSupplier", "itemName", "quantityInQuintals", "amount", "dateOfSupply"],
                    where: { is_deleted: isDeleted.NOT_DELETED }
                }, {
                    model: Delivery,
                    attributes: ["id", "uuid", "nameOfConsumer", "itemName", "quantityInQuintals", "amount", "dateOfDelivery"],
                    where: { is_deleted: isDeleted.NOT_DELETED }
                }, {
                    model: Return,
                    attributes: ["id", "uuid", "returnByName", "itemName", "quantityInQuintals", "amount", "returnPurpose", "dateOfReturn"],
                    where: { is_deleted: isDeleted.NOT_DELETED }
                }
            ]
        });

        if (!godownList) {
            httpResponse(res, statusCode.BAD_REQUEST, responseStatus.FAILED, responseMessage.FAILED_TO_LOAD_USER);
        }

        const responseData = godownList.map((godown) => ({
            id: godown.id,
            uuid: godown.uuid,
            location: godown.location,
            capacityInQuintals: godown.capacityInQuintals,
            remainingCapacityInQuintals: godown.remainingCapacityInQuintals,
            usedCapacityInQuintals: godown.usedCapacityInQuintals,
            godown_manager: godown.user.name,
            godown_status: godown.user_status.name,
            inwards: godown.inwards.map((data) => ({
                id: data.id,
                uuid: data.uuid,
                nameOfSupplier: data.nameOfSupplier,
                itemName: data.itemName,
                quantityInQuintals: data.quantityInQuintals,
                location: data.location,
                amount: data.amount,
                dateOfSupply: data.dateOfSupply
            })),
            deliveries: godown.deliveries.map((data) => ({
                id: data.id,
                uuid: data.uuid,
                nameOfConsumer: data.nameOfConsumer,
                itemName: data.itemName,
                quantityInQuintals: data.quantityInQuintals,
                amount: data.amount,
                dateOfDelivery: data.dateOfDelivery
            })),
            returns: godown.returns.map((data) => ({
                id: data.id,
                uuid: data.uuid,
                returnByName: data.returnByName,
                itemName: data.itemName,
                quantityInQuintals: data.quantityInQuintals,
                amount: data.amount,
                returnPurpose: data.returnPurpose,
                dateOfReturn: data.dateOfReturn
            }))
        }));

        httpResponse(res, statusCode.OK, responseStatus.SUCCESS, responseMessage.SUCCESS, responseData);

    } catch (error) {
        console.log(error.message);
        httpResponse(res, statusCode.INTERNAL_SERVER_ERROR, responseStatus.FAILED, responseMessage.INTERNAL_SERVER_ERROR, error.message);
    }
}

module.exports = {
    addStaticData,
    createUser,
    login,
    getUsersList,
    updateUserDetails,
    addGodown,
    addGodownManager,
    getGodownList,
}