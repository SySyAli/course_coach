import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const major = searchParams.get('major');

  // Mock data with prerequisites
  const courses = [
    { id: 'BSCI101', name: 'Introduction to Biology', description: 'An overview of biological principles.', prerequisites: [] },
    { id: 'BSCI201', name: 'Cellular Biology', description: 'Study of cell structure and function.', prerequisites: ['BSCI101'] },
    { id: 'BSCI301', name: 'Genetics', description: 'Principles of heredity and gene expression.', prerequisites: ['BSCI201'] },
    { id: 'BSCI401', name: 'Molecular Biology', description: 'Advanced study of molecular processes in biological systems.', prerequisites: ['BSCI301'] },
    { id: 'BSCI501', name: 'Immunology', description: 'Study of immune systems and responses.', prerequisites: ['BSCI301'] },
  ];

  return NextResponse.json(courses);
}
