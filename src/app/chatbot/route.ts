import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { promises as fs } from 'fs'; // Import fs for reading files

const client = new OpenAI({
  apiKey: process.env['OPENAI_API_KEY'], 
});

export async function POST(request: Request) {
  // Parse the request body if needed
  const requestBody = await request.json();

  // Read the context text file
  const contextFilePath = '../../../../data/vanderbilt_courses.txt'; // Adjust this path based on your project structure
  let fileContent = '';
  
  try {
    fileContent = await fs.readFile(contextFilePath, 'utf-8'); // Read the file content as a string
  } catch (error) {
    console.error("Error reading the context file:", error);
  }

  // Call the OpenAI API with the file content as part of the system's message or other context
  const chatCompletion = await client.chat.completions.create({
    messages: [
      { role: 'system', content: `You are a helpful course advisor at Vanderbilt University, using the following information as context: ${fileContent}. Only give courses explicitly mentioned in the context.` },
      { role: 'user', content: requestBody.message }
    ],
    model: 'gpt-3.5-turbo',
  });

  // Extract the response from the OpenAI API
  const responseMessage = chatCompletion.choices[0].message.content;
  console.log("SERVER: ", responseMessage);

  // Return the response to the client
  return new Response(JSON.stringify({ message: responseMessage }), {
    headers: { 'Content-Type': 'application/json' },
  });
}
