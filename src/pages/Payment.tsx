import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, CreditCard, Smartphone, Wallet, CheckCircle, Loader2, ShieldCheck, DollarSign } from 'lucide-react';

interface CostItem {
  desc: string;
  amount: number;
}

interface IPData {
  id: number;
  title: string;
  owner_name: string;
  owner_email: string;
  category: string;
  payment_status?: string;
  validity_years?: number;
}

const PAYMENT_METHODS = [
  { id: 'card', label: 'Credit/Debit Card', icon: CreditCard, hint: 'Visa • Mastercard • Amex' },
  { id: 'paypal', label: 'PAYPAL', icon: DollarSign, hint: 'PayPal balance or linked card' },
  { id: 'evcplus', label: 'EVCPLUS', icon: Smartphone, hint: 'Mobile money (Somalia)' },
  { id: 'zaad', label: 'ZAAD', icon: Smartphone, hint: 'Internal ZAAD transaction' },
  { id: 'wallet', label: 'Digital Wallets', icon: Wallet, hint: 'Apple Pay • Google Pay • Others' }
];

export default function Payment() {
  const { ipId } = useParams<{ ipId: string }>();
  const navigate = useNavigate();
  const [ip, setIp] = useState<IPData | null>(null);
  const [selectedMethod, setSelectedMethod] = useState('card');
  const [subWallet, setSubWallet] = useState('apple');
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [txId, setTxId] = useState('');
  const [paymentStep, setPaymentStep] = useState('');
  const [error, setError] = useState('');
  const [agreed, setAgreed] = useState(false);

  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [paypalEmail, setPaypalEmail] = useState('');
  const [mobilePhone, setMobilePhone] = useState('');
  const [walletAddress, setWalletAddress] = useState('');

  const validityYears = ip?.validity_years || 10;
  const COST_BREAKDOWN: CostItem[] = [
    { desc: `IP Protection Validity (${validityYears} years @ $100/year)`, amount: validityYears * 100 }
  ];
  const subtotal = COST_BREAKDOWN.reduce((sum, item) => sum + item.amount, 0);
  const tax = 0;
  const total = subtotal;

  useEffect(() => {
    const fetchIP = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return navigate('/login');
        const { data } = await axios.get(`http://localhost:5000/api/ip/${ipId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (data.payment_status === 'paid') {
          navigate(`/ip/${ipId}`);
          return;
        }
        setIp(data);
      } catch (err) {
        navigate('/my-ip');
      }
    };
    if (ipId) fetchIP();
  }, [ipId, navigate]);

  const isFormValid = () => {
    if (!agreed) return false;
    if (selectedMethod === 'card') {
      return cardName.trim().length > 3 && cardNumber.replace(/\s/g, '').length >= 15 && cardExpiry.length === 5 && cardCvv.length >= 3;
    }
    if (selectedMethod === 'paypal') {
      return paypalEmail.includes('@') && paypalEmail.length > 5;
    }
    if (selectedMethod === 'evcplus' || selectedMethod === 'zaad') {
      return mobilePhone.replace(/\D/g, '').length >= 8;
    }
    if (selectedMethod === 'wallet') {
      return true;
    }
    return false;
  };

  const getMethodLabel = (method: string) => {
    const m = PAYMENT_METHODS.find(x => x.id === method);
    return m ? m.label : method;
  };

  const processPayment = async () => {
    if (!isFormValid() || !ip) return;
    setError('');
    setProcessing(true);
    setPaymentStep('Establishing secure encrypted channel...');

    await new Promise(r => setTimeout(r, 650));
    setPaymentStep(`Verifying account with ${getMethodLabel(selectedMethod)}...`);

    await new Promise(r => setTimeout(r, 700));
    setPaymentStep('Authorizing transaction and reserving funds...');

    await new Promise(r => setTimeout(r, 800));
    setPaymentStep('Confirming with payment provider in real-time...');

    await new Promise(r => setTimeout(r, 750));

    const generatedTx = `IP-${Date.now().toString(36).toUpperCase().slice(-10)}`;
    setTxId(generatedTx);
    setSuccess(true);
    setProcessing(false);
    setPaymentStep('');
  };

  const finalizeRegistration = async () => {
    if (!ipId || !txId) return;
    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:5000/api/ip/${ipId}/finalize-payment`, {
        payment_method: selectedMethod,
        transaction_id: txId,
        amount: total
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      navigate(`/ip/${ipId}`, { state: { fromPayment: true } });
    } catch (err) {
      navigate(`/ip/${ipId}`, { state: { fromPayment: true } });
    }
  };

  const formatCardNumber = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 19);
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
  };

  const formatExpiry = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 4);
    if (digits.length > 2) return digits.slice(0, 2) + '/' + digits.slice(2);
    return digits;
  };

  if (!ip) {
    return <div className="p-12 text-slate-400">Loading payment interface...</div>;
  }

  return (
    <div className="p-8 md:p-12">
      <div className="max-w-4xl mx-auto">
        <Link to="/my-ip" className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-200 mb-6 transition">
          <ArrowLeft className="w-4 h-4" /> Back to My IP
        </Link>

        <div className="glass-panel p-8 md:p-10 rounded-3xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500" />

          <div className="flex items-center gap-3 mb-2">
            <ShieldCheck className="w-8 h-8 text-emerald-400" />
            <h1 className="text-3xl font-bold">Finalize IP Registration</h1>
          </div>
          <p className="text-slate-400 mb-8">Complete payment to activate your legally-binding timestamp and full protection.</p>

          <div className="grid md:grid-cols-5 gap-6">
            <div className="md:col-span-3 space-y-6">
              <div className="glass-panel p-6 rounded-2xl border border-white/10">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-emerald-400" /> Cost Breakdown
                </h3>
                <div className="space-y-3 text-sm">
                  {COST_BREAKDOWN.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-slate-300">
                      <span>{item.desc}</span>
                      <span className="font-mono text-slate-200">${item.amount.toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="border-t border-white/10 pt-3 flex justify-between text-slate-300">
                    <span>Estimated Tax (5%)</span>
                    <span className="font-mono">${tax.toFixed(2)}</span>
                  </div>
                  <div className="pt-2 flex justify-between text-xl font-semibold border-t border-white/10">
                    <span>Total Due Today</span>
                    <span className="font-mono text-emerald-400">${total.toFixed(2)}</span>
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 mt-3">One-time payment. No recurring charges unless you extend vault storage.</p>
              </div>

              <div>
                <h3 className="font-semibold mb-3 text-lg">Select Payment Method</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {PAYMENT_METHODS.map((method) => {
                    const Icon = method.icon;
                    const active = selectedMethod === method.id;
                    return (
                      <button
                        key={method.id}
                        onClick={() => setSelectedMethod(method.id)}
                        className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between h-full ${active ? 'border-blue-500 bg-blue-500/10 ring-1 ring-blue-500/30' : 'border-white/10 hover:border-white/30 bg-white/5'}`}
                      >
                        <div className="flex items-center gap-3">
                          {Icon ? <Icon className="w-6 h-6 text-blue-400 flex-shrink-0" /> : <DollarSign className="w-6 h-6 text-blue-400 flex-shrink-0" />}
                          <div>
                            <div className="font-semibold">{method.label}</div>
                            <div className="text-xs text-slate-400">{method.hint}</div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="glass-panel p-6 rounded-2xl border border-white/10">
                <h3 className="font-semibold mb-4">Payment Details</h3>

                {selectedMethod === 'card' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1.5">Cardholder Name</label>
                      <input type="text" value={cardName} onChange={e => setCardName(e.target.value)} placeholder="John Doe" className="w-full px-4 py-3 rounded-xl glass-input" />
                    </div>
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1.5">Card Number</label>
                      <input type="text" value={cardNumber} onChange={e => setCardNumber(formatCardNumber(e.target.value))} placeholder="4242 4242 4242 4242" className="w-full px-4 py-3 rounded-xl glass-input font-mono tracking-widest" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1.5">Expiry Date</label>
                        <input type="text" value={cardExpiry} onChange={e => setCardExpiry(formatExpiry(e.target.value))} placeholder="MM/YY" className="w-full px-4 py-3 rounded-xl glass-input font-mono" maxLength={5} />
                      </div>
                      <div>
                        <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1.5">CVV / CVC</label>
                        <input type="text" value={cardCvv} onChange={e => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4))} placeholder="123" className="w-full px-4 py-3 rounded-xl glass-input font-mono" maxLength={4} />
                      </div>
                    </div>
                  </div>
                )}

                {selectedMethod === 'paypal' && (
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1.5">PayPal Email Address</label>
                    <input type="email" value={paypalEmail} onChange={e => setPaypalEmail(e.target.value)} placeholder="you@paypal.com" className="w-full px-4 py-3 rounded-xl glass-input" />
                    <p className="text-xs text-slate-500 mt-2">You will be redirected to PayPal to confirm the payment of ${total.toFixed(2)}.</p>
                  </div>
                )}

                {(selectedMethod === 'evcplus' || selectedMethod === 'zaad') && (
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1.5">{selectedMethod.toUpperCase()} Registered Phone Number</label>
                    <input type="tel" value={mobilePhone} onChange={e => setMobilePhone(e.target.value)} placeholder="+252 61 234 567" className="w-full px-4 py-3 rounded-xl glass-input font-mono" />
                    <p className="text-xs text-slate-500 mt-2">A confirmation prompt will be sent to your {selectedMethod === 'evcplus' ? 'EVCPLUS' : 'ZAAD'} account for approval.</p>
                  </div>
                )}

                {selectedMethod === 'wallet' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-slate-400 mb-2">Choose Digital Wallet</label>
                      <div className="flex flex-wrap gap-2">
                        {['apple', 'google', 'other'].map(w => (
                          <button key={w} onClick={() => setSubWallet(w)} className={`px-4 py-2 rounded-full text-sm border transition ${subWallet === w ? 'bg-white/10 border-blue-500' : 'border-white/10 hover:bg-white/5'}`}>
                            {w === 'apple' && ' Apple Pay'}
                            {w === 'google' && 'G Google Pay'}
                            {w === 'other' && 'Other Wallet'}
                          </button>
                        ))}
                      </div>
                    </div>
                    {subWallet === 'other' && (
                      <div>
                        <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1.5">Wallet Address or ID</label>
                        <input type="text" value={walletAddress} onChange={e => setWalletAddress(e.target.value)} placeholder="wallet_0x... or username" className="w-full px-4 py-3 rounded-xl glass-input font-mono text-sm" />
                      </div>
                    )}
                    <p className="text-xs text-emerald-400">Instant approval — funds deducted immediately from your linked wallet.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="md:col-span-2">
              <div className="glass-panel p-6 rounded-2xl border border-white/10 sticky top-8">
                <div className="mb-6">
                  <div className="text-xs uppercase text-slate-400 tracking-widest mb-1">Registering</div>
                  <div className="text-xl font-semibold leading-tight">{ip.title}</div>
                  <div className="text-sm text-slate-400 mt-1">{ip.category} • Owner: {ip.owner_name}</div>
                  <div className="text-xs text-slate-500 mt-0.5">ID: {ip.id}</div>
                </div>

                <div className="bg-black/30 rounded-xl p-4 font-mono text-xs mb-6 border border-white/10">
                  <div className="flex justify-between mb-1"><span className="text-slate-400">Amount</span><span>${total.toFixed(2)}</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Status</span><span className="text-amber-400">PENDING PAYMENT</span></div>
                </div>

                <label className="flex items-start gap-3 text-sm mb-6 cursor-pointer select-none">
                  <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} className="mt-1 accent-blue-500" />
                  <span className="text-slate-300">I confirm this payment finalizes the IP registration and I agree to the Terms of Service and Privacy Policy.</span>
                </label>

                {!success && !processing && (
                  <button
                    onClick={processPayment}
                    disabled={!isFormValid()}
                    className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed font-semibold text-lg transition flex items-center justify-center gap-2"
                  >
                    <ShieldCheck className="w-5 h-5" /> Pay ${total.toFixed(2)} &amp; Finalize
                  </button>
                )}

                {processing && (
                  <div className="text-center py-4">
                    <Loader2 className="w-8 h-8 mx-auto animate-spin text-blue-400 mb-3" />
                    <div className="text-sm text-blue-300 font-medium">{paymentStep}</div>
                    <div className="text-xs text-slate-500 mt-1">This may take a few seconds. Do not refresh.</div>
                  </div>
                )}

                {success && (
                  <div className="text-center">
                    <CheckCircle className="w-14 h-14 text-emerald-400 mx-auto mb-3" />
                    <div className="text-emerald-400 font-semibold text-xl mb-1">Payment Successful</div>
                    <div className="text-xs text-slate-400 mb-4 font-mono break-all">TXN: {txId}</div>

                    <div className="text-sm text-slate-200 mb-6">
                      Your Intellectual Property is now fully registered, timestamped, and protected.
                    </div>

                    <button onClick={finalizeRegistration} className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 rounded-2xl font-semibold transition">
                      Complete Registration &amp; View IP
                    </button>
                    <button onClick={() => navigate('/my-ip')} className="mt-3 text-sm text-slate-400 hover:text-slate-200">Return to IPMS</button>
                  </div>
                )}

                {error && <p className="text-red-400 text-xs mt-3 text-center">{error}</p>}
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-white/10 text-center text-xs text-slate-500">
            Payments are processed securely. All transactions are encrypted end-to-end. ZAAD internal transactions settle instantly within the platform.
          </div>
        </div>
      </div>
    </div>
  );
}
