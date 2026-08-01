"use client";

export function PaymentMethodsSection() {
  const globalWallets = [
    {
      name: "PayPal",
      badge: "Global Wallet",
      bg: "bg-[#003087]/20 border-[#003087]/50 text-white",
      icon: (
        <svg width="18" height="20" viewBox="0 0 24 28" fill="none">
          <path d="M19.3 4.2C18.4 3 16.7 2.4 14.3 2.4H6.8C6.1 2.4 5.5 2.9 5.4 3.6L2.1 24.3C2 24.8 2.4 25.3 2.9 25.3H7.5C8.1 25.3 8.6 24.8 8.7 24.2L9.7 18.2C9.8 17.6 10.3 17.1 10.9 17.1H13.6C17.7 17.1 20.9 15.4 21.8 10.6C22.2 8.4 21.5 6.2 19.3 4.2Z" fill="#003087"/>
          <path d="M21.8 10.6C20.9 15.4 17.7 17.1 13.6 17.1H10.9C10.3 17.1 9.8 17.6 9.7 18.2L8.7 24.2L7.9 29.2C7.8 29.7 8.2 30.1 8.7 30.1H12.6C13.2 30.1 13.7 29.6 13.8 29L14.7 23.4C14.8 22.8 15.3 22.3 15.9 22.3H16.6C20.2 22.3 23 20.8 23.8 16.6C24.2 14.7 23.8 12.8 21.8 10.6Z" fill="#0079C1"/>
        </svg>
      ),
    },
    {
      name: "Google Pay",
      badge: "G Pay",
      bg: "bg-white/[0.04] border-white/10 text-white",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M23.7 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.6c-.3 1.5-1.1 2.8-2.4 3.7v3h3.9c2.3-2.1 3.6-5.2 3.6-8.9z"/>
          <path fill="#34A853" d="M12 24c3.2 0 6-1.1 8-3l-3.9-3c-1.1.7-2.5 1.2-4.1 1.2-3.2 0-5.8-2.1-6.8-5H1.2v3.1C3.3 21.4 7.4 24 12 24z"/>
          <path fill="#FBBC05" d="M5.2 14.2c-.3-.8-.4-1.7-.4-2.6s.1-1.8.4-2.6V5.9H1.2C.4 7.5 0 9.7 0 12s.4 4.5 1.2 6.1l4-3.9z"/>
          <path fill="#EA4335" d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4C18 1.2 15.2 0 12 0 7.4 0 3.3 2.6 1.2 6.9l4 3.1c1-2.9 3.6-5.2 6.8-5.2z"/>
        </svg>
      ),
    },
    {
      name: "Apple Pay",
      badge: "Apple Pay",
      bg: "bg-white/[0.04] border-white/10 text-white",
      icon: (
        <svg width="16" height="18" viewBox="0 0 384 512" fill="currentColor">
          <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"></path>
        </svg>
      ),
    },
    {
      name: "VISA",
      badge: "Credit & Debit",
      bg: "bg-blue-600/10 border-blue-500/30 text-blue-400 font-extrabold",
      icon: <span className="text-sm font-black italic tracking-tighter">VISA</span>,
    },
    {
      name: "Mastercard",
      badge: "Credit & Debit",
      bg: "bg-white/[0.04] border-white/10 text-white",
      icon: (
        <svg width="24" height="16" viewBox="0 0 24 16">
          <circle cx="7.5" cy="8" r="7.5" fill="#EB001B" />
          <circle cx="16.5" cy="8" r="7.5" fill="#F79E1B" fillOpacity="0.9" />
        </svg>
      ),
    },
    {
      name: "American Express",
      badge: "AMEX",
      bg: "bg-sky-500/10 border-sky-500/30 text-sky-400",
      icon: <span className="text-xs font-black tracking-widest">AMEX</span>,
    },
    {
      name: "Samsung Pay",
      badge: "Wallet",
      bg: "bg-blue-900/20 border-blue-700/40 text-blue-300",
      icon: <span className="text-xs font-black">SAMSUNG</span>,
    },
  ];

  const regionalMethods = [
    { name: "Pix", region: "Brazil 🇧🇷", bg: "border-[#32bcad]/40 bg-[#32bcad]/10 text-[#32bcad]", icon: "❖" },
    { name: "UPI", region: "India 🇮🇳", bg: "border-[#0f8a44]/40 bg-[#0f8a44]/10 text-[#45c66d]", icon: "⇄" },
    { name: "WeChat Pay", region: "China 🇨🇳", bg: "border-[#07c160]/40 bg-[#07c160]/10 text-[#07c160]", icon: "💬" },
    { name: "Kakao Pay", region: "South Korea 🇰🇷", bg: "border-[#ffeb00]/40 bg-[#ffeb00]/10 text-[#ffeb00]", icon: "🟡" },
    { name: "PAYCO", region: "South Korea 🇰🇷", bg: "border-[#fa2828]/40 bg-[#fa2828]/10 text-[#fa2828]", icon: "🔴" },
    { name: "SK Local Cards", region: "South Korea 🇰🇷", bg: "border-white/10 bg-white/[0.04] text-white", icon: "💳" },
    { name: "BLIK", region: "Poland 🇵🇱", bg: "border-white/20 bg-black/40 text-white", icon: "🔘" },
    { name: "MB WAY", region: "Portugal 🇵🇹", bg: "border-[#e30613]/40 bg-[#e30613]/10 text-red-400", icon: "🔴" },
    { name: "Bancontact", region: "Belgium 🇧🇪", bg: "border-[#004a98]/40 bg-[#004a98]/10 text-blue-400", icon: "🔷" },
  ];

  return (
    <section className="shell mt-16 border-t border-white/10 pt-14">
      <div className="text-center">
        <span className="badge badge-green">⚡ Instant Automated Checkout</span>
        <h2 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
          Accepted Payment Methods
        </h2>
        <p className="muted mx-auto mt-3 max-w-2xl text-sm sm:text-base">
          Pay seamlessly with your preferred local or international payment option. 
          All transactions are 100% encrypted & backed by Paddle Merchant Security.
        </p>
      </div>

      {/* Local Payment Methods — Bangladesh */}
      <div className="mt-10 rounded-2xl border border-[#45c66d]/30 bg-[#45c66d]/[0.03] p-6 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div>
            <span className="text-xs font-black uppercase tracking-widest text-[#45c66d]">
              🇧🇩 Bangladesh Instant Local Checkout
            </span>
            <p className="muted mt-1 text-xs">
              Instant license key issuance via bKash Merchant & Nagad
            </p>
          </div>
          <span className="badge badge-green font-bold">Auto Verification ⚡</span>
        </div>

        <div className="mt-5 flex flex-wrap gap-4">
          <div className="flex items-center gap-3 rounded-xl border border-[#e2136e]/40 bg-[#e2136e]/10 px-5 py-3 shadow-[0_0_20px_rgba(226,19,110,0.15)] transition-all hover:scale-[1.03]">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#e2136e] font-black text-white text-base shadow-md">
              ৳
            </div>
            <div>
              <p className="text-sm font-black text-white">bKash Merchant</p>
              <p className="text-[11px] font-semibold text-[#f8a3c7]">Auto & Manual Verification</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-[#ed1c24]/40 bg-[#ed1c24]/10 px-5 py-3 shadow-[0_0_20px_rgba(237,28,36,0.15)] transition-all hover:scale-[1.03]">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#ed1c24] font-black text-white text-base shadow-md">
              ৳
            </div>
            <div>
              <p className="text-sm font-black text-white">Nagad Instant</p>
              <p className="text-[11px] font-semibold text-[#fca5a7]">Local Instant Pay</p>
            </div>
          </div>
        </div>
      </div>

      {/* Global Payment Methods */}
      <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div>
            <span className="text-xs font-black uppercase tracking-widest text-[#45c66d]">
              🌐 Global Wallets & Cards (Paddle Merchant)
            </span>
            <p className="muted mt-1 text-xs">
              Instant USD payment processing for 100+ countries worldwide
            </p>
          </div>
          <span className="badge text-xs font-bold text-gray-300">256-Bit SSL Encrypted 🔒</span>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          {globalWallets.map((m) => (
            <div
              key={m.name}
              className={`flex items-center gap-2.5 rounded-xl border px-4 py-2.5 text-xs font-bold shadow-lg transition-all hover:scale-[1.04] ${m.bg}`}
            >
              {m.icon}
              <span>{m.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* International Regional Methods */}
      <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div>
            <span className="text-xs font-black uppercase tracking-widest text-[#aab0bd]">
              🌏 Regional Supported Payment Methods
            </span>
            <p className="muted mt-1 text-xs">
              Local currencies & payment systems supported natively at checkout
            </p>
          </div>
          <span className="badge text-[11px]">100% Tax & VAT Compliant</span>
        </div>

        <div className="mt-5 flex flex-wrap gap-2.5">
          {regionalMethods.map((m) => (
            <div
              key={m.name}
              className={`flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-bold shadow-sm transition-all hover:scale-[1.03] ${m.bg}`}
            >
              <span>{m.icon}</span>
              <span>{m.name}</span>
              <span className="text-[10px] opacity-75">({m.region})</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
