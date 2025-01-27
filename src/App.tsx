import React, { useState } from 'react';
import { Printer } from 'lucide-react';

interface StudentInfo {
  name: string;
  facultyNumber: string;
  enrollmentNumber: string;
}

interface Subject {
  sNo: number;
  courseNo: string;
  courseTitle: string;
  sess: number;
  exam: number;
  total: number;
  gm?: number;
  grade: string;
  isLab: boolean;
  credits: number;
}

// Import subject data
import subjects1Data from './data/subjects1.json';
import subjects2Data from './data/subjects2.json';

interface SubjectData {
  students: [string, string][];
  subjects: Subject[];
}

// Type assertion for the imported JSON data
const typedSubjects1Data = subjects1Data as SubjectData;
const typedSubjects2Data = subjects2Data as SubjectData;

function App() {
  const [showForm, setShowForm] = useState(true);
  const [studentInfo, setStudentInfo] = useState<StudentInfo>({
    name: '',
    facultyNumber: '',
    enrollmentNumber: ''
  });
  const [studentSubjects, setStudentSubjects] = useState<Subject[]>([]);

  const validStudents: [string, string][] = [...typedSubjects1Data.students, ...typedSubjects2Data.students];

  const isValidStudent = (facNo: string, enNo: string): boolean => {
    return validStudents.some(([f, e]) => f === facNo && e === enNo);
  };

  const shouldShowNewSubjects = (facNo: string): boolean => {
    return typedSubjects1Data.students.some(([f]) => f === facNo);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, field: keyof StudentInfo) => {
    const value = e.target.value.toUpperCase();
    setStudentInfo({ ...studentInfo, [field]: value });
  };

  const getStoredResult = (facNo: string, enNo: string): any | null => {
    const key = `result_${facNo}_${enNo}`;
    const storedData = localStorage.getItem(key);
    return storedData ? JSON.parse(storedData) : null;
  };

  const storeResult = (facNo: string, enNo: string, result: any) => {
    const key = `result_${facNo}_${enNo}`;
    localStorage.setItem(key, JSON.stringify(result));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!studentInfo.facultyNumber || !studentInfo.enrollmentNumber) {
      alert("Please enter both Faculty Number and Enrollment Number");
      return;
    }

    if (!isValidStudent(studentInfo.facultyNumber, studentInfo.enrollmentNumber)) {
      alert("Invalid Faculty Number or Enrollment Number combination");
      return;
    }

    // Check if result exists in local storage
    const storedResult = getStoredResult(studentInfo.facultyNumber, studentInfo.enrollmentNumber);
    if (storedResult) {
      const subjects = storedResult.map((subject: Subject) => ({
        ...subject,
        total: subject.sess + subject.exam,
        grade: calculateGrade(subject.sess + subject.exam, 100)
      }));
      setStudentSubjects(subjects);
      setShowForm(false);
      return;
    }

    // If not in local storage, generate new result
    const subjectsForFaculty = getSubjectsForFaculty(studentInfo.facultyNumber);
    const subjects = subjectsForFaculty.map((subject: Subject) => ({
      ...subject,
      total: subject.sess + subject.exam,
      grade: calculateGrade(subject.sess + subject.exam, 100)
    }));
    // Store the new result in local storage
    storeResult(studentInfo.facultyNumber, studentInfo.enrollmentNumber, subjectsForFaculty);
    setStudentSubjects(subjects);
    
    setShowForm(false);
  };

  const getBranchName = (facultyNumber: string) => {
    const branchCode = facultyNumber.substring(2, 4).toLowerCase();
    const branches: { [key: string]: string } = {
      'ai': 'Artificial Intelligence',
      'el': 'Electronics Engineering',
      'ee': 'Electrical Engineering',
      'co': 'Computer Engineering',
      'pk': 'Petrochemical Engineering',
      'ch': 'Chemical Engineering',
      'ft': 'Food Technology Engineering',
      'vl': 'VLSI',
      'me': 'Mechanical Engineering',
      'ce': 'Civil Engineering'
    };
    return branches[branchCode] || 'Electronics Engineering';
  };

  const generateRandomMarks = (max: number) => Math.floor(Math.random() * (max * 0.7) + (max * 0.3));
  
  const calculateGrade = (total: number, maxMarks: number) => {
    const percentage = (total / maxMarks) * 100;
    if (percentage >= 85) return 'A+';
    if (percentage >= 75) return 'A';
    if (percentage >= 65) return 'B+';
    if (percentage >= 55) return 'B';
    if (percentage >= 45) return 'C';
    return 'D';
  };

  const getGradePoints = (grade: string): number => {
    const gradePoints: { [key: string]: number } = {
      'A+': 10,
      'A': 9,
      'B+': 8,
      'B': 7,
      'C': 6,
      'D': 5
    };
    return gradePoints[grade] || 0;
  };

  const getSubjectsForFaculty = (facultyNumber: string): Subject[] => {
    if (shouldShowNewSubjects(facultyNumber)) {
      return typedSubjects1Data.subjects.map((subject) => ({
        ...subject,
        sess: generateRandomMarks(subject.isLab ? 60 : 40),
        exam: generateRandomMarks(subject.isLab ? 40 : 60),
        total: 0,
        grade: '',
        isLab: subject.isLab,
        credits: subject.credits
      }));
    } else {
      return typedSubjects2Data.subjects.map((subject) => ({
        ...subject,
        sess: generateRandomMarks(subject.isLab ? 60 : 40),
        exam: generateRandomMarks(subject.isLab ? 40 : 60),
        total: 0,
        grade: '',
        isLab: subject.isLab,
        credits: subject.credits
      }));
    }
  };

  const calculateCGPA = () => {
    let totalCredits = 0;
    let totalGradePoints = 0;

    studentSubjects.forEach(subject => {
      const gradePoints = getGradePoints(subject.grade);
      totalCredits += subject.credits;
      totalGradePoints += gradePoints * subject.credits;
    });

    return (totalGradePoints / totalCredits).toFixed(3);
  };

  const calculateEarnedCredits = (subjects: Subject[]): number => {
    const isFirstGroup = subjects.some(s => s.courseNo === "ACS1112");
    return isFirstGroup ? 20.5 : 22.5;
  };

  const cgpa = calculateCGPA();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      {showForm ? (
        <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
          <div className="text-center mb-6">
            <img
              src="https://vectorseek.com/wp-content/uploads/2023/08/AMU-Aligarh-Muslim-University-Logo-Vector.svg-.png"
              alt="AMU Logo"
              className="h-24 mx-auto mb-4"
            />
            <h1 className="text-2xl font-bold">ZAKIR HUSAIN COLLEGE OF ENGINEERING & TECHNOLOGY</h1>
            <h2 className="text-xl mt-2">Result Portal</h2>
            <h3 className="text-lg mt-1">Session: 2024-2025</h3>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="form-group">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={studentInfo.name}
                onChange={(e) => handleInputChange(e, 'name')}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                placeholder="Enter your Full Name"
              />
            </div>
            <div className="form-group">
              <label htmlFor="facultyNumber" className="block text-sm font-medium text-gray-700 mb-2">
                Faculty Number
              </label>
              <input
                type="text"
                id="facultyNumber"
                name="facultyNumber"
                value={studentInfo.facultyNumber}
                onChange={(e) => handleInputChange(e, 'facultyNumber')}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                placeholder="Enter your Faculty Number"
              />
            </div>
            <div className="form-group">
              <label htmlFor="enrollmentNumber" className="block text-sm font-medium text-gray-700 mb-2">
                Enrollment Number
              </label>
              <input
                type="text"
                id="enrollmentNumber"
                name="enrollmentNumber"
                value={studentInfo.enrollmentNumber}
                onChange={(e) => handleInputChange(e, 'enrollmentNumber')}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                placeholder="Enter your Enrollment Number"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              Generate Result
            </button>
          </form>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto bg-white p-8 rounded-lg shadow-md print:shadow-none">
          <div className="print:hidden mb-4 flex justify-end">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
            >
              <Printer size={20} />
              Print
            </button>
          </div>
          
          <div className="text-center mb-8">
            <img
              src="https://vectorseek.com/wp-content/uploads/2023/08/AMU-Aligarh-Muslim-University-Logo-Vector.svg-.png"
              alt="AMU Logo"
              className="h-24 mx-auto mb-4"
            />
            <h1 className="text-2xl font-bold">ZAKIR HUSAIN COLLEGE OF ENGINEERING & TECHNOLOGY</h1>
            <h2 className="text-xl mt-2">Result: Odd Semester, 2024-25</h2>
            <h3 className="text-lg mt-1">B.Tech: {getBranchName(studentInfo.facultyNumber)}</h3>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p><strong>Name:</strong> {studentInfo.name}</p>
              <p><strong>Faculty Number:</strong> {studentInfo.facultyNumber}</p>
            </div>
            <div className="text-right">
              <p><strong>Enrollment Number:</strong> {studentInfo.enrollmentNumber}</p>
            </div>
          </div>

          <div className="overflow-x-auto mb-6">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-2">S.No</th>
                  <th className="border border-gray-300 px-4 py-2">Course No.</th>
                  <th className="border border-gray-300 px-4 py-2">Course Title</th>
                  <th className="border border-gray-300 px-4 py-2">Sess.</th>
                  <th className="border border-gray-300 px-4 py-2">Exam</th>
                  <th className="border border-gray-300 px-4 py-2">Total</th>
                  <th className="border border-gray-300 px-4 py-2">GM</th>
                  <th className="border border-gray-300 px-4 py-2">Grade</th>
                  <th className="border border-gray-300 px-4 py-2">Grade-Range</th>
                </tr>
              </thead>
              <tbody>
                {studentSubjects.map((subject) => (
                  <tr key={subject.sNo}>
                    <td className="border border-gray-300 px-4 py-2 text-center">{subject.sNo}</td>
                    <td className="border border-gray-300 px-4 py-2">{subject.courseNo}</td>
                    <td className="border border-gray-300 px-4 py-2">{subject.courseTitle}</td>
                    <td className="border border-gray-300 px-4 py-2 text-center">{subject.sess}</td>
                    <td className="border border-gray-300 px-4 py-2 text-center">{subject.exam}</td>
                    <td className="border border-gray-300 px-4 py-2 text-center">{subject.total}</td>
                    <td className="border border-gray-300 px-4 py-2 text-center">{subject.gm || ''}</td>
                    <td className="border border-gray-300 px-4 py-2 text-center">{subject.grade}</td>
                    <td className="border border-gray-300 px-4 py-2 text-sm">A+:85-100, A:75-84, B+:65-74, B:55-64, C:45-54, D:35-44</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-4">
            <div>
              <p><strong>SPI/SGPA:</strong> {cgpa}</p>
            </div>
            <div className="text-center">
              <p><strong>CPI/CGPA:</strong> {cgpa}</p>
            </div>
            <div className="text-right">
              <p><strong>Cumulative Earn Credit (EC):</strong> {calculateEarnedCredits(studentSubjects)}</p>
            </div>
          </div>

          <div className="mt-6">
            <h4 className="font-bold">RESULT: Continued</h4>
            <p className="text-sm mt-2">Note: This result is only for information of students. It should not be treated as official record.</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;