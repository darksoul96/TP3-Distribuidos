const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const port = 8080;

const app = express();
const server = app.listen(port, () => {
  console.log("Server on")
});

app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.post("/", (req, res) => {
  console.log(req.body);
  res.status(201).send("File Recieved");
});
