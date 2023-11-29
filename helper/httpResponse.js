
// Response handler
const httpResponse = async (res, statusCode, responseStatus, responseMessage, data) => {

    if (data !== 'undefined') {
        res.status(statusCode).json({
            status: responseStatus,
            message: responseMessage,
            data: data
        });
    } else {
        res.status(statusCode).json({
            status: responseStatus,
            message: responseMessage,
        });
    }

}

module.exports = httpResponse;