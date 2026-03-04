import React, { useEffect, useState } from 'react'
import '../styles/AllTransactions.css'
import axiosInstance from '../components/axiosInstance';
import { useNavigate } from 'react-router-dom';

const AllTransactions = () => {

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await axiosInstance.get('/transactions');
      const data = Array.isArray(response.data) ? response.data : [];
      setTransactions(data.reverse());
    } catch (err) {
      // FIX: err.response can be undefined on network errors
      if (err.response && err.response.status === 401) {
        localStorage.clear();
        navigate('/');
      }
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  // Safe time formatter — FIX: transaction.time can be undefined/null
  const formatTime = (time) => {
    if (!time) return 'N/A';
    return String(time).slice(0, 24);
  };

  return (
    <div className="all-transactions-page">
      <h2>All Transactions</h2>

      {loading ? (
        <p style={{ textAlign: 'center', color: '#7f8c8d', padding: '40px' }}>
          Loading transactions...
        </p>
      ) : transactions.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#7f8c8d', padding: '40px' }}>
          No transactions found.
        </p>
      ) : (
        <div className="all-transactions">
          {transactions.map((transaction, index) => (
            <div className="admin-transaction" key={transaction._id || index}>
              <span>
                <h6>Transaction Id</h6>
                <p>{transaction._id}</p>
              </span>
              <span>
                <h6>User Id</h6>
                <p>{transaction.user}</p>
              </span>
              <span>
                <h6>Amount</h6>
                <p>₹ {transaction.amount}</p>
              </span>
              <span>
                <h6>Action</h6>
                <p style={{ color: transaction.type === 'Deposit' ? '#1e8449' : '#c0392b', fontWeight: '600' }}>
                  {transaction.type}
                </p>
              </span>
              <span>
                <h6>Payment Mode</h6>
                <p>{transaction.paymentMode || 'N/A'}</p>
              </span>
              <span>
                <h6>Time</h6>
                <p>{formatTime(transaction.time)}</p>
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AllTransactions;
