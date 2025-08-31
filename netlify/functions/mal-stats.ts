import type { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";

const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  const JIKAN_API_URL = "https://api.jikan.moe/v4/users/Champion2049/full";

  try {
    const response = await fetch(JIKAN_API_URL, {
      headers: {
        "User-Agent": "Personal-Website-Project/1.0",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Jikan API error:", errorText);
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: `Failed to fetch data from Jikan API: ${response.statusText}` }),
      };
    }

    const data = await response.json();

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    };
  } catch (error) {
    console.error("Error fetching from Jikan API:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal Server Error" }),
    };
  }
};

export { handler };
