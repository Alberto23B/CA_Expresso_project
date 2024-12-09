const express = require("express");
const cors = require("cors");
const errorHandler = require("errorhandler");
const morgan = require("morgan");
const apiRouter = require("./api/api");

const app = express();

const PORT = process.env.PORT || 4000;

app.use(express.json());
app.use(cors());
app.use(errorHandler());
app.use(morgan("dev"));
app.use("/api", apiRouter);

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});

module.exports = app;
