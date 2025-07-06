const express = require("express");
const mysql = require("mysql2/promise");
const {dbConfig} = require("./config");

const app = express();

async function testDBConnection() {
  try {
    console.log(dbConfig);
    const conn = mysql.createPool(dbConfig);
    console.log("connected");
    await conn.end();
  } catch (err) {
    console.error("failed", err.message);
  }
}
testDBConnection();

app.listen(5000, () => console.log("Server is running at 5000"));