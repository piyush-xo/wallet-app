const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const {createWallet} = require('./services/walletService');
const {transact} = require("./services/transactionService");

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.post("/setup", async (req, res) => {
  try {
    const result = await createWallet(req.body);
    res.status(200).json(result);
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/transact/:walletId", async (req, res) => {
  const { walletId } = req.params;
  const { amount, description } = req.body;

  try {
    const result = await transact(walletId, amount, description);
    res.status(200).json(result);
  } catch (err) {
    const code = err.message.includes("Wallet not found") ? 404 : 500;
    res.status(code).json({ error: err.message });
  }
});

app.listen(8000, () => {
  console.log(`Server is running at 8000`);
});