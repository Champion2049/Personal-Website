import { Handler } from '@netlify/functions';

const handler: Handler = async (event, context) => {
  const username = 'Champion2049';
  const url = `https://api.jikan.moe/v4/users/${username}/animelist`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: `Failed to fetch data from Jikan API: ${response.statusText}` }),
      };
    }
    const data = await response.json();
    
    // We can filter or transform the data here if needed
    const filteredData = data.data
      .filter((item: any) => item.status === 1 || item.status === 2) // 1: Watching, 2: Completed
      .map((item: any) => ({
        title: item.anime.title,
        image: item.anime.images.webp.large_image_url,
        status: item.status === 1 ? 'Watching' : 'Completed',
        score: item.score,
        type: 'Anime',
        mal_url: item.anime.url,
      }))
      .sort((a: any, b: any) => {
        // Prioritize 'Watching' status
        if (a.status === 'Watching' && b.status !== 'Watching') return -1;
        if (a.status !== 'Watching' && b.status === 'Watching') return 1;
        // Then sort by score
        return b.score - a.score;
      })
      .slice(0, 6); // Limit to 6 items for the section

    return {
      statusCode: 200,
      body: JSON.stringify(filteredData),
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*', // Allow requests from your frontend
      },
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal Server Error' }),
    };
  }
};

export { handler };
