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

<<<<<<< Updated upstream
  // Process the courses to keep only the required fields
  const processedCourses: ProcessedCourse[] = courses.map(course => ({
    __catalogCourseId: course.__catalogCourseId,
    title: course.title,
    prerequisites: course.subjectCode.prerequisites,
    corequisites: course.subjectCode.corequisites,
    description: course.description,  // Use the new description field
  }));

  return NextResponse.json(processedCourses);
=======
  const filePath = path.join(process.cwd(), `data/${major.toLowerCase()}_data.json`);
  
  try {
    const data = await fs.readFile(filePath, 'utf8');
    const jsonData = JSON.parse(data);

    console.log('JSON data read from file:', jsonData); // Log the parsed JSON data

    // Ensure we're returning an object with a 'courses' property that is an array
    if (jsonData && typeof jsonData === 'object' && 'courses' in jsonData && Array.isArray(jsonData.courses)) {
      return NextResponse.json({ courses: jsonData.courses });
    } else {
      console.error('Unexpected data structure in JSON file:', jsonData);
      return NextResponse.json({ error: 'Unexpected data structure' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error reading JSON file:', error);
    return NextResponse.json({ error: 'Failed to read course data' }, { status: 500 });
  }
>>>>>>> Stashed changes
}
