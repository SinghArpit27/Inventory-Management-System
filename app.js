const app = require('express')();
const bodyParser = require('body-parser');
require('dotenv').config();

// middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// DB Instance
const db = require('./models/dbConnection');
db.sequelize.sync();

// ADMIN ROUTES
const adminRoute = require('./modules/admin/adminRoute');
app.use('/admin', adminRoute);

// USER ROUTES
const userRoute = require('./modules/user/userRoute');
app.use('/', userRoute);


app.listen(process.env.PORT, () => {
    console.info(`Server is running on PORT: ${process.env.PORT}`);
});