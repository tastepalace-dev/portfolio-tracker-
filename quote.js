exports.handler = async (event) => {
  const raw = (event.queryStringParameters && event.queryStringParameters.symbol) || "";
  const symbol = raw.toUpperCase().replace(/[^A-Z0-9.\-]/g, "");

  const json = (statusCode, body) => ({
    statusCode,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!symbol) return json(400, { error: "Missing symbol" });

  const key = process.env.FINNHUB_KEY;
  if (!key) return json(500, { error: "Server key is not set" });

  try {
    const url = "https://finnhub.io/api/v1/quote?symbol=" +
      encodeURIComponent(symbol) + "&token=" + encodeURIComponent(key);
    const response = await fetch(url);
    if (!response.ok) return json(502, { error: "Finnhub error " + response.status });

    const data = await response.json();
    if (!data.c || data.c <= 0) return json(404, { error: "No price for " + symbol });

    return json(200, { price: data.c });
  } catch (err) {
    return json(500, { error: "Could not reach Finnhub" });
  }
};
