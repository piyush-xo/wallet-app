// File: services/walletService.js
const { v4: uuidv4 } = require("uuid");
const mysql = require("mysql2/promise");
const { dbConfig } = require("../config");

const pool = mysql.createPool(dbConfig);
const parseAmount = (num) => parseFloat(Number(num).toFixed(4));

async function createWallet({ name, balance }) {
  const walletId = uuidv4();
  const transactionId = uuidv4();
  const amount = parseAmount(balance);
  const date = new Date();

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    await conn.query("INSERT INTO wallets (id, name, balance, date) VALUES (?, ?, ?, ?)",
      [walletId, name, amount, date]
    );

    await conn.query("INSERT INTO transactions (id, walletId, amount, balance, description, date, type) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [transactionId, walletId, amount, amount, "Setup", date, "CREDIT"]
    );

    await conn.commit();
    
    return { id: walletId, balance: amount, name, date, transactionId };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

module.exports = {
  createWallet
};
