import { NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';

// Function to read and parse the JSON file
async function readJsonFile(filePath: string) {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading JSON file:', error);
    return null;
  }
}

// API endpoint to fetch courses based on the major from the query parameter
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const major = searchParams.get('major');

  if (!major) {
    return NextResponse.json({ error: 'Major is required' }, { status: 400 });
  }

  // Adjust the path to your JSON file
  const filePath = path.join(process.cwd(), 'data/bio_data.json');
  const jsonData = await readJsonFile(filePath);

  if (!jsonData) {
    return NextResponse.json({ error: 'Failed to read course data' }, { status: 500 });
  }

  const selectedMajor = major.toLowerCase();
  
  // Define the Course interface for the expected data structure
  interface Course {
    subjectCode: {
      name: string;
      description: string;
    };
    // Add other properties of the course object if needed
  }
  console.log("jsonData", jsonData);
  // Filter courses based on the selected major
  const majorCourses = jsonData.filter(
    (course: Course) =>
      course.subjectCode.name.toLowerCase() === selectedMajor ||
      course.subjectCode.description.toLowerCase().includes(selectedMajor)
  );

  if (majorCourses.length === 0) {
    return NextResponse.json({ error: 'No courses found for this major' }, { status: 404 });
  }

  return NextResponse.json({ courses: majorCourses });
}
