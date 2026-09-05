const fs=require('fs');
const file='src/components/DashboardView.tsx';
let old=fs.readFileSync(file,'utf8');
const start=old.indexOf('          {/* TAB 1: MY LICENSES */}');
const end=old.indexOf('      {/* ── Bottom Section:');
let content=old.slice(start,end).replace(/        <\/div>\s*<\/div>\s*$/,'');
content=content.replace('Cloudflare R2 high-speed download bundles tied to your active license.','Download the bonus packs included with your active license.');
content=content.replace('Click the green Orbit Studio (.zxp) or Orbit Premiere (.zxp) button above.','Open My licenses, then download Orbit Studio (.zxp) or Orbit Premiere (.zxp).');
content=content.replace('className="flex items-center justify-between"','className="flex flex-wrap items-center justify-between gap-4"');
content=content.replace('Install Orbit Studio or Orbit Premiere in under 60 seconds using any ZXP installer.','Follow these steps to install Orbit Studio or Orbit Premiere with a ZXP installer.');
content=content.replace('<span>▶ Video Tutorials</span>','<span>Video tutorials</span>');
content=content.replace('              <div className="flex flex-wrap items-center gap-3 pt-2">','              <div className="flex flex-wrap items-center gap-3 pt-2"><Link href="/dashboard/support" className="btn-primary">Contact support</Link>');
content=content.replace(/<span(?: className="text-xl")?>[🎁🎬🎵🔑🛠️💬]+<\/span>/gu,'');
const prefix=old.slice(0,old.indexOf('  return (')).replace('import { useState }','import { useState, useTransition }').replace('const [refreshing, setRefreshing] = useState(false);','const [refreshing, startRefresh] = useTransition();');
const updatedPrefix=prefix.replace(/  async function handleRefresh\(\) \{[\s\S]*?\n  \}/,'  function handleRefresh() {\n    startRefresh(() => router.refresh());\n  }');
const body=`  const tabs = [
    ["licenses", "My licenses"], ["assets", "Bonus assets"], ["redeem", "Redeem key"],
    ["install", "Installation"], ["support", "Support"],
  ] as const;
  return (
    <div className="account-dashboard">
      {verified && <div role="status" className="account-notice">Email confirmed. Your account is ready to use.</div>}
      <header className="account-header">
        <div className="account-identity">
          <span className="account-avatar" aria-hidden="true">{avatarInitial}</span>
          <div><p className="account-eyebrow">YOUR ORBIT WORKSPACE</p><h1>Welcome, {formattedName}</h1><p className="account-email">{user.email}</p></div>
        </div>
        <div className="account-header-actions">
          <span className="account-status">{activeCount > 0 ? activeCount + " active license" + (activeCount === 1 ? "" : "s") : "No active licenses"}</span>
          <button onClick={handleRefresh} disabled={refreshing} aria-busy={refreshing}>{refreshing ? "Refreshing…" : "Refresh"}</button>
          <button onClick={handleSignOut}>Sign out</button>
        </div>
      </header>
      <div className="account-heading"><div><h2>Your licenses & downloads</h2><p>Download your extensions, copy your key and manage your devices.</p></div><Link href="/pricing">Browse products ↗</Link></div>
      <nav className="account-tabs" aria-label="Account sections">
        {tabs.map(([id, label]) => <button key={id} id={"account-tab-" + id} aria-current={activeTab === id ? "page" : undefined} aria-controls="account-content" onClick={() => setActiveTab(id)}>{label}{id === "licenses" && <span>{licenses.length}</span>}</button>)}
      </nav>
      <section id="account-content" aria-labelledby={"account-tab-" + activeTab} aria-busy={refreshing} className="account-content">
${content}
      </section>
      {isLegacyUser && <aside className="account-upgrade"><div><strong>Ready for the full Orbit suite?</strong><p>Explore Orbit Studio and Orbit Premiere license options.</p></div><Link href="/pricing">Compare plans ↗</Link></aside>}
    </div>
  );
}
export default DashboardView;
`;
fs.writeFileSync(file,updatedPrefix+body);
let card=fs.readFileSync('src/components/LicenseCard.tsx','utf8');
card=card.replace('onClick={() => {\n            navigator.clipboard.writeText(license.key);\n            setCopied(true);\n            setTimeout(() => setCopied(false), 1800);\n          }}','onClick={async () => {\n            setCopied(false);\n            try {\n              await navigator.clipboard.writeText(license.key);\n              setCopied(true);\n              setTimeout(() => setCopied(false), 1800);\n            } catch {\n              setNote({ kind: "err", text: "Could not copy the key. Select the key and copy it manually." });\n            }\n          }}');
// Normalize line endings first so the replacement also handles Windows sources.
if(card.includes('navigator.clipboard.writeText(license.key);')&&!card.includes('await navigator.clipboard')){
 card=card.replace(/onClick=\{\(\) => \{\s*navigator.clipboard.writeText\(license.key\);\s*setCopied\(true\);\s*setTimeout\(\(\) => setCopied\(false\), 1800\);\s*\}\}/,'onClick={async () => {\n            setCopied(false);\n            try {\n              await navigator.clipboard.writeText(license.key);\n              setCopied(true);\n              setTimeout(() => setCopied(false), 1800);\n            } catch {\n              setNote({ kind: "err", text: "Could not copy the key. Select the key and copy it manually." });\n            }\n          }}');
}
card=card.replace('text-[#45c66d] truncate','text-[#45c66d] break-all select-all');
card=card.replace('{note && (\n        <div','{note && (\n        <div role="status" aria-live="polite"');
card=card.replace('Device Bindings:', 'Devices:').replace('AE &amp; PR Shared Slot','Shared by AE &amp; PR');
fs.writeFileSync('src/components/LicenseCard.tsx',card);
let layout=fs.readFileSync('src/app/layout.tsx','utf8');
layout=layout.replace('import "./studio-landing.css";','import "./studio-landing.css";\nimport "./dashboard.css";');fs.writeFileSync('src/app/layout.tsx',layout);

