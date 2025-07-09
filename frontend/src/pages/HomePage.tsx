import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import TransactionForm from '../components/TransactionForm.tsx';
import styles from './HomePage.module.css';

interface Wallet {
  id: string;
  name: string;
  balance: number;
  date: string;
}

const HomePage: React.FC = () => {
  const [name, setName] = useState<string>('');
  const [balance, setBalance] = useState<string>('');
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  // fetch wallet details from localstorage
  useEffect(() => {
    const walletId = localStorage.getItem('wallet');
    if (walletId) {
      fetchWallet(walletId);
    }
  }, []);

  const fetchWallet = async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8000/wallet/${id}`);
      if (!res.ok) throw new Error('Failed to fetch wallet');
      const data: Wallet = await res.json();
      setWallet(data);
    } catch (err: any) {
      setError(err.message);
      localStorage.removeItem('walletId');
    } finally {
      setLoading(false);
    }
  };

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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, balance: parseFloat(balance || '0') })
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Wallet creation failed');
      }
      const data: Wallet = (await res.json());
      localStorage.setItem('wallet', data.id);
      setWallet(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.homeContainer}>
      <h1>eWallet</h1>
      {!wallet ? (  // if wallet is not setup show wallet form else show wallet details
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
            {loading ? 'Creating...' : 'Create'}
          </button>
        </div>
      ) : (
        <>
          <div className={styles.walletBox}>
            <h2>Welcome, {wallet.name}</h2>
            <p>Balance: ₹{wallet.balance}</p>
            <TransactionForm walletId={wallet.id} onTransaction={() => fetchWallet(wallet.id)}/>
            <div style={{ marginTop: '2rem' }}>
            <Link to="/transactions" className={styles.linkBtn}>
              Transaction History &rarr;
            </Link>
          </div>
          </div>
        </>
      )}
    </div>
  );
};

export default HomePage;
