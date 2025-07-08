# Project Setup

This is a fullstack application built with **React**, **Node.js**, and **MySQL** which allows users to create a wallet, perform credit / debit transactions, and retrieve wallet and transaction details.

* `/frontend` – React application, runs on port 3000
* `/backend` – Node.js server with MySQL integration, runs on port 8000

#### Prerequisites

* Node.js
* MySQL Server
* npm (Node Package Manager)

#### 1. Clone the Repository

```bash
git clone <repo-url>
cd <project-root>
```

#### 2. Backend Setup

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

#### 3. Frontend Setup

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
