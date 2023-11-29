const bcrypt = require('bcrypt');

const hashPassword = async(password, saltOrRounds) => {
    return await bcrypt.hash(password, saltOrRounds);
}

module.exports = hashPassword;