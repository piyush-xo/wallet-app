const { v4: uuidv4 } = require("uuid");
const mysql = require("mysql2/promise");
const { dbConfig } = require("../config");

const pool = mysql.createPool(dbConfig);
const parseAmount = (num) => parseFloat(Number(num).toFixed(4));

async function transact(walletId, amount, description) {
  const transactionId = uuidv4();
  const date = new Date();

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    // check if the walletId exists
    // set up row lock to update the balance
    const [[wallet]] = await conn.query(
      "SELECT balance FROM wallets WHERE id = ? FOR UPDATE",
      [walletId]
    );

    if (!wallet) {
      throw new Error("Wallet not found");
    }
    // get txn type from -ve or +ve amount 
    const type = amount >= 0 ? "CREDIT" : "DEBIT";
    // convert wallet balance to float and calculate new balance
    const newBalance = parseAmount(parseFloat(wallet.balance) + parseAmount(amount));
    // update tables with new data
    await conn.query(
      "UPDATE wallets SET balance = ?, date = ? WHERE id = ?",
      [newBalance, date, walletId]
    );

    await conn.query(
      "INSERT INTO transactions (id, walletId, amount, balance, description, date, type) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [transactionId, walletId, amount, newBalance, description, date, type]
    );

    await conn.commit();
    return { balance: newBalance, transactionId };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

async function getTransactions(walletId, limit = 10, skip = 0) {
  const [[wallet]] = await pool.query(
    "SELECT id FROM wallets WHERE id = ?",
    [walletId]
  );

  if (!wallet) {
    throw new Error("Wallet not found");
  }
  
  const [rows] = await pool.query(
    "SELECT id, walletId, amount, balance, description, date, type FROM transactions WHERE walletId = ? ORDER BY date DESC LIMIT ? OFFSET ?",
    [walletId, parseInt(limit), parseInt(skip)]
  );
  return rows;
}

module.exports = {
  transact,
  getTransactions
};
