const { contactAdmin } = require('./constantData');

const responseMessage = {


    REGISTRATION_FAILED: "User Registration Failed",
    REGISTRATION_SUCCESS: "User Registered Successfully",

    INCORRECT_CREDENTIALS: "Incorrect Cedentails",
    ACCOUNT_SUSPENDED: `Your account is suspended, Contact Admin to Retrieve your Account:- ${contactAdmin.email}`,
    LOGIN_SUCCESS: "Successfully Login",

    FAILED_TO_UPDATE_USER: "Failed To Update User Details",
    UPDATE_SUCCES: "Successfully Updated User",
    FAILED_TO_LOAD_USER: "Failed to get Users",

    FAILED_TO_ADD_GODOWN: "Failed to add godown",
    GODOWN_ADDEDD_SUCCESS: "Godown added successfully",
    USER_DELETED_ALERT: "can't assign this user is suspended",
    USER_NOT_FOUND: "failed to found User",

    MANAGER_ADDED_FAILED: "failed to add manager",
    MANAGER_ADDED_SUCCESSFULL: "Manager Added Successfully done",

    PASSWORD_CHANGED_SUCCESS: "password changed successfully",
    PASSWORD_CHANGED_FAILED: "failed to change password",

    GODOWN_NOT_FOUND: "failed to found godown",
    GODOWN_SUSPENDED: `This godown is suspended, Contact Admin to Active this godown:- ${contactAdmin.email}`,

    INWARDS_ADDEDD_SUCCESS: "Products Received successfully",
    INWARDS_ADDEDD_FAILED: "Inwards Failed",

    DELIVERY_FAILED: "failed to deliver product",
    DELIVERY_SUCCESS: "product delivery successfully done",

    PRODUCT_HISTORY_NOT_FOUND: "Product return failed, don't able to get your purchase history for this product",
    PRODUCT_RETURN_FAILED: "Product return failed",
    PRODUCT_RETURN_SUCCESS: "product return successfully done",

    FAILED_TO_LOAD_GODOWN: "failed to get godown data",


    SUCCESS: "Success",
    UNAUTHORIZED: "Unauthorized",
    BAD_REQUEST: "Bad Request",
    NOT_FOUND: "Not Found",
    INTERNAL_SERVER_ERROR: "Internal Server Error",
    PERMISSION_DENIED: "This Operation Only done by Admin"

}

const responseStatus = {
    SUCCESS: "success", // 1 stands for success
    FAILED: "failed"    // 0 stands for failed
}

const statusCode = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500
}

module.exports = {
    responseMessage,
    responseStatus,
    statusCode
}