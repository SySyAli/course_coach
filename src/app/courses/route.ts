import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const major = searchParams.get('major');

  // This is where you would typically fetch data from a database
  // For this example, we'll return mock data
  const courses = [
    { id: 'BSCI101', name: 'Introduction to Biology', description: 'An overview of biological principles.' },
    { id: 'BSCI201', name: 'Cellular Biology', description: 'Study of cell structure and function.' },
    { id: 'BSCI301', name: 'Genetics', description: 'Principles of heredity and gene expression.' },
  ];

  return NextResponse.json(courses);
}
