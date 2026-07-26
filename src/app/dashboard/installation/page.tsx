import Link from "next/link";

export default function InstallationGuidePage() {
  return (
    <div className="card p-6 sm:p-8 border border-[#45c66d]/30 shadow-2xl">
      <div className="mb-8 border-b border-white/10 pb-6">
        <h1 className="text-3xl font-black text-white flex items-center gap-3">
          <span className="text-[#45c66d]">🛠️</span> Installation Guide
        </h1>
        <p className="muted mt-3 text-sm leading-6">
          Follow these simple steps to install the Orbit Studio extension using the AEScripts ZXP Installer. 
          Make sure you have downloaded your .zxp file from the <Link href="/dashboard" className="text-[#45c66d] hover:underline">Overview</Link> tab first.
        </p>
      </div>

      <div className="space-y-6">
        <div className="rounded-xl border border-white/10 bg-black/20 p-5 sm:p-6 transition-colors hover:border-white/20">
          <div className="flex gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#45c66d]/20 text-[#45c66d] text-lg font-black">
              1
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Download the ZXP Installer</h3>
              <p className="muted mt-2 text-sm leading-6">
                You need a tool to install ZXP extension files. We recommend the official AEScripts installer. 
                <br /><br />
                <a href="https://aescripts.com/learn/zxp-installer/" target="_blank" rel="noreferrer" className="btn-secondary inline-flex items-center gap-2 px-4 py-2 text-xs hover:border-[#45c66d] hover:text-[#45c66d] mt-2">
                  Download AEScripts ZXP Installer ↗
                </a>
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-black/20 p-5 sm:p-6 transition-colors hover:border-white/20">
          <div className="flex gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#45c66d]/20 text-[#45c66d] text-lg font-black">
              2
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Get your Extension File</h3>
              <p className="muted mt-2 text-sm leading-6">
                If you haven't already, go to the <Link href="/dashboard" className="text-[#45c66d] hover:underline font-bold">Overview</Link> tab and click the download button for your Orbit Studio extension. It will save as a <code>.zxp</code> file on your computer.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-black/20 p-5 sm:p-6 transition-colors hover:border-white/20">
          <div className="flex gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#45c66d]/20 text-[#45c66d] text-lg font-black">
              3
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Install via Drag & Drop</h3>
              <p className="muted mt-2 text-sm leading-6">
                Open the ZXP Installer program you downloaded in step 1. Simply drag your <code>.zxp</code> file and drop it into the installer window.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-black/20 p-5 sm:p-6 transition-colors hover:border-white/20">
          <div className="flex gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#45c66d]/20 text-[#45c66d] text-lg font-black">
              4
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Open in Adobe Host App</h3>
              <p className="muted mt-2 text-sm leading-6">
                Restart your Adobe software (After Effects or Premiere Pro). Once opened, navigate to the top menu and click on:
                <br /><br />
                <strong className="text-white bg-white/10 px-2 py-1 rounded">Window</strong> &gt; <strong className="text-white bg-white/10 px-2 py-1 rounded">Extensions</strong> &gt; <strong className="text-[#45c66d] bg-[#45c66d]/10 px-2 py-1 rounded">Orbit Studio</strong>
                <br /><br />
                Paste your licence key when prompted and enjoy!
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
