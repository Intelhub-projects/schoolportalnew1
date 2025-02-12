document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.endsWith('/result-input.html')) {
        populateDropdown('class', 12, 'Class ');
        checkTeacherLoginStatus();
        loadResultToEdit();
    }
});

let currentTeacherClass = null;

function checkTeacherLoginStatus() {
    const loggedInTeacher = localStorage.getItem('loggedInTeacher');
    if (loggedInTeacher) {
        const teachers = JSON.parse(localStorage.getItem('teachers')) || {};
        currentTeacherClass = teachers[loggedInTeacher].class;

        const classDropdown = document.getElementById('class');
        classDropdown.innerHTML = `<option value="${currentTeacherClass}">${currentTeacherClass}</option>`;

        displayTeacherInfo(loggedInTeacher, currentTeacherClass);
        populateStudentNamesDropdown();
    } else {
        window.location.href = 'teacher-login.html';
    }
}

function displayTeacherInfo(teacherUsername, teacherClass) {
    const infoDiv = document.createElement('div');
    infoDiv.innerHTML = `
        <p>Welcome, ${teacherUsername}!</p>
        <p>You are assigned to: ${teacherClass}</p>
    `;
    document.querySelector('.container').prepend(infoDiv);
}

function populateDropdown(elementId, count, prefix) {
    const dropdown = document.getElementById(elementId);
    for (let i = 1; i <= count; i++) {
        const option = document.createElement('option');
        option.value = prefix + i;
        option.textContent = prefix + i;
        dropdown.appendChild(option);
    }
}
function moveStudentsToNewClass(currentSession, newSession) {
    // 1. Retrieve student data from localStorage
    const studentData = JSON.parse(localStorage.getItem('studentData')) || {};
  
    // 2. Define class promotion rules (example: simple increment)
    const classPromotions = {
      "Class 1": "Class 2",
      "Class 2": "Class 3",
      "Class 3": "Class 4",
      "Class 4": "Class 5",
      "Class 5": "Class 6",
      "Class 6": "Class 7",
      "Class 7": "Class 8",
      "Class 8": "Class 9",
      "Class 9": "Class 10",
      "Class 10": "Class 11",
      "Class 11": "Class 12"
    };
  
    // 3. Iterate through each class and update student data
    for (const currentClass in studentData) {
      const newClass = classPromotions[currentClass] || null; // Handle potential edge cases (e.g., Class 12)
  
      if (newClass) {
        // Move students to the new class
        studentData[newClass] = studentData[currentClass];
        delete studentData[currentClass];
      }
    }
  
    // 4. Update localStorage with the modified student data
    localStorage.setItem('studentData', JSON.stringify(studentData));
  
    // 5. (Optional) Update any other relevant data (e.g., teacher assignments)
    // You might need to adjust the logic based on your specific implementation
  
    // 6. (Optional) Display a success message to the user
    console.log(`Students successfully moved to new classes for the ${newSession} academic session.`);
  }
  
  // Example usage:
  const currentSession = "2024/2025"; 
  const newSession = "2025/2026"; 
  moveStudentsToNewClass(currentSession, newSession);
function populateStudentNamesDropdown() {
    const studentNamesData = JSON.parse(localStorage.getItem('studentNames'));
    const nameDropdown = document.getElementById('name');
    nameDropdown.innerHTML = '<option value="">Select Name</option>';

    if (studentNamesData && currentTeacherClass) {
        const studentNamesForClass = studentNamesData[currentTeacherClass] || [];
        for (const studentName of studentNamesForClass) {
            const option = document.createElement('option');
            option.value = studentName;
            option.textContent = studentName;
            nameDropdown.appendChild(option);
        }
    }
}

document.getElementById('department').addEventListener('change', function() {
    const department = this.value;
    const subjectScoresDiv = document.getElementById('subjectScores');
    subjectScoresDiv.innerHTML = '';

    let subjectNames = [];
    if (department === 'Science') {
        subjectNames = ["Mathematics", "English Language", "Physics", "Chemistry", "Biology", "Further Mathematics", "Technical Drawing", "Geography"];
    } else if (department === 'Arts') {
        subjectNames = ["Mathematics", "English Language", "Literature in English", "Government", "History", "Fine Arts", "Music", "French"];
    } else if (department === 'Commercial') {
        subjectNames = ["Mathematics", "English Language", "Financial Accounting", "Commerce", "Economics", "Office Practice", "Insurance", "Book Keeping"];
    } else if (department === 'Gold' || department === 'Diamond') {
        subjectNames = ["Mathematics", "English Language", "Basic Science", "Basic Technology", "Social Studies", "Civic Education", "Computer Studies", "Physical and Health Education", "Agric Science", "Home Economics"];
    }

    for (let subjectName of subjectNames) {
        const subjectGroup = document.createElement('div');
        subjectGroup.className = 'subject-group';
        subjectGroup.innerHTML = `
            <label>${subjectName}:</label>
            <input type="number" class="ca-score" placeholder="C.A Score" min="0" max="40">
            <input type="number" class="exam-score" placeholder="Exam Score" min="0" max="60">
        `;
        subjectScoresDiv.appendChild(subjectGroup);
    }
});

document.getElementById('calculate').addEventListener('click', function() {
    const studentData = getStudentData();

    if (!studentData) {
        alert('Invalid student name selected.');
        return;
    }

    if (!validateInputs(studentData)) {
        alert('Please fill in all fields correctly.');
        return;
    }

    const password = generatePassword();
    updateStudentData(studentData, password); // Update existing or save new

    const reportCard = generateReportCard(studentData);
    document.getElementById('reportCard').innerHTML = reportCard;
    document.getElementById('results').style.display = 'block';

    document.getElementById('passwordDisplay').innerText = `Unique Password: ${password}`;
});

function validateInputs(studentData) {
    if (!studentData.session || !studentData.term || !studentData.className || !studentData.name || !studentData.department || !studentData.attendance || !studentData.performanceComment || !studentData.attitudeComment) {
        return false;
    }

    for (let score of studentData.subjectScores) {
        if (isNaN(score.ca) || isNaN(score.exam) || score.ca < 0 || score.ca > 40 || score.exam < 0 || score.exam > 60) {
            return false;
        }
    }

    return true;
}

function getStudentData() {
    const studentName = document.getElementById('name').value;

    const studentNames = JSON.parse(localStorage.getItem('studentNames')) || {};
    const isValidStudentName = Object.values(studentNames).flat().includes(studentName);

    if (!isValidStudentName) {
        alert('Selected student name does not exist.');
        return null;
    }

    const caScores = Array.from(document.querySelectorAll('.ca-score')).map(input => Number(input.value));
    const examScores = Array.from(document.querySelectorAll('.exam-score')).map(input => Number(input.value));
    const subjectNames = Array.from(document.querySelectorAll('.subject-group label')).map(label => label.textContent);

    const subjectScores = subjectNames.map((name, i) => ({
        name: name,
        ca: caScores[i],
        exam: examScores[i]
    }));

    return {
        session: document.getElementById('session').value,
        term: document.getElementById('term').value,
        className: document.getElementById('class').value,
        name: studentName,
        department: document.getElementById('department').value,
        imagePath: document.getElementById('image').value,
        attendance: document.getElementById('attendance').value,
        performanceComment: document.getElementById('comment').value,
        attitudeComment: document.getElementById('attitudeComment').value,
        subjectScores: subjectScores,
        totalScore: calculateTotalScore(caScores, examScores),
        averageScore: calculateAverageScore(caScores, examScores)
    };
}

function calculateTotalScore(caScores, examScores) {
    let totalScore = 0;
    for (let i = 0; i < caScores.length; i++) {
        totalScore += caScores[i] + examScores[i];
    }
    return totalScore;
}

function calculateAverageScore(caScores, examScores) {
    if (caScores.length === 0) return 0;
    return calculateTotalScore(caScores, examScores) / caScores.length;
}

function generateReportCard(student) {
    let reportCard = `
        <div class="report-header">
            <h3>Student Information</h3>
            <p>Session: ${student.session}</p>
            <p>Term: ${student.term}</p>
            <p>Class: ${student.className}</p>
            <p>Name: ${student.name}</p>
            <p>Department: ${student.department}</p>
            <p>Image Path: ${student.imagePath}</p>
            <p>Attendance: ${student.attendance}</p>
            <p>Comment: ${student.performanceComment}</p>
            <p>Attitude Comment: ${student.attitudeComment}</p>
            <p id="passwordDisplay">Password: ${student.password}</p>
        </div>
        <div class="report-body">
            <h3>Subject Scores</h3>
            <table class="subject-table">
                <thead>
                    <tr>
                        <th>Subject</th>
                        <th>C.A Score</th>
                        <th>Exam Score</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
    `;

    for (let score of student.subjectScores) {
        reportCard += `
                    <tr>
                        <td>${score.name}</td>
                        <td>${score.ca}</td>
                        <td>${score.exam}</td>
                        <td>${Number(score.ca) + Number(score.exam)}</td>
                    </tr>
        `;
    }

    reportCard += `
                </tbody>
            </table>
        </div>
        <div class="report-footer">
            <p>Total Score: ${student.totalScore}</p>
            <p>Average Score: ${student.averageScore.toFixed(2)}</p>
        </div>
    `;

    return reportCard;
}

function generatePassword() {
    return Math.random().toString(36).slice(-8);
}

function updateStudentData(studentData) {
    let savedData = JSON.parse(localStorage.getItem('studentResults')) || [];
    const existingIndex = savedData.findIndex(data => 
        data.name.toLowerCase() === studentData.name.toLowerCase() && 
        data.className === studentData.className &&
        data.session === studentData.session &&
        data.term === studentData.term
    );

    if (existingIndex > -1) {
        studentData.password = savedData[existingIndex].password;
        studentData.approved = false;
        savedData[existingIndex] = studentData;
    } else {
        studentData.password = generatePassword();
        studentData.approved = false;
        savedData.push(studentData);
    }

    localStorage.setItem('studentResults', JSON.stringify(savedData));
    updateCSVData(studentData);
}

function loadStudentData() {
    const passwordTable = document.querySelector('#passwordTable tbody');
    if (passwordTable) {
        const savedData = JSON.parse(localStorage.getItem('studentResults')) || [];
        passwordTable.innerHTML = '';

        for (let data of savedData) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${data.name}</td>
                <td>${data.password}</td>
            `;
            passwordTable.appendChild(row);
        }
    }
}

function updateCSVData(studentData) {
    const className = studentData.className;
    const csvKey = `csvData${className}`;
    let csvData = localStorage.getItem(csvKey) || 'Session,Term,Class,Name,Department,Image Path,Attendance,Performance Comment,Attitude Comment,Subject,C.A Score,Exam Score,Total Score,Password\n';

    // Remove existing data for this student, session, and term
    let lines = csvData.split('\n');
    csvData = lines.filter(line => {
        const columns = line.split(',');
        return !(columns[3] === studentData.name && columns[0] === studentData.session && columns[1] === studentData.term);
    }).join('\n');

    // Add new data
    for (const subjectScore of studentData.subjectScores) {
        const row = `\n${studentData.session},${studentData.term},${studentData.className},${studentData.name},${studentData.department},${studentData.imagePath},${studentData.attendance},"${studentData.performanceComment}","${studentData.attitudeComment}",${subjectScore.name},${subjectScore.ca},${subjectScore.exam},${subjectScore.ca + subjectScore.exam},${studentData.password}`;
        csvData += row;
    }

    localStorage.setItem(csvKey, csvData);
}

document.getElementById('printReport').addEventListener('click', function() {
    window.print();
});

function loadResultToEdit() {
    const resultToEdit = JSON.parse(localStorage.getItem('resultToEdit'));
    if (resultToEdit) {
        document.getElementById('session').value = resultToEdit.session;
        document.getElementById('term').value = resultToEdit.term;
        document.getElementById('class').value = resultToEdit.className;
        document.getElementById('name').value = resultToEdit.name;
        document.getElementById('department').value = resultToEdit.department;
        document.getElementById('attendance').value = resultToEdit.attendance;
        document.getElementById('comment').value = resultToEdit.performanceComment;
        document.getElementById('attitudeComment').value = resultToEdit.attitudeComment;

        const subjectScoresDiv = document.getElementById('subjectScores');
        subjectScoresDiv.innerHTML = '';
        for (const subjectScore of resultToEdit.subjectScores) {
            const subjectGroup = document.createElement('div');
            subjectGroup.className = 'subject-group';
            subjectGroup.innerHTML = `
                <label>${subjectScore.name}:</label>
                <input type="number" class="ca-score" placeholder="C.A Score" min="0" max="40" value="${subjectScore.ca}">
                <input type="number" class="exam-score" placeholder="Exam Score" min="0" max="60" value="${subjectScore.exam}">
            `;
            subjectScoresDiv.appendChild(subjectGroup);
        }

        document.getElementById('calculate').textContent = 'Update & Save';
        localStorage.removeItem('resultToEdit');
    }
}