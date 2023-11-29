module.exports = (sequelize, Sequelize, DataTypes) => {
    const godowns = sequelize.define('godown', {
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
        location: {
            type: DataTypes.STRING(200),
            allowNull: false
        },
        capacityInQuintals: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        remainingCapacityInQuintals: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        usedCapacityInQuintals: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        godown_managerId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        godown_statusId: {
            type: DataTypes.INTEGER,
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
    return godowns;
}