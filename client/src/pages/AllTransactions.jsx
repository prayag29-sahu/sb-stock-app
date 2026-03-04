// import React, { useEffect, useState } from 'react'
// import '../styles/AllTransactions.css'
// import axios from 'axios';
// import axiosInstance from '../components/axiosInstance';
// import { useNavigate } from 'react-router-dom';

// const AllTransactions = () => {

//   const [transactions, setTransactions] = useState([]);
//   const navigate = useNavigate()

//   useEffect(()=>{
//     fetchTransactions();
//   }, [])

//   const fetchTransactions = async()=>{
//     await axiosInstance.get('/transactions').then(
//       (response)=>{
//         setTransactions(response.data.reverse());
//       }
//     ).catch((err)=>{
//       if (err.response.status == 400){
//         localStorage.clear()
//         navigate("/")
//       }
//       console.log(err)
//     })
//   }

//   return (
//     <div className="all-transactions-page">
//         <h2>All Transactions</h2>
//         <div className="all-transactions">

//               {transactions.map((transaction, index)=>{
//                 return(
//                   <div className="admin-transaction" key={index} >
//                       <span>
//                         <h6>Transaction Id</h6>
//                         <p>{transaction._id}</p>
//                       </span>
//                       <span>
//                         <h6>User Id</h6>
//                         <p>{transaction.user}</p>
//                       </span>
//                       <span>
//                         <h6>Amount</h6>
//                         <p>$ {transaction.amount}</p>
//                       </span>
//                       <span>
//                         <h6>Action</h6>
//                         <p> {transaction.type} </p>
//                       </span>
//                       <span>
//                         <h6>Payment mode</h6>
//                         <p>{transaction.paymentMode}</p>
//                       </span>
//                       <span>
//                         <h6>Time</h6>
//                         <p>{transaction.time.slice(0,24)}</p>
//                       </span>
//                   </div>
//                 )
//               })}
//         </div>
//     </div>
//   )
// }

// export default AllTransactions

import React, { useEffect, useState } from "react";
import "../styles/AllTransactions.css";
import axiosInstance from "../components/axiosInstance";
import { useNavigate } from "react-router-dom";

const AllTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await axiosInstance.get("/transactions");

      // reverse without mutating original
      const reversed = [...response.data].reverse();
      setTransactions(reversed);
    } catch (err) {
      console.log(err);

      if (err.response && err.response.status === 401) {
        localStorage.clear();
        navigate("/");
      }
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (time) => {
    if (!time) return "N/A";
    return new Date(time).toLocaleString();
  };

  if (loading) {
    return (
      <div className="all-transactions-page">
        <h2>All Transactions</h2>
        <p>Loading transactions...</p>
      </div>
    );
  }

  return (
    <div className="all-transactions-page">
      <h2>All Transactions</h2>

      <div className="all-transactions">
        {transactions.length === 0 ? (
          <p>No transactions found.</p>
        ) : (
          transactions.map((transaction) => (
            <div className="admin-transaction" key={transaction._id}>
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
                <p>$ {transaction.amount}</p>
              </span>

              <span>
                <h6>Action</h6>
                <p
                  style={{
                    color:
                      transaction.type === "Deposit"
                        ? "green"
                        : transaction.type === "Withdraw"
                          ? "red"
                          : "black",
                  }}
                >
                  {transaction.type}
                </p>
              </span>

              <span>
                <h6>Payment Mode</h6>
                <p>{transaction.paymentMode || "N/A"}</p>
              </span>

              <span>
                <h6>Time</h6>
                <p>{formatTime(transaction.time)}</p>
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AllTransactions;