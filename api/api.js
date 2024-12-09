const express = require("express");
const employeesRouter = require("./employees");
const apiRouter = express.Router();

apiRouter.use("/employees", employeesRouter);

module.exports = apiRouter;
