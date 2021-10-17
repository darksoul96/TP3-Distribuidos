//const http = require("http");
//const { request } = require("https");
const url = "http://localhost:8080";

// const request = http.request(url, { method: "POST" }, function (response) {
//   response.on("data", function (chunk) {
//     body += chunk;
//   });
//   response.on("end", function () {
//     console.log(body);
//   });
//   response.on("close", () => {
//     console.log("Connection closed!");
//   });
// });

const cargaFile = () => {
  console.log("hola");
  fid = document.getElementById("fid").value;
  fname = document.getElementById("fname").value;
  fsize = document.getElementById("fsize").value;
  fnodeip = document.getElementById("fnodeip").value;
  fnodeport = document.getElementById("fnodeport").value;

  let file = {
    id: fid,
    filename: fname,
    filesize: fsize,
    nodeIP: fnodeip,
    nodePort: fnodeport,
  };
  console.log(file);
  const post = fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    //body: JSON.stringify(file),
    //body: JSON.stringify("holaaaaA"),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Success:", data);
    })
    .catch((error) => {
      console.error("Error:", error);
    });
  post;
};
