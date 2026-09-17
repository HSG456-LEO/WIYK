// This function runs on Netlify's servers, never in the user's browser.
// Netlify AI Gateway injects the Anthropic credentials at runtime, so no
// API key needs to be configured or exposed to anyone using the app.

// The model is fixed here, server-side, so the app in the browser can never
// request a different (potentially more expensive) model than you intend.
const MODEL = "claude-sonnet-5";

export default async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
  }

  let payload;
  try {
    payload = await req.json();
  } catch (err) {
    return new Response(JSON.stringify({ error: "Invalid request body" }), { status: 400 });
  }

  const { messages, max_tokens } = payload;
  if (!messages) {
    return new Response(JSON.stringify({ error: "Missing messages" }), { status: 400 });
  }

  try {
    const response = await fetch(`${process.env.ANTHROPIC_BASE_URL}/v1/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
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
      return new Response(
        JSON.stringify({ error: data.error ? data.error.message : "Anthropic API error" }),
        { status: response.status }
      );
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Failed to reach Anthropic API" }), { status: 500 });
  }
};
