const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const crypto = require('crypto');

const port = 8080;

const app = express();
const server = app.listen(port, () => {
  console.log("Server on")
});

app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.post("/", (req, res) => {
  let file = {
    id: req.body.id,
    filename: req.body.filename,
    filesize: req.body.filesize,
    nodeIP: req.body.nodeIP,
    nodePort: req.body.nodePort,
  };
  let hash = crypto.createHash('sha1');
  hash.update(file.filename + Math.round(file.filesize).toString());
  console.log(hash.digest('hex'));
  console.log(file.filename);
  res.status(201).send("File Recieved");
});
