import React, { useContext, useState } from 'react'
import { GeneralContext } from '../context/GeneralContext';
import toast from 'react-hot-toast';

const Login = ({ setIsLoginBox }) => {
  const { setEmail, setPassword, login } = useContext(GeneralContext);
  const [emailVal,  setEmailVal]  = useState('');
  const [passVal,   setPassVal]   = useState('');
  const [loading,   setLoading]   = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    // Client-side validation with clear messages
    if (!emailVal.trim()) {
      toast.error('❌ Please enter your email address.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailVal.trim())) {
      toast.error('❌ Please enter a valid email address (e.g. user@gmail.com).');
      return;
    }
    if (!passVal) {
      toast.error('❌ Please enter your password.');
      return;
    }
    if (passVal.length < 6) {
      toast.error('❌ Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      await login();
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="authForm">
      <h2>Login</h2>

      <div className="form-floating mb-3 authFormInputs">
        <input
          type="email"
          className="form-control"
          id="loginEmail"
          placeholder="name@example.com"
          value={emailVal}
          onChange={(e) => { setEmailVal(e.target.value); setEmail(e.target.value); }}
        />
        <label htmlFor="loginEmail">Email address</label>
      </div>

      <div className="form-floating mb-3 authFormInputs">
        <input
          type="password"
          className="form-control"
          id="loginPassword"
          placeholder="Password"
          value={passVal}
          onChange={(e) => { setPassVal(e.target.value); setPassword(e.target.value); }}
        />
        <label htmlFor="loginPassword">Password</label>
      </div>

      <button
        type="submit"
        className="btn btn-primary"
        onClick={handleLogin}
        disabled={loading}
      >
        {loading ? 'Signing in...' : 'Sign in'}
      </button>

      <p>Not registered? <span onClick={() => setIsLoginBox(false)}>Register</span></p>
    </form>
  );
};

export default Login;
