"use client";
import { useEffect, useRef, useState } from "react";

/** The real extension UI, isolated from website styles and Adobe host scripts. */
export function FullExtensionDemo() {
  const container = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const node = container.current;
    if (!node) return;
    const observer = new ResizeObserver(([entry]) => setScale(Math.min(entry.contentRect.width / 680, 1)));
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return (
    <div className="full-extension-demo" ref={container}>
      <div className="full-extension-demo__chrome"><span>CompX Orbit Studio</span><span aria-hidden="true">≡</span></div>
      <div className="full-extension-demo__viewport" style={{ height: 800 * scale }}>
        <iframe title="Full Orbit Studio extension panel demo" src="/orbit-demo/index.html" sandbox="allow-scripts" style={{ width: 680, height: 800, transform: `scale(${scale})`, transformOrigin: "top left" }} />
      </div>
      <p className="full-extension-demo__note">Interactive UI preview · Adobe actions run inside the extension.</p>
    </div>
  );
}
