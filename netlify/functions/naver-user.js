export async function handler(event) {
  const accessToken = event.headers.authorization;

  try {
    const response = await fetch("https://openapi.naver.com/v1/nid/me", {
      headers: {
        Authorization: accessToken,
      },
    });

    const data = await response.json();

    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
}