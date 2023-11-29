const userRoleId = {
    ADMIN_ROLE: 1,   // Admin
    USER_ROLE: 2 // User
}

const statusId = {
    ACTIVE: 1,   // Active
    INACTIVE: 2,    // Inactive
}

const isDeleted = {
    NOT_DELETED: 0, // 0 stand for not deleted
    DELETED: 1, // 1 stands for deleted
}

const contactAdmin = {
    email: "admin@example.com"
}

const quantityInQuintal = {
    oneQuintal: 100000,     // 1 quintal in grams
    twoQuintal: 200000,     // 2 quintal in grams
    threeQuintal: 300000,   // 3 quintal in grams
    fourQuintal: 400000,    // 4 quintal in grams
    fiveQuintal: 500000,    // 5 quintal in grams
    sixQuintal: 600000      // 6 quintal in grams
}


module.exports = {
    userRoleId,
    statusId,
    isDeleted,
    contactAdmin,
    quantityInQuintal
}