import { NextResponse } from "next/server";
import path from "path";
import { promises as fs } from "fs";

// Function to read and parse the JSON file
async function readJsonFile(filePath: string) {
	try {
		const data = await fs.readFile(filePath, "utf8");
		return JSON.parse(data);
	} catch (error) {
		console.error("Error reading JSON file:", error);
		return null;
	}
}

// API endpoint to fetch majors
export async function GET() {
	const filePath = path.join(process.cwd(), "data/data.json");
	const jsonData = await readJsonFile(filePath);

	if (!jsonData) {
		return NextResponse.json(
			{ error: "Failed to read course data" },
			{ status: 500 }
		);
	}

	const subjectCodes = [
		...Array.from(new Set(jsonData.map((course: { subjectCode: { name: string } }) => course.subjectCode.name))),
	];
	return NextResponse.json(subjectCodes);
}
