// This function runs on Netlify's servers, never in the user's browser.
// Your Anthropic API key lives only here (as an environment variable),
// so it's never exposed to anyone using the app.

exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Server is not configured with an API key yet." })
    };
  }

  let payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch (err) {
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid request body" }) };
  }

  const { messages, max_tokens } = payload;
  if (!messages) {
    return { statusCode: 400, body: JSON.stringify({ error: "Missing messages" }) };
  }

  // The model is fixed here, server-side, so the app in the browser can never
  // request a different (potentially more expensive) model than you intend.
  // Check https://docs.claude.com for the current recommended model name —
  // model names are periodically updated, so confirm this is still current
  // before you launch.
  const MODEL = "claude-sonnet-5";

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: max_tokens || 1200,
        messages
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: data.error ? data.error.message : "Anthropic API error" })
      };
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: "Failed to reach Anthropic API" }) };
  }
};
