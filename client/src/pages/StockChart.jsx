import React, { useEffect, useState } from 'react'
import '../styles/StockChart.css'
import Chart from 'react-apexcharts'
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom'
import axiosInstance from '../components/axiosInstance';
import toast from 'react-hot-toast';

const RAPIDAPI_KEY = '947b801f92msh96b919932628932p1a1413jsncb9cc7188719';
const RAPIDAPI_HOST = 'twelve-data1.p.rapidapi.com';
const headers = {
  'X-RapidAPI-Key': RAPIDAPI_KEY,
  'X-RapidAPI-Host': RAPIDAPI_HOST,
};

const StockChart = () => {
  const [stockAction, setStockAction] = useState('buy');
  const { id } = useParams();
  const navigate = useNavigate();

  const [stockValues,   setStockValues]   = useState([]);
  const [stockPrice,    setStockPrice]    = useState(0);
  const [stockExchange, setStockExchange] = useState('');
  const [stockName,     setStockName]     = useState('');
  const [loading,       setLoading]       = useState(false);
  const [priceLoaded,   setPriceLoaded]   = useState(false);

  const [buyQuantity,  setBuyQuantity]  = useState(1);
  const [buyType,      setBuyType]      = useState('Intraday');
  const [sellQuantity, setSellQuantity] = useState(1);
  const [sellType,     setSellType]     = useState('Intraday');

  const userId  = localStorage.getItem('userId');
  const balance = parseFloat(localStorage.getItem('balance') || '0');

  // ── Fetch helpers ──────────────────────────────────────────────────────────
  const fetchPrice = async () => {
    try {
      const res = await axios.get(`https://${RAPIDAPI_HOST}/price`, {
        params: { symbol: id, format: 'json' },
        headers,
      });
      const p = parseFloat(res.data.price);
      setStockPrice(p);
      setPriceLoaded(true);
    } catch (err) {
      console.error('Price fetch error:', err);
      toast.error('⚠️ Could not fetch live price. Please refresh.');
    }
  };

  const fetchStockData = async () => {
    try {
      const res = await axios.get(`https://${RAPIDAPI_HOST}/time_series`, {
        params: { symbol: id, interval: '1min', outputsize: '100', format: 'json' },
        headers,
      });
      setStockExchange(res.data.meta?.exchange || '');
      setStockName(res.data.meta?.symbol || id);
      const transformed = res.data.values.map((v) => ({
        x: new Date(v.datetime).getTime(),
        y: [parseFloat(v.open), parseFloat(v.high), parseFloat(v.low), parseFloat(v.close)],
      }));
      setStockValues(transformed);
    } catch (err) {
      console.error('Chart data error:', err);
    }
  };

  const getStockName = async () => {
    if (stockName) return stockName;
    try {
      const res = await axios.get(`https://${RAPIDAPI_HOST}/symbol_search`, {
        params: { symbol: id, outputsize: '1' },
        headers,
      });
      const name = res.data.data[0]?.instrument_name || id;
      setStockName(name);
      return name;
    } catch {
      return id;
    }
  };

  useEffect(() => {
    fetchStockData();
    fetchPrice();
  }, []);

  // ── Computed values ────────────────────────────────────────────────────────
  const buyQty    = parseInt(buyQuantity)  || 0;
  const sellQty   = parseInt(sellQuantity) || 0;
  const buyTotal  = parseFloat((stockPrice * buyQty).toFixed(2));
  const sellTotal = parseFloat((stockPrice * sellQty).toFixed(2));

  // ── Validation helpers ─────────────────────────────────────────────────────
  const validateBuy = () => {
    if (!priceLoaded || stockPrice <= 0) {
      toast.error('⏳ Stock price is still loading. Please wait a moment and try again.');
      return false;
    }
    if (!buyQty || buyQty <= 0) {
      toast.error('❌ Please enter a valid quantity (minimum 1 share).');
      return false;
    }
    if (balance <= 0) {
      toast.error(
        `❌ Your trading balance is ₹0. Please add funds from Profile → Add Funds before buying stocks.`
      );
      return false;
    }
    if (buyTotal > balance) {
      const canAfford = Math.floor(balance / stockPrice);
      if (canAfford === 0) {
        toast.error(
          `❌ Insufficient balance!\n\nCost of ${buyQty} share(s): ₹${buyTotal}\nYour balance: ₹${balance}\n\nYou cannot afford even 1 share at ₹${stockPrice}. Please add funds.`,
          { duration: 5000 }
        );
      } else {
        toast.error(
          `❌ Insufficient balance!\n\nCost of ${buyQty} share(s): ₹${buyTotal}\nYour balance: ₹${balance}\nShortfall: ₹${(buyTotal - balance).toFixed(2)}\n\nYou can afford up to ${canAfford} share(s) at current price.`,
          { duration: 6000 }
        );
      }
      return false;
    }
    return true;
  };

  const validateSell = () => {
    if (!priceLoaded || stockPrice <= 0) {
      toast.error('⏳ Stock price is still loading. Please wait a moment and try again.');
      return false;
    }
    if (!sellQty || sellQty <= 0) {
      toast.error('❌ Please enter a valid quantity (minimum 1 share).');
      return false;
    }
    return true;
  };

  // ── Buy ────────────────────────────────────────────────────────────────────
  const buyStock = async (e) => {
    e.preventDefault();
    if (!validateBuy()) return;

    setLoading(true);
    try {
      const name = await getStockName();
      await axiosInstance.post('/buyStock', {
        user: userId,
        symbol: id,
        name,
        stockType: buyType,
        stockExchange,
        price: stockPrice,
        count: buyQty,
        totalPrice: buyTotal,
      });
      // Update local balance immediately
      const newBalance = parseFloat((balance - buyTotal).toFixed(2));
      localStorage.setItem('balance', newBalance);
      toast.success(
        `✅ Successfully bought ${buyQty} share(s) of ${id}!\n\nTotal paid: ₹${buyTotal}\nRemaining balance: ₹${newBalance}`,
        { duration: 5000 }
      );
      setBuyQuantity(1);
      setTimeout(() => navigate('/history'), 1500);
    } catch (err) {
      const msg = err.response?.data?.message || 'Buy failed';
      if (msg.toLowerCase().includes('insufficient') || msg.toLowerCase().includes('balance')) {
        toast.error(`❌ Insufficient balance! Please add funds from your Profile page.`, { duration: 5000 });
      } else if (msg.toLowerCase().includes('user not found')) {
        toast.error('❌ User not found. Please log out and log in again.');
      } else {
        toast.error(`❌ Buy failed: ${msg}`);
      }
      console.error('buyStock error:', err.response?.data || err);
    } finally {
      setLoading(false);
    }
  };

  // ── Sell ───────────────────────────────────────────────────────────────────
  const sellStock = async (e) => {
    e.preventDefault();
    if (!validateSell()) return;

    setLoading(true);
    try {
      const name = await getStockName();
      await axiosInstance.post('/sellStock', {
        user: userId,
        symbol: id,
        name,
        stockType: sellType,
        price: stockPrice,
        count: sellQty,
        totalPrice: sellTotal,
      });
      const newBalance = parseFloat((balance + sellTotal).toFixed(2));
      localStorage.setItem('balance', newBalance);
      toast.success(
        `✅ Successfully sold ${sellQty} share(s) of ${id}!\n\nTotal received: ₹${sellTotal}\nNew balance: ₹${newBalance}`,
        { duration: 5000 }
      );
      setSellQuantity(1);
      setTimeout(() => navigate('/history'), 1500);
    } catch (err) {
      const msg = err.response?.data?.message || 'Sell failed';
      if (msg.toLowerCase().includes('no stock') || msg.toLowerCase().includes('not found')) {
        toast.error(
          `❌ You don't own any ${id} shares!\n\nYou must first buy ${id} shares before selling them.`,
          { duration: 5000 }
        );
      } else if (msg.toLowerCase().includes('cannot sell more') || msg.toLowerCase().includes('exceed')) {
        toast.error(
          `❌ Cannot sell ${sellQty} shares!\n\nYou don't have that many ${id} shares in your portfolio. Check Portfolio page to see how many you own.`,
          { duration: 5000 }
        );
      } else {
        toast.error(`❌ Sell failed: ${msg}`);
      }
      console.error('sellStock error:', err.response?.data || err);
    } finally {
      setLoading(false);
    }
  };

  // ── Chart config ───────────────────────────────────────────────────────────
  const series = [{ data: stockValues }];
  const chartOptions = {
    chart: { type: 'candlestick', height: 350, toolbar: { show: true } },
    title: { text: `${id}  ${stockExchange ? '· ' + stockExchange : ''}`, align: 'left' },
    xaxis: { type: 'datetime' },
    yaxis: { tooltip: { enabled: true } },
  };

  return (
    <div className="stockPage">
      <div className="stockChart">
        <Chart options={chartOptions} series={series} type="candlestick" height="100%" />
      </div>

      <div className="stockChartActions">
        <div className="stockChartActions-head">
          <button
            className={stockAction === 'buy' ? 'button-active' : 'button-inactive'}
            onClick={() => setStockAction('buy')}
          >
            Buy {priceLoaded ? `@ ₹${stockPrice}` : '(loading...)'}
          </button>
          <button
            className={stockAction === 'sell' ? 'button-active' : 'button-inactive'}
            onClick={() => setStockAction('sell')}
          >
            Sell {priceLoaded ? `@ ₹${stockPrice}` : '(loading...)'}
          </button>
        </div>

        {/* Live balance display */}
        <div style={{
          background: '#eaf4fb', borderRadius: '8px', padding: '8px 14px',
          margin: '8px 0', fontSize: '13px', color: '#1b4f72', fontWeight: '600'
        }}>
          💰 Available Balance: ₹{balance}
        </div>

        <div className="stockChartActions-body">
          {stockAction === 'buy' ? (
            <form>
              <div className="mb-3">
                <label className="form-label">Product type</label>
                <select className="form-select" onChange={(e) => setBuyType(e.target.value)} value={buyType}>
                  <option value="Intraday">Intraday</option>
                  <option value="Delivery">Delivery</option>
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label">Quantity</label>
                <input
                  type="number" min="1" className="form-control"
                  onChange={(e) => setBuyQuantity(e.target.value)}
                  value={buyQuantity}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Total Cost</label>
                <input type="number" className="form-control" disabled value={buyTotal} />
                {/* Inline warning if balance not enough */}
                {priceLoaded && buyQty > 0 && buyTotal > balance && (
                  <small style={{ color: '#e74c3c', marginTop: '4px', display: 'block' }}>
                    ⚠️ Insufficient! Need ₹{buyTotal}, you have ₹{balance}
                  </small>
                )}
                {priceLoaded && buyQty > 0 && buyTotal <= balance && (
                  <small style={{ color: '#1e8449', marginTop: '4px', display: 'block' }}>
                    ✓ Balance sufficient (₹{(balance - buyTotal).toFixed(2)} remaining after purchase)
                  </small>
                )}
              </div>
              <button
                className="btn btn-success"
                onClick={buyStock}
                disabled={loading || !priceLoaded}
              >
                {loading ? 'Processing...' : 'Buy Now'}
              </button>
            </form>
          ) : (
            <form>
              <div className="mb-3">
                <label className="form-label">Product type</label>
                <select className="form-select" onChange={(e) => setSellType(e.target.value)} value={sellType}>
                  <option value="Intraday">Intraday</option>
                  <option value="Delivery">Delivery</option>
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label">Quantity</label>
                <input
                  type="number" min="1" className="form-control"
                  onChange={(e) => setSellQuantity(e.target.value)}
                  value={sellQuantity}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">You will receive</label>
                <input type="number" className="form-control" disabled value={sellTotal} />
                {priceLoaded && sellQty > 0 && (
                  <small style={{ color: '#1e8449', marginTop: '4px', display: 'block' }}>
                    ✓ ₹{sellTotal} will be added to your balance
                  </small>
                )}
              </div>
              <button
                className="btn btn-danger"
                onClick={sellStock}
                disabled={loading || !priceLoaded}
              >
                {loading ? 'Processing...' : 'Sell Now'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default StockChart;
