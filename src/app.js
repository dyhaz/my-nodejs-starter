'use strict';

const express = require('express')
const userRouter = require('./routers/user')
const permissionRouter = require('./routers/permission')
const roleRouter = require('./routers/role')
const port = process.env.PORT
require('./db/db')

const app = express()

app.use(express.json())
app.use(function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
	res.header("Access-Control-Allow-Headers", "*");
	next();
});
app.use(userRouter)
app.use(permissionRouter)
app.use(roleRouter)

app.listen(port, () => {
	console.log(`Server running port ${port}`)
})
