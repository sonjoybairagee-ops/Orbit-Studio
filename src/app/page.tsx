import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { HeroShowcase } from "@/components/HeroShowcase";
import { StoryGraphVisual } from "@/components/StoryGraphVisual";
import { LayerExploder3D } from "@/components/LayerExploder3D";

const WORKSPACES = [
  {
    no: "01",
    code: "TL",
    title: "Tools",
    copy: "Align, anchor, precomp, copy properties, create layers and clean timelines from one production surface.",
    items: ["9-point align + anchor", "Property clipboard", "Quick creation", "Timeline utilities"],
  },
  {
    no: "02",
    code: "ST",
    title: "Studio",
    copy: "Turn text into timed captions, import SRT files and construct shape animation systems without repetitive setup.",
    items: ["Word-by-word captions", "SRT timing", "Shape operators", "Line presets"],
  },
  {
    no: "03",
    code: "MO",
    title: "Motion",
    copy: "Go beyond utilities with Super Morph, visual curve controls, 3D camera rigs and showcase animation systems.",
    items: ["Super Morph", "Curve Lab", "Native 3D camera", "Showcase rigs"],
  },
  {
    no: "04",
    code: "CL",
    title: "Colors",
    copy: "Apply curated solids, product palettes, two-color gradients and four-color fusions directly to selected layers.",
    items: ["160+ solids", "SaaS palettes", "220 blends", "160 fusions"],
  },
  {
    no: "05",
    code: "TR",
    title: "Tracker",
    copy: "Keep project time, tasks and eye-break reminders inside the same panel as the work itself.",
    items: ["Automatic timer", "Weekly history", "Project to-do", "Break reminders"],
  },
  {
    no: "06",
    code: "CS",
    title: "Comp Saver",
    copy: "Snapshot active compositions, restore them instantly and organize your entire project panel with one click.",
    items: ["Comp snapshots", "Auto organize", "Quick restore", "Smart folders"],
  },
  {
    no: "07",
    code: "LB",
    title: "Library",
    copy: "Search, preview and insert MOGRTs, SFX, text animation and FFX presets without leaving Adobe.",
    items: ["MOGRT shelf", "SFX audition", "Text styles", "FFX library"],
  },
];

export default async function Home() {
  const supabase = await createClient();
  const { data: plans } = await supabase
    .from("plans")
    .select("id,slug,price,currency")
    .eq("is_public", true)
    .eq("is_active", true)
    .order("price", { ascending: true })
    .limit(1);

  const starter = plans?.[0];
  const price = "$2";
  const checkoutHref = starter ? `/checkout/${starter.id}` : "/pricing";

  return (
    <>
      <section className="home-hero">
        <div className="home-hero__grid" aria-hidden="true" />
        <div className="shell home-hero__inner">
          <div className="home-hero__copy">
            <div className="home-hero__kicker">
              <span><i /> Orbit Studio 2.3.1</span>
              <span>After Effects + Premiere Pro</span>
            </div>
            <h1>
              Your creative workflow,<br />
              <span className="text-gradient">inside one orbit.</span>
            </h1>
            <p>
              A compact control center for production tools, captions, motion,
              color, focus and assets—built to stay docked while you create.
            </p>
            <div className="home-hero__actions">
              <Link href={checkoutHref} className="btn-primary home-hero__primary">
                Get lifetime access · {price} <span>→</span>
              </Link>
              <a href="#product-tour" className="btn-secondary home-hero__secondary">
                Tour the real panel
              </a>
            </div>
            <div className="home-hero__trust">
              <span><b>7</b> focused workspaces</span>
              <span><b>60+</b> workflow actions</span>
              <span><b>1</b> key for both apps</span>
            </div>
          </div>
          <div id="product-tour" className="home-hero__demo scroll-mt-28">
            <HeroShowcase />
          </div>
        </div>
      </section>

      <section className="orbit-marquee" aria-label="Product capabilities">
        <div>
          <span>ALIGN + ANCHOR</span><i />
          <span>WORD CAPTIONS</span><i />
          <span>SUPER MORPH</span><i />
          <span>COLOR PLATES</span><i />
          <span>FOCUS TRACKER</span><i />
          <span>UNIVERSAL LIBRARY</span>
        </div>
      </section>

      <section id="features" className="shell workspace-section scroll-mt-24">
        <div className="section-heading section-heading--split">
          <div>
            <p className="eyebrow">Explore the control center</p>
            <h2>Six workspaces.<br />One consistent language.</h2>
          </div>
          <p>
            Orbit groups tools by the job you are doing—not by a long,
            searchable command list. Switch context without switching panels.
          </p>
        </div>

        <div className="workspace-grid">
          {WORKSPACES.map((item) => (
            <article className="workspace-card" key={item.title}>
              <div className="workspace-card__top">
                <span>{item.no}</span>
                <b>{item.code}</b>
              </div>
              <h3>{item.title}</h3>
              <p>{item.copy}</p>
              <ul>
                {item.items.map((feature) => <li key={feature}>{feature}</li>)}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="shell product-story">
        <div className="product-story__visual">
          <StoryGraphVisual />
          <div className="product-story__metric">
            <span>MO</span>
            <p><b>Visual Motion Graph Curve Lab.</b><small>Mouse-draggable Bezier handles & real-time cubic curve preview.</small></p>
          </div>
        </div>
        <div className="product-story__copy">
          <p className="eyebrow">Built around real editing friction</p>
          <h2>Less hunting.<br />More finishing.</h2>
          <p>
            The website now mirrors the extension architecture, so visitors
            understand where every capability lives—and how the workflow fits
            together—before they install anything.
          </p>
          <div className="product-story__list">
            {[
              ["01", "See the actual interface", "Every product view uses real Orbit screenshots—not generic mock controls."],
              ["02", "Understand the workflow", "Features are grouped by workspace and explained in the order editors use them."],
              ["03", "Buy one clear bundle", "After Effects and Premiere share one licence and one device seat."],
            ].map(([no, title, copy]) => (
              <div key={no}>
                <span>{no}</span>
                <p><b>{title}</b><small>{copy}</small></p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Unique 3D Layer Exploder Feature Section ── */}
      <section className="shell py-12">
        <LayerExploder3D />
      </section>

      <section className="shell bundle-section">
        <div className="bundle-section__copy">
          <p className="eyebrow">One Orbit bundle</p>
          <h2>Two Adobe hosts.<br />One activation.</h2>
          <p>
            Run Orbit in After Effects and Premiere Pro on the same computer
            without consuming two seats. Your licence follows the device.
          </p>
          <Link href="/pricing" className="btn-primary">Compare licence options <span>→</span></Link>
        </div>
        <div className="bundle-diagram">
          <div className="adobe-host-card">
            <span className="adobe-icon-badge ae-badge">Ae</span>
            <p><b>Orbit Studio</b><small>After Effects · Motion + creation</small></p>
          </div>
          <i className="adobe-plus-sign">+</i>
          <div className="adobe-host-card">
            <span className="adobe-icon-badge pr-badge">Pr</span>
            <p><b>Orbit Premiere</b><small>Premiere Pro · Editing workflow</small></p>
          </div>
          <strong>1 shared seat</strong>
        </div>
      </section>

      <section id="install" className="shell install-section scroll-mt-24">
        <div className="section-heading">
          <p className="eyebrow">From purchase to panel</p>
          <h2>Up and running in three steps.</h2>
        </div>
        <div className="install-grid">
          {[
            ["01", "Choose your licence", "Pick one or two device seats. Both new Orbit extensions are included."],
            ["02", "Download securely", "Sign in to your dashboard and download the latest private release."],
            ["03", "Activate the panel", "Paste your CX key once. Signed offline access keeps Orbit out of your way."],
          ].map(([no, title, copy]) => (
            <article key={no}>
              <span>{no}</span>
              <h3>{title}</h3>
              <p>{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="shell final-cta">
        <div className="final-cta__grid" aria-hidden="true" />
        <p className="eyebrow">Ready when your timeline is</p>
        <h2>Keep the tools close.<br /><span className="text-gradient">Keep the ideas moving.</span></h2>
        <p>Lifetime access starts at {price}. After Effects and Premiere Pro included.</p>
        <div>
          <Link href={checkoutHref} className="btn-primary">Get CompX Orbit <span>→</span></Link>
          <Link href="/pricing" className="btn-secondary">View pricing</Link>
        </div>
      </section>
    </>
  );
}
