import React, { useState } from "react";
import styles from "./TransactionForm.module.css";

interface TransactionFormProps {
  walletId: string;
  onTransaction: (newBalance: number) => void;
}

const TransactionForm: React.FC<TransactionFormProps> = ({
  walletId,
  onTransaction,
}) => {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<"CREDIT" | "DEBIT">("CREDIT");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const toggleTransactionType = () => {
    setType((prev) => (prev === "CREDIT" ? "DEBIT" : "CREDIT"));
  };

  const handleSubmit = async () => {
    setError("");
    if (!amount || isNaN(Number(amount))) {
      setError("Enter a valid amount");
      return;
    }
    if (!description.trim() || description.trim().length ===0) {
      setError("Enter a description");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8000/transact/${walletId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: type === "DEBIT" ? -Math.abs(Number(amount)) : Number(amount),
          description,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Transaction failed");
      }
      const data = await res.json();
      onTransaction(data.balance);
      setAmount("");
      setDescription("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.formCard}>
      <h3>Transaction</h3>
      <div className={styles.amountContainer}>
        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <span
          onClick={toggleTransactionType}
          style={{backgroundColor: type === "CREDIT" ? "MediumSeaGreen" : "tomato"}}
          className={styles.toggle}
        >
          {type}
        </span>
      </div>
      <input
        type="text"
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      {error && <p className={styles.error}>{error}</p>}
      <button onClick={handleSubmit} disabled={loading}>
        {loading ? "Processing..." : "Submit"}
      </button>
    </div>
  );
};

export default TransactionForm;
