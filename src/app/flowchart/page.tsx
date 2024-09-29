/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useState } from 'react';

// Recursive component to render the tree structure for each course
const CourseNode = ({ course, courses }: { course: any, courses: any[] }) => {
  const prerequisites = courses.filter(c => course.subjectCode.prerequisites.includes(c.__catalogCourseId));
  const corequisites = courses.filter(c => course.subjectCode.corequisites.includes(c.__catalogCourseId));

  return (
    <div className="course-node">
      {/* Render the current course */}
      <div className="course-box">
        <h4>{course.__catalogCourseId}</h4>
        <p>{course.title}</p>
      </div>

      {/* Render prerequisites and corequisites recursively */}
      <div className="children">
        {prerequisites.length > 0 && (
          <div className="prerequisites">
            <h5>Prerequisites</h5>
            <div className="node-children">
              {prerequisites.map((prereq) => (
                <CourseNode key={prereq.__catalogCourseId} course={prereq} courses={courses} />
              ))}
            </div>
          </div>
        )}

        {corequisites.length > 0 && (
          <div className="corequisites">
            <h5>Corequisites</h5>
            <div className="node-children">
              {corequisites.map((coreq) => (
                <CourseNode key={coreq.__catalogCourseId} course={coreq} courses={courses} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const FlowchartPage: React.FC = () => {
  const [courses, setCourses] = useState<any[]>([]);

  useEffect(() => {
    // Fetch the course data from an API
    fetch('/api/bio_data')  // Replace with the actual API endpoint
      .then(response => response.json())
      .then(jsonData => {
        if (jsonData.courses && Array.isArray(jsonData.courses)) {
          setCourses(jsonData.courses);
        } else {
          console.error('Invalid data format:', jsonData);
        }
      })
      .catch(error => console.error('Error fetching bio data:', error));
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'auto' }}>  {/* Make scrollable */}
      <h1 style={{ textAlign: 'center', marginTop: 0 }}>Course Flowchart</h1>
      <div id="flowchart">
        {courses.length > 0 ? (
          courses.map((course) => (
            <CourseNode key={course.__catalogCourseId} course={course} courses={courses} />
          ))
        ) : (
          <p>Loading...</p>
        )}
      </div>
    </div>
  );
};

export default FlowchartPage;
