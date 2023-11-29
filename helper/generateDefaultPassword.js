function generateDefaultPassword(fullName) {
    // Extract the first name and convert it to lowercase
    const firstName = fullName.split(' ')[0].toLowerCase();

    // Your default value
    const defaultValue = 'ims';

    // Concatenate the components to form the password
    const password = `${firstName}@${defaultValue}`;

    return password;
}


module.exports = generateDefaultPassword;