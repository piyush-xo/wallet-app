The Application is hosted at: http://40.81.243.69:3000/ 
----
# Project Setup

This is a fullstack application built with **React**, **Node.js** and **MySQL** which allows users to create a wallet, perform credit / debit transactions, and retrieve wallet and transaction details.

* `/frontend` – React application, runs on port 3000
* `/backend` – Node.js server with MySQL integration, runs on port 8000

#### Prerequisites

* Node.js
* MySQL Server
* npm (Node Package Manager)

#### 1. Database Setup (MySQL)

- Create the Database
```sql
CREATE DATABASE wallet_app;
USE wallet_app;
```
- Create Wallet Table
```sql
CREATE TABLE wallets (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  balance DECIMAL(18,4) NOT NULL,
  date DATETIME NOT NULL
);
```

- Create Transactions Table
```sql
CREATE TABLE transactions (
  id VARCHAR(36) PRIMARY KEY,
  walletId VARCHAR(36),
  amount DECIMAL(18,4),
  balance DECIMAL(18,4),
  description TEXT,
  date DATETIME,
  type ENUM('CREDIT', 'DEBIT'),
  FOREIGN KEY (walletId) REFERENCES wallets(id)
);
```

- Create Indexes (Optional but Recommended)
```sql
CREATE INDEX idx_wallet_id ON transactions(walletId);
CREATE INDEX idx_transaction_date ON transactions(date);
```

#### 2. Clone the Repository

```bash
git clone <repo-url>
cd <project-root>
```

#### 3. Backend Setup

* Create a `.env` file in the backend folder with the following variables:

```env
DB_HOST=localhost
DB_USER=username
DB_PASSWORD=password
DB_NAME=wallet_db
```

* Start the backend

```bash
cd backend
npm install
npm start
```

#### 4. Frontend Setup

```bash
cd frontend
npm install
npm start
```

# API Documentation

### 1. Initialize Wallet

**Endpoint:** `POST /setup`
**Description:** Initialize a new wallet with a name and initial balance.

#### Sample Request

```json
{
  "balance": 20.5612,
  "name": "MyWallet"
}
```

#### Sample Response

```json
{
  "id": "generated_id",
  "balance": 20.5612,
  "transactionId": "4349349843",
  "name": "MyWallet",
  "date": "2025-07-08T10:00:00.000Z"
}
```

### 2. Credit/Debit Amount

**Endpoint:** `POST /transact/:walletId`
**Description:** Credit or debit an amount to the wallet. A negative value for amount denotes a debit transaction.

#### Sample Request

```json
{
  "amount": 10,
  "description": "Recharge"
}
```

#### Sample Response

```json
{
  "balance": 30,
  "transactionId": "8328832323"
}
```

### 3. Fetch Transactions

**Endpoint:** `GET /transactions?walletId={walletId}&skip={skip}&limit={limit}`
**Description:** Fetch recent transactions for a wallet. Use skip and limit queries for pagination.

#### Sample Response

```json
[
  {
    "id": "343434",
    "walletId": "1243434",
    "amount": 2.4,
    "balance": 12.4,
    "description": "Recharge",
    "date": "2025-07-08T10:10:00.000Z",
    "type": "CREDIT"
  },
  {
    "id": "544521",
    "walletId": "1243434",
    "amount": 10,
    "balance": 10,
    "description": "Setup",
    "date": "2025-07-08T10:00:00.000Z",
    "type": "CREDIT"
  }
]
```

### 4. Get Wallet Details

**Endpoint:** `GET /wallet/:id`
**Description:** Retrieve wallet details by ID.

#### Sample Response

```json
{
  "id": "1243434",
  "balance": 12.4,
  "name": "Wallet A",
  "date": "2025-07-08T10:00:00.000Z"
}
```
# Database Queries

### 1. Create Wallet
**Route:** `POST /setup`

```sql
SELECT * FROM wallet WHERE name = ?;
```
- Checks if a wallet already exists with that name.

```sql
INSERT INTO wallet (id, name, balance) VALUES (?, ?, ?);
```
- Creates a new wallet if it doesn't exist.
- Prevents duplicates via pre-check.

### 2. Add Transaction (Credit/Debit)
**Route:** `POST /transaction`

Wrapped in a transaction block for safety

```sql
SELECT * FROM wallet WHERE id = ? FOR UPDATE;
```
- Locks the wallet row so that no other transaction can read or write it until this one completes.
- Ensures only one transaction can modify the wallet's balance at a time.

```sql
INSERT INTO transactions (id, walletId, amount, balance, type, description, date)
VALUES (?, ?, ?, ?, ?, ?, ?);
```
- Adds the transaction entry with all relevant info.
- Balance value is computed beforehand based on type (CREDIT or DEBIT).

```sql
UPDATE wallet SET balance = ? WHERE id = ?;
```
- Updates the wallet’s balance to reflect the transaction.

```sql
COMMIT;
```
- Applies all the changes in the transaction.

```sql
ROLLBACK;
```
- In case of any error ensures no partial data is saved.

### 3. Get Paginated Transactions
**Route:** `GET /transactions?walletId={id}&skip={offset}&limit={count}`

```sql
SELECT * FROM transactions
WHERE walletId = ?
ORDER BY date DESC
LIMIT ? OFFSET ?;
```
- Retrieves transactions for the wallet using pagination
- Sorted by most recent first

### 4. Get Wallet Info
**Route:** `GET /wallet/:id`


```sql
SELECT * FROM wallet WHERE id = ?;
```
Used to retrieve wallet details:
