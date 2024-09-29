import { NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';

// Define the Course interface for the expected data structure
interface Course {
  __catalogCourseId: string;
  subjectCode: {
    name: string;
    prerequisites: string[];
    corequisites: string[];
  };
  title: string;
  description: string;  // Add this line
}

interface ProcessedCourse {
  __catalogCourseId: string;
  title: string;
  prerequisites: string[];
  corequisites: string[];
  description: string;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const major = searchParams.get('major');

  // Path to the JSON file
  const jsonDirectory = path.join(process.cwd(), 'data');
  const fileContents = await fs.readFile(jsonDirectory + '/bio_data.json', 'utf8');
  let courses: Course[] = JSON.parse(fileContents);

  // Filter courses based on the major if provided
  if (major) {
    courses = courses.filter(course => course.subjectCode.name === major);
  }

  // Process the courses to keep only the required fields
  const processedCourses: ProcessedCourse[] = courses.map(course => ({
    __catalogCourseId: course.__catalogCourseId,
    title: course.title,
    prerequisites: course.subjectCode.prerequisites,
    corequisites: course.subjectCode.corequisites,
    description: course.description,  // Use the new description field
  }));

  return NextResponse.json(processedCourses);
}
