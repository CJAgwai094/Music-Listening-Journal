const express = require("express");
const fs = require("fs");
const cors = require("cors")
const app = express();
const port = 3000;

app.use(express.json());

app.use(cors());

app.get('/', (req, res) => {
  res.json({ message: 'Hello World!' });
});

app.post('/api/post', (req, res) => {
  const newdata = req.body;
  console.log("Received data:", newdata);
  //read the existing file to get the current data
  fs.readFile("data.json", "utf8", (readErr, fileData) => {
   let jsonArray = [];
    if (readErr) {
      console.error("Failed to read data from file:", readErr);
      res.status(500).json({ message: "Failed to save data" });
    } else {
      jsonArray = JSON.parse(fileData || "[]");
      //append the new data to the array and
      // write the updated array back to the file
      jsonArray.push(newdata);
      fs.writeFile("data.json", JSON.stringify(jsonArray, null, 2), 'utf8', (writeErr) => {
        if (writeErr) {
          console.error("Failed to write data to file:", writeErr);
          res.status(500).json({ message: "Failed to save data" });
        } else {
          //success
          res.status(200).json({ message: "Data received successfully" });
        }
      });
    }
  });
});

app.listen(port, () => {
  console.log("Server is running on http://localhost:" + port);
});

