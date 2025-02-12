document.addEventListener('DOMContentLoaded', function() {
    const studentLoginForm = document.getElementById('studentLogin');
    const studentContent = document.getElementById('studentResult');
    const studentLoginMessage = document.getElementById('studentLoginMessage');
    const studentReportCard = document.getElementById('studentReportCard');
    const printStudentReportButton = document.getElementById('printStudentReport');
    const studentNameSelect = document.getElementById('studentName');

    // Populate student names dropdown
    populateStudentNamesDropdown(studentNameSelect);

    document.getElementById('studentLoginBtn').addEventListener('click', function() {
        const selectedStudentName = studentNameSelect.value;
        const enteredPassword = document.getElementById('studentPassword').value;

        // Validate input
        if (!selectedStudentName || !enteredPassword) {
            studentLoginMessage.textContent = "Please enter both student name and password.";
            return;
        }

        // Find student data that matches the name and password, and is approved
        const studentData = getApprovedStudentData(selectedStudentName, enteredPassword);
        if (studentData) {
            studentLoginForm.style.display = 'none';
            studentContent.style.display = 'block';
            studentReportCard.innerHTML = generateReportCard(studentData);
        } else {
            studentLoginMessage.textContent = "Invalid credentials or result not approved.";
        }
    });

    printStudentReportButton.addEventListener('click', function() {
        window.print();
    });
});

function populateStudentNamesDropdown(selectElement) {
    const studentNamesData = JSON.parse(localStorage.getItem('studentNames'));

    if (studentNamesData) {
        for (const className in studentNamesData) {
            for (const studentName of studentNamesData[className]) {
                const option = document.createElement('option');
                option.value = studentName;
                option.textContent = studentName;
                selectElement.appendChild(option);
            }
        }
    }
}

function getApprovedStudentData(studentName, enteredPassword) {
    const savedData = JSON.parse(localStorage.getItem('studentResults')) || [];
    studentName = studentName.trim().toLowerCase();

    return savedData.find(data => 
        data.name.toLowerCase() === studentName &&
        data.password === enteredPassword &&
        data.approved
    );
}

function generateReportCard(student) {
    if (!student || !student.subjectScores) {
        return '<p>Error: Student data is incomplete or not found.</p>';
    }

    let reportCard = `
        <div class="report-header">
            <h3>Student Information</h3>
            <p>Class: ${student.className}</p>
            <p>Name: ${student.name}</p>
            <p>Department: ${student.department}</p>
            <p>Image Path: ${student.imagePath}</p>
            <p>Attendance: ${student.attendance}</p>
            <p>Comment: ${student.performanceComment}</p>
            <p>Attitude Comment: ${student.attitudeComment}</p>
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