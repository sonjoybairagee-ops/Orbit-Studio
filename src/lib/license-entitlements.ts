type Product = { slug?: string; host_app?: string };

function planOf(license: {
  plans?: { plan_extensions?: Array<{ extensions?: Product | Product[] | null }> | null } | Array<{ plan_extensions?: Array<{ extensions?: Product | Product[] | null }> | null }> | null;
}) {
  const plans = license.plans;
  return Array.isArray(plans) ? plans[0] : plans;
}

function productsFromLicense(license: Parameters<typeof planOf>[0]): Product[] {
  return (planOf(license)?.plan_extensions ?? [])
    .flatMap((row) => {
      const value = row.extensions;
      return Array.isArray(value) ? value : value ? [value] : [];
    })
    .filter((product) => Boolean(product?.slug));
}

export function entitlementSlugs(license: Parameters<typeof productsFromLicense>[0]): string[] {
  return productsFromLicense(license).map((product) => String(product.slug));
}

export function licenseCoversRequest(
  license: Parameters<typeof productsFromLicense>[0],
  hostApp?: string,
  extensionSlug?: string,
): boolean {
  const products = productsFromLicense(license);
  const slugs = products.map((product) => String(product.slug));
  if (extensionSlug && !slugs.includes(extensionSlug)) return false;
  const host = hostApp?.trim().toUpperCase();
  if (host === "CHROME") {
    return slugs.includes("creatorlens") || products.some((product) => product.host_app === "CHROME");
  }
  return true;
}
