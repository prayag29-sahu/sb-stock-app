import React, { useEffect, useState } from "react";
import "../styles/Profile.css";
import { RiRefund2Line, RiHistoryLine } from "react-icons/ri";
import { GiCash } from "react-icons/gi";
import { HiOutlineCurrencyRupee } from "react-icons/hi";
import { FiCreditCard } from "react-icons/fi";
import axiosInstance from "../components/axiosInstance";
import toast from "react-hot-toast";

const Profile = () => {
  const [actionType, setActionType] = useState("Transactions");
  const [userData, setUserData] = useState({});

  const userId   = localStorage.getItem("userId");
  const username = localStorage.getItem("username");

  const [depositAmount,  setDepositAmount]  = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [depositMode,    setDepositMode]    = useState("");
  const [withdrawMode,   setWithdrawMode]   = useState("");
  const [transactions,   setTransactions]   = useState([]);
  const [loading,        setLoading]        = useState(false);

  useEffect(() => {
    fetchUser();
    fetchTransactions();
  }, []);

  const fetchUser = () => {
    axiosInstance.get(`/fetch-user/${userId}`)
      .then((res) => setUserData(res.data))
      .catch((err) => console.log(err));
  };

  const fetchTransactions = async () => {
    axiosInstance.get(`/transactions/${userId}`)
      .then((res) => setTransactions(res.data.reverse()))
      .catch((err) => console.log(err));
  };

  // ── Deposit ────────────────────────────────────────────────────────────────
  const deposit = async (e) => {
    e.preventDefault();

    const amount = parseFloat(depositAmount);
    if (!amount || amount <= 0) {
      toast.error("❌ Please enter a valid deposit amount greater than 0");
      return;
    }
    if (!depositMode) {
      toast.error("❌ Please select a payment mode");
      return;
    }

    setLoading(true);
    try {
      const res = await axiosInstance.post("/deposit", {
        user: userId,
        depositAmount: amount,
        depositMode,
      });
      localStorage.setItem("balance", res.data.balance);
      setUserData((prev) => ({ ...prev, balance: res.data.balance }));
      fetchTransactions();
      setActionType("Transactions");
      setDepositAmount("");
      setDepositMode("");
      toast.success(`✅ ₹${amount} deposited successfully! New balance: ₹${res.data.balance}`);
    } catch (err) {
      const msg = err.response?.data?.message || "Deposit failed";
      toast.error(`❌ ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  // ── Withdraw ───────────────────────────────────────────────────────────────
  const withdraw = async (e) => {
    e.preventDefault();

    const amount = parseFloat(withdrawAmount);
    if (!amount || amount <= 0) {
      toast.error("❌ Please enter a valid withdrawal amount greater than 0");
      return;
    }
    if (!withdrawMode) {
      toast.error("❌ Please select a withdrawal mode");
      return;
    }
    if (amount > userData.balance) {
      toast.error(
        `❌ Insufficient balance! Your current balance is ₹${userData.balance}, but you're trying to withdraw ₹${amount}`
      );
      return;
    }

    setLoading(true);
    try {
      const res = await axiosInstance.post("/withdraw", {
        user: userId,
        withdrawAmount: amount,
        withdrawMode,
      });
      localStorage.setItem("balance", res.data.balance);
      setUserData((prev) => ({ ...prev, balance: res.data.balance }));
      fetchTransactions();
      setActionType("Transactions");
      setWithdrawAmount("");
      setWithdrawMode("");
      toast.success(`✅ ₹${amount} withdrawn successfully! New balance: ₹${res.data.balance}`);
    } catch (err) {
      const msg = err.response?.data?.message || "Withdrawal failed";
      toast.error(`❌ ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profilePage">
      <h2>My Account</h2>
      <div className="profileBox">
        <div className="profileBox-head">
          <p>{username}</p>
        </div>
        <div className="profileBox-body">
          <span>
            <p>Trading balance</p>
            <h6>₹ {userData?.balance ?? 0}</h6>
          </span>
          <div className="cash-actions">
            <button
              className={actionType === "AddFunds" ? "cash-actions-active" : "cash-actions-inactive"}
              onClick={() => setActionType("AddFunds")}
            >
              <RiRefund2Line className="cash-action-icons" /> Add Funds
            </button>
            <button
              className={actionType === "Withdraw" ? "cash-actions-active" : "cash-actions-inactive"}
              onClick={() => setActionType("Withdraw")}
            >
              <GiCash className="cash-action-icons" /> Withdraw
            </button>
            <button
              className={actionType === "Transactions" ? "cash-actions-active" : "cash-actions-inactive"}
              onClick={() => setActionType("Transactions")}
            >
              <RiHistoryLine className="cash-action-icons" /> Transaction History
            </button>
          </div>
        </div>
      </div>

      <div>
        {/* ── ADD FUNDS ── */}
        {actionType === "AddFunds" && (
          <div className="ProfileFunds">
            <h3>Add Funds</h3>
            <form>
              <div className="mb-3">
                <label htmlFor="amountInput" className="form-label">
                  <HiOutlineCurrencyRupee /> Amount
                </label>
                <input
                  type="number"
                  min="1"
                  className="form-control"
                  id="amountInput"
                  placeholder="Enter amount"
                  onChange={(e) => setDepositAmount(e.target.value)}
                  value={depositAmount}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="depositMode" className="form-label">
                  <FiCreditCard /> Payment mode
                </label>
                <select
                  className="form-select"
                  id="depositMode"
                  onChange={(e) => setDepositMode(e.target.value)}
                  value={depositMode}
                >
                  <option value="">Choose payment mode</option>
                  <option value="UPI">UPI Payment</option>
                  <option value="Net Banking">Net Banking</option>
                  <option value="Card">Credit/Debit Card</option>
                </select>
              </div>
              <button className="btn btn-primary" onClick={deposit} disabled={loading}>
                {loading ? "Processing..." : "Proceed"}
              </button>
            </form>
          </div>
        )}

        {/* ── WITHDRAW ── */}
        {actionType === "Withdraw" && (
          <div className="ProfileFunds">
            <h3>Withdraw</h3>
            {userData?.balance !== undefined && (
              <p style={{ color: "#2E86C1", fontWeight: "600", marginBottom: "12px" }}>
                Available Balance: ₹{userData.balance}
              </p>
            )}
            <form>
              <div className="mb-3">
                <label htmlFor="withdrawInput" className="form-label">
                  <HiOutlineCurrencyRupee /> Amount
                </label>
                <input
                  type="number"
                  min="1"
                  max={userData?.balance}
                  className="form-control"
                  id="withdrawInput"
                  placeholder="Enter amount"
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  value={withdrawAmount}
                />
                {parseFloat(withdrawAmount) > userData?.balance && (
                  <small style={{ color: "#e74c3c" }}>
                    ⚠️ Amount exceeds available balance (₹{userData?.balance})
                  </small>
                )}
              </div>
              <div className="mb-3">
                <label htmlFor="withdrawMode" className="form-label">
                  <FiCreditCard /> Withdraw mode
                </label>
                <select
                  className="form-select"
                  id="withdrawMode"
                  onChange={(e) => setWithdrawMode(e.target.value)}
                  value={withdrawMode}
                >
                  <option value="">Choose withdraw mode</option>
                  <option value="UPI">UPI Payment</option>
                  <option value="NEFT">NEFT</option>
                  <option value="IMPS">IMPS</option>
                </select>
              </div>
              <button className="btn btn-primary" onClick={withdraw} disabled={loading}>
                {loading ? "Processing..." : "Proceed"}
              </button>
            </form>
          </div>
        )}

        {/* ── TRANSACTIONS ── */}
        {actionType === "Transactions" && (
          <div className="ProfileFunds">
            <h3>Transactions</h3>
            <div className="profileTransactions">
              {transactions.length === 0 ? (
                <p style={{ color: "#7f8c8d", textAlign: "center", padding: "20px" }}>
                  No transactions yet.
                </p>
              ) : (
                transactions.map((t, index) => (
                  <div className="profileTransaction" key={index}>
                    <span>
                      <h6>Amount</h6>
                      <p>₹ {t.amount}</p>
                    </span>
                    <span>
                      <h6>Action</h6>
                      <p style={{ color: t.type === "Deposit" ? "#1e8449" : "#c0392b", fontWeight: "600" }}>
                        {t.type}
                      </p>
                    </span>
                    <span>
                      <h6>Payment mode</h6>
                      <p>{t.paymentMode}</p>
                    </span>
                    <span>
                      <h6>Time</h6>
                      <p>{String(t.time).slice(0, 24)}</p>
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
