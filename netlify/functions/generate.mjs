// This function runs on Netlify's servers, never in the user's browser.
// The Anthropic API key is injected automatically by Netlify's AI Gateway,
// so it's never exposed to anyone using the app.

export default async (req) => {
  if (req.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "Server is not configured with an API key yet." },
      { status: 500 }
    );
  }

  let payload;
  try {
    payload = await req.json();
  } catch (err) {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { messages, max_tokens } = payload;
  if (!messages) {
    return Response.json({ error: "Missing messages" }, { status: 400 });
  }

  // The model is fixed here, server-side, so the app in the browser can never
  // request a different (potentially more expensive) model than you intend.
  // Check https://docs.claude.com for the current recommended model name —
  // model names are periodically updated, so confirm this is still current
  // before you launch.
  const MODEL = "claude-sonnet-5";

  try {
    const response = await fetch(`${process.env.ANTHROPIC_BASE_URL}/v1/messages`, {
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
      return Response.json(
        { error: data.error ? data.error.message : "Anthropic API error" },
        { status: response.status }
      );
    }

    return Response.json(data);
  } catch (err) {
    return Response.json({ error: "Failed to reach Anthropic API" }, { status: 500 });
  }
};
