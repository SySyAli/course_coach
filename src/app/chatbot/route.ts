import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env['OPENAI_API_KEY'], 
});

export async function POST(request: Request) {
  // Parse the request body if needed
  const requestBody = await request.json();

  // Call the OpenAI API with the file content as part of the system's message or other context
  const chatCompletion = await client.chat.completions.create({
    messages: [
      { role: 'system', content: `You are a helpful course advisor at Vanderbilt University. Do not mention course numbers, instead only mention course topics.` },
      { role: 'user', content: requestBody.message }
    ],
    model: 'gpt-3.5-turbo',
    max_tokens: 500,
  });

  // Extract the response from the OpenAI API
  const responseMessage = chatCompletion.choices[0].message.content;
  console.log("SERVER: ", responseMessage);

  // Return the response to the client
  return new Response(JSON.stringify({ message: responseMessage }), {
    headers: { 'Content-Type': 'application/json' },
  });
}