import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './HomePage.module.css';

const HomePage: React.FC = () => {
  const [name, setName] = useState('');
  const [balance, setBalance] = useState('');
  const [wallet, setWallet] = useState<any>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const saved = localStorage.getItem('wallet');
    if (saved) {
      setWallet(JSON.parse(saved));
    }
  }, []);

  const handleCreateWallet = async () => {
    setError('');
    if (!name.trim()) {
      setError('Name is required.');
      return;
    }
    if (balance && isNaN(Number(balance))) {
      setError('Initial balance must be a valid number.');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('http://localhost:8000/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name,
          balance: parseFloat(balance || '0')
        })
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Wallet creation failed');
      }
      const data = await res.json();
      localStorage.setItem('wallet', JSON.stringify(data));
      setWallet(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.homeContainer}>
      {!wallet ? (
        <div className={styles.formBox}>
          <h2>Create Wallet</h2>
          <input
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            type="number"
            placeholder="Initial Balance (optional)"
            value={balance}
            onChange={(e) => setBalance(e.target.value)}
          />
          {error && <p className={styles.error}>{error}</p>}
          <button onClick={handleCreateWallet} disabled={loading}>
            {loading ? 'Creating...' : 'Create Wallet'}
          </button>
        </div>
      ) : (
        <div className={styles.walletBox}>
          <h2>Welcome, {wallet.name}</h2>
          <p>Balance: ₹{wallet.balance}</p>
        </div>
      )}
    </div>
  );
};

export default HomePage;
