import React, { useContext, useState } from 'react'
import { GeneralContext } from '../context/GeneralContext';
import toast from 'react-hot-toast';

const Register = ({ setIsLoginBox }) => {
  const { setUsername, setEmail, setPassword, setUsertype, register } = useContext(GeneralContext);
  const [usernameVal,  setUsernameVal]  = useState('');
  const [emailVal,     setEmailVal]     = useState('');
  const [passVal,      setPassVal]      = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [loading,      setLoading]      = useState(false);

  const handleUsertypeChange = (e) => {
    setSelectedType(e.target.value);
    setUsertype(e.target.value);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!usernameVal.trim()) { toast.error('Username is required.'); return; }
    if (usernameVal.trim().length < 3) { toast.error('Username must be at least 3 characters.'); return; }
    if (!emailVal.trim()) { toast.error('Email address is required.'); return; }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailVal.trim())) { toast.error('Enter a valid email (e.g. user@gmail.com).'); return; }
    if (!passVal) { toast.error('Password is required.'); return; }
    if (passVal.length < 6) { toast.error('Password must be at least 6 characters.'); return; }
    if (!selectedType) { toast.error('Please select a user type: Admin or Customer.'); return; }
    setLoading(true);
    try { await register(); } finally { setLoading(false); }
  };

  return (
    <form className="authForm">
      <h2>Register</h2>
      <div className="form-floating mb-3 authFormInputs">
        <input type="text" className="form-control" id="regUsername" placeholder="username" value={usernameVal}
          onChange={(e) => { setUsernameVal(e.target.value); setUsername(e.target.value); }} />
        <label htmlFor="regUsername">Username</label>
      </div>
      <div className="form-floating mb-3 authFormInputs">
        <input type="email" className="form-control" id="regEmail" placeholder="name@example.com" value={emailVal}
          onChange={(e) => { setEmailVal(e.target.value); setEmail(e.target.value); }} />
        <label htmlFor="regEmail">Email address</label>
      </div>
      <div className="form-floating mb-3 authFormInputs">
        <input type="password" className="form-control" id="regPassword" placeholder="Password" value={passVal}
          onChange={(e) => { setPassVal(e.target.value); setPassword(e.target.value); }} />
        <label htmlFor="regPassword">Password</label>
      </div>
      <select className="form-select form-select-lg mb-3" value={selectedType} onChange={handleUsertypeChange}>
        <option value="" disabled>Select User Type</option>
        <option value="admin">Admin</option>
        <option value="customer">Customer</option>
      </select>
      <button className="btn btn-primary" onClick={handleRegister} disabled={loading}>
        {loading ? 'Signing up...' : 'Sign up'}
      </button>
      <p>Already registered? <span onClick={() => setIsLoginBox(true)}>Login</span></p>
    </form>
  );
};

export default Register;
