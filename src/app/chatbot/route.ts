import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import path from 'path';
import { promises as fs } from 'fs';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface Course {
  __catalogCourseId: string;
  title: string;
  subjectCode: {
    name: string;
    prerequisites: string[];
    corequisites: string[];
  };
  description: string;
}

export async function POST(req: Request) {
  const body = await req.json();
  const { message, completedCourses, major } = body;

  // Read the course data
  const jsonDirectory = path.join(process.cwd(), 'data');
  const fileContents = await fs.readFile(jsonDirectory + '/bio_data.json', 'utf8');
  const allCourses: Course[] = JSON.parse(fileContents);

  // Filter courses by major
  const majorCourses = allCourses.filter(course => course.subjectCode.name === major);

  // Find suggested courses
  const suggestedCourses = majorCourses.filter(course => 
    !completedCourses.includes(course.__catalogCourseId) &&
    course.subjectCode.prerequisites.every(prereq => completedCourses.includes(prereq))
  );

  const suggestedCoursesText = suggestedCourses.map(course => 
    `${course.__catalogCourseId}: ${course.title}`
  ).join('\n');

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: `You are a helpful course advisor for ${major} major. The user has completed the following courses: ${completedCourses.join(", ")}. Based on their completed courses, here are some suggested next courses:\n${suggestedCoursesText}` },
        { role: "user", content: message }
      ],
    });

    return NextResponse.json({ message: completion.choices[0].message.content });
  } catch (error) {
    console.error('OpenAI API error:', error);
    return NextResponse.json({ error: 'Failed to get response from AI' }, { status: 500 });
  }
}