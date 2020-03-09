'use strict';

const express = require('express');
const userRouter = require('./routers/user');
const permissionRouter = require('./routers/permission');
const roleRouter = require('./routers/role');
const dashboardRouter = require('./routers/dashboard');
const port = process.env.PORT;
require('./db/db');

let bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.json({limit: '50mb'}) );
app.use(bodyParser.urlencoded({
	limit: '50mb',
	extended: true,
	parameterLimit:50000
}));
app.use(express.json());
app.use(function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
	res.header("Access-Control-Allow-Headers", "*");
	next();
});

app.use(userRouter);
app.use(permissionRouter);
app.use(roleRouter);
app.use(dashboardRouter);

app.listen(port, () => {
	console.log(`Server running port ${port}`)
});
