module.exports = (sequelize, Sequelize, DataTypes) => {
    const returns = sequelize.define('return', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
        },
        uuid: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        returnByName: {
            type: DataTypes.STRING(150),
            allowNull: false
        },
        godownId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        itemName: {
            type: DataTypes.STRING(150),
            allowNull: false
        },
        quantityInQuintals: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        amount: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        returnPurpose: {
            type: DataTypes.STRING(200),
            allowNull: false
        },
        dateOfReturn: {
            type: Sequelize.DATE,
            defaultValue: Sequelize.NOW,
        },
        is_deleted: {
            type: DataTypes.INTEGER(1),
            allowNull: false,
        },
        createdAt: {
            type: Sequelize.DATE,
            defaultValue: Sequelize.NOW,
        },
        updatedAt: {
            type: Sequelize.DATE,
            defaultValue: Sequelize.NOW,
        },
    });
    return returns;
}