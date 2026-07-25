import Link from "next/link";

export default function NotFound() {
  return (
    <div className="shell grid min-h-[70vh] place-items-center py-16 text-center">
      <div className="max-w-[520px]">
        <p className="eyebrow">Error 404</p>
        <h1 className="mt-3 text-5xl font-black tracking-tight">
          This page drifted out of orbit.
        </h1>
        <p className="muted mt-4 leading-7">
          The link may be old, or the page may have moved. Here are the places
          most people are looking for.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/" className="btn-primary">
            Back to home
          </Link>
          <Link href="/dashboard" className="btn-secondary">
            My licenses
          </Link>
          <Link href="/pricing" className="btn-secondary">
            Pricing
          </Link>
        </div>
      </div>
    </div>
  );
}
