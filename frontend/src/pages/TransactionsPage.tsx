import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ExportButton from '../components/ExportCSV.tsx';
import styles from './TransactionsPage.module.css';

interface Transaction {
  id: string;
  walletId: string;
  amount: number;
  balance: number;
  description: string;
  date: string;
  type: 'CREDIT' | 'DEBIT';
}

const TransactionsPage: React.FC = () => {
  const [transactions, setTransactions] = useState<Map<number, Transaction[]>>(new Map());
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(5);
  const [wallet, setWallet] = useState("");
  const [loading, setLoading] = useState(false);
  const [sortOption, setSortOption] = useState<'dateAsc' | 'dateDesc' | 'amountAsc' | 'amountDesc'>('dateDesc');
  const navigate = useNavigate();

  const fetchedPages = useRef<Set<number>>(new Set());    // stores already fetched page nos
  const pageOrder = useRef<number[]>([]);   // stores te=he order in which pages are accessed
  const maxCachePages = 10;

  // get the transactions whenever page is changed
  useEffect(() => {
    getTransactions();
  }, [page]);

  // when limit is changed clears cache and resets to page 0
  useEffect(() => {
    fetchedPages.current.clear();
    pageOrder.current = [];
    getTransactions();
    setPage(0);
  }, [limit]);

  // get wallet id from localstorage and fetch transactions
  const getTransactions = () => {
    const saved = localStorage.getItem('wallet');
    if (!saved) {navigate('/'); return;}  // if wallet is not found, go back to home page
    const parsed = JSON.parse(saved);
    setWallet(parsed.name);
    if (!fetchedPages.current.has(page)) {
      fetchTransactions(parsed.id, page * limit, limit);
    }
  }

  const fetchTransactions = async (walletId: string, skip: number, limit: number) => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8000/transactions?walletId=${walletId}&skip=${skip}&limit=${limit}`);
      if (!res.ok) throw new Error('Failed to fetch transactions');
      const data: Transaction[] = await res.json();

      setTransactions(prev => {
        const updated = new Map(prev);
        updated.set(page, data);            // add data to Transactions Map
        pageOrder.current.push(page);       // add page to latest order
        if (pageOrder.current.length > maxCachePages) {   // if cache is exceeded
          const oldest = pageOrder.current.shift();       // remove the earliest visited page from order
          if (oldest !== undefined) {        
            updated.delete(oldest);     // remove the earliest visited page from transactions and fetched page nos.
            fetchedPages.current.delete(oldest);
          }
        }
        return updated;
      });

      fetchedPages.current.add(page);
    } catch (err) {
      console.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const currentPageData = transactions.get(page) || [];

  const sortedData = useMemo(() => {
    const copy = [...currentPageData];
    switch (sortOption) {
      case 'dateAsc': return copy.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      case 'dateDesc': return copy.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      case 'amountAsc': return copy.sort((a, b) => a.amount - b.amount);
      case 'amountDesc': return copy.sort((a, b) => b.amount - a.amount);
    }
  }, [currentPageData, sortOption]);

  return (
    <div className={styles.txContainer}>
      <h2>Transaction History</h2>
      <div className={styles.sortControls}>
        <label>
          Sort by:{' '}
          <select value={sortOption} onChange={e => setSortOption(e.target.value as any)}>
            <option value="dateDesc">Descending Date</option>
            <option value="dateAsc">Ascending Date</option>
            <option value="amountDesc">Descending Amount</option>
            <option value="amountAsc">Ascending Amount</option>
          </select>
        </label>
        <label>
          Transactions per page:{' '}
          <select value={limit} onChange={e => setLimit(parseInt(e.target.value))}>
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
          </select>
        </label>
        {!loading && sortedData.length > 0 && (
          <ExportButton
            data={sortedData}
            filename={`transactions_${wallet || 'wallet'}.csv`}
            className={styles.exportBtn}
          />
        )}
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : sortedData.length === 0 ? (
        <p>No transactions found.</p>
      ) : (
        <div style={{overflowX:'scroll'}}>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Balance</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {sortedData.map(tx => (
                <tr key={tx.id}>
                  <td>{new Date(tx.date).toLocaleString()}</td>
                  <td>{tx.type}</td>
                  <td>{tx.amount}</td>
                  <td>{tx.balance}</td>
                  <td>{tx.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className={styles.pagination}>
        <button disabled={page === 0} onClick={() => setPage(p => p - 1)}>Prev</button>
        <button disabled={currentPageData.length < limit} onClick={() => setPage(p => p + 1)}>Next</button>
      </div>
    </div>
  );
};

export default TransactionsPage;
