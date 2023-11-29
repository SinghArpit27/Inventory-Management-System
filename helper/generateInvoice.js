

const generateInvoice = async (supplier, godown, itemName, quantity, amount) => {

    const responseData = {
        supplier: supplier,
        godown: godown,
        itemName: itemName,
        quantity: quantity,
        amount: amount,
    }

    return responseData;
}

module.exports = generateInvoice;