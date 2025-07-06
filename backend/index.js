const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const {createWallet} = require('./services/walletService');

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.post("/setup", async (req, res) => {
  
  try {
    console.log(req.body);
    const result = await createWallet(req.body);
    res.status(200).json(result);
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: err.message });
  }
});


app.listen(5000, () => console.log("Server is running at 5000"));