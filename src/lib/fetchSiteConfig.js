export async function fetchSiteConfig(locale) {
  const configRes = await fetch(
    "https://7afez.share.net.sa/api/website-configuration",
    {
      headers: {
        Accept: "application/json",
        "Accept-Language": locale,
      },
      cache: "no-store",
    }
  );

  if (!configRes.ok) {
    throw new Error("Failed to fetch site configuration");
  }

  const configResult = await configRes.json();
  return configResult?.data || {};
}
