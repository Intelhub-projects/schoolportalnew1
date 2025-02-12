document.addEventListener('DOMContentLoaded', function() {
    const adminLoginForm = document.getElementById('adminAuth');
    const adminContent = document.getElementById('adminContent');
    const loginMessage = document.getElementById('loginMessage');
    const passwordTable = document.getElementById('passwordTable').getElementsByTagName('tbody')[0];
    const accessTeacherLoginPageButton = document.getElementById('accessTeacherLoginPage');
    const addTeacherForm = document.getElementById('addTeacherForm');
    const teacherTable = document.getElementById('teacherTable').getElementsByTagName('tbody')[0];
    const addTeacherButton = document.getElementById('addTeacher');
    const teacherNameInput = document.getElementById('teacherName');
    const teacherClassSelect = document.getElementById('teacherClass');
    const addTeacherMessage = document.getElementById('addTeacherMessage');
    const classFormsContainer = document.getElementById('class-forms-container');
    const saveStudentNamesButton = document.getElementById('saveStudentNames');
    const resultsTable = document.getElementById('resultsTable').getElementsByTagName('tbody')[0];
    const csvDataDisplay = document.getElementById('csvDataDisplay');
    const downloadAllCSVButton = document.getElementById('downloadAllCSV');
    const csvPreviewsContainer = document.getElementById('csvPreviews');
    const studentDataFormsContainer = document.getElementById('student-data-forms-container');
    const saveStudentDataButton = document.getElementById('saveStudentData');

    // Placeholder for actual admin password verification
    const correctAdminPassword = "admin";

    document.getElementById('adminLogin').addEventListener('click', function() {
        const enteredPassword = document.getElementById('adminPassword').value;

        if (enteredPassword === correctAdminPassword) {
            adminLoginForm.style.display = 'none';
            adminContent.style.display = 'block';
            loadStudentData();
            createClassForms();
            loadTeachers();
            loadUnapprovedResults();
            loadAndDisplayClassCSVData();
            createStudentDataForms();
        } else {
            loginMessage.textContent = "Incorrect admin password.";
        }
    });

    accessTeacherLoginPageButton.addEventListener('click', function() {
        window.location.href = 'teacher-login.html';
    });

    // Load existing teachers on page load
    loadTeachers();

    addTeacherButton.addEventListener('click', function() {
        const teacherName = teacherNameInput.value.trim();
        const teacherClass = teacherClassSelect.value;

        if (!teacherName || !teacherClass) {
            addTeacherMessage.textContent = "Please enter teacher name and select a class.";
            return;
        }

        // Check if the class is already assigned to another teacher
        if (isClassAssigned(teacherClass)) {
            addTeacherMessage.textContent = `Class ${teacherClass} is already assigned to another teacher.`;
            return;
        }

        const username = generateUsername(teacherName);
        const password = generatePassword();

        saveTeacher(username, password, teacherClass);
        addTeacherMessage.textContent = `Teacher added: ${username} / ${password}`;

        // Clear the input fields after adding
        teacherNameInput.value = '';
        teacherClassSelect.value = '';

        // Reload the teacher table to show the new teacher
        loadTeachers();
    });

    function isClassAssigned(className) {
        const teachers = JSON.parse(localStorage.getItem('teachers')) || {};
        for (const username in teachers) {
            if (teachers[username].class === className) {
                return true; // Class is already assigned
            }
        }
        return false; // Class is not assigned
    }

    function generateUsername(teacherName) {
        // Simple username generation - replace with a more robust method in production
        return teacherName.toLowerCase().replace(/\s+/g, '.') + Math.floor(Math.random() * 1000);
    }

    function generatePassword() {
        // Simple password generation - replace with a more secure method in production
        return Math.random().toString(36).slice(-8);
    }

    function saveTeacher(username, password, classAssigned) {
        let teachers = JSON.parse(localStorage.getItem('teachers')) || {};
        teachers[username] = { password, class: classAssigned };
        localStorage.setItem('teachers', JSON.stringify(teachers));
    }

    function loadTeachers() {
        const teachers = JSON.parse(localStorage.getItem('teachers')) || {};
        teacherTable.innerHTML = ''; // Clear existing data

        for (const username in teachers) {
            const row = teacherTable.insertRow();
            const usernameCell = row.insertCell();
            const passwordCell = row.insertCell();
            const classCell = row.insertCell();

            usernameCell.textContent = username;
            passwordCell.textContent = teachers[username].password;
            classCell.textContent = teachers[username].class;
        }
    }

    function createClassForms() {
        const classes = ["Class 1", "Class 2", "Class 3", "Class 4", "Class 5", "Class 6", "Class 7", "Class 8", "Class 9", "Class 10", "Class 11", "Class 12"];
        for (const className of classes) {
            const form = document.createElement('div');
            form.innerHTML = `<h3>${className}</h3>`;
            for (let i = 1; i <= 25; i++) {
                const input = document.createElement('input');
                input.type = 'text';
                input.id = `${className}-student-${i}`;
                input.placeholder = `Student ${i} Name`;
                form.appendChild(input);
                form.appendChild(document.createElement('br'));
            }
            classFormsContainer.appendChild(form);
        }
    }
    function createStudentDataForms() {
        const classes = ["Class 1", "Class 2", "Class 3", "Class 4", "Class 5", "Class 6", 
                         "Class 7", "Class 8", "Class 9", "Class 10", "Class 11", "Class 12"];
        const container = document.getElementById('student-data-forms-container');
        container.innerHTML = ''; // Clear existing forms
    
        for (const className of classes) {
            const form = document.createElement('div');
            form.innerHTML = `<h3>${className}</h3>`;
    
            // Create a container for each student's data
            const studentDataContainer = document.createElement('div');
            for (let i = 1; i <= 25; i++) {
                const studentDataInputs = `
                    <h4>Student ${i}</h4>
                    <div class="form-group">
                        <label for="${className}-student-${i}-name">Student Name:</label>
                        <input type="text" id="${className}-student-${i}-name" placeholder="Student Name">
                    </div>
                    <div class="form-group">
                        <label for="${className}-student-${i}-surname">Surname:</label>
                        <input type="text" id="${className}-student-${i}-surname" placeholder="Surname">
                    </div>
                    <div class="form-group">
                        <label for="${className}-student-${i}-father-phone">Father's Phone:</label>
                        <input type="tel" id="${className}-student-${i}-father-phone" placeholder="Father's Phone">
                    </div>
                    <div class="form-group">
                        <label for="${className}-student-${i}-mother-phone">Mother's Phone:</label>
                        <input type="tel" id="${className}-student-${i}-mother-phone" placeholder="Mother's Phone">
                    </div>
                    <div class="form-group">
                        <label for="${className}-student-${i}-father-email">Father's Email:</label>
                        <input type="email" id="${className}-student-${i}-father-email" placeholder="Father's Email">
                    </div>
                    <div class="form-group">
                        <label for="${className}-student-${i}-mother-email">Mother's Email:</label>
                        <input type="email" id="${className}-student-${i}-mother-email" placeholder="Mother's Email">
                    </div>
                    <div class="form-group">
                        <label for="${className}-student-${i}-image">Image:</label>
                        <input type="file" id="${className}-student-${i}-image" accept="image/*">
                    </div>
                    <div class="form-group">
                        <label for="${className}-student-${i}-club">Student's Club:</label>
                        <input type="text" id="${className}-student-${i}-club" placeholder="Student's Club">
                    </div>
                    <br>
                `;
                studentDataContainer.innerHTML += studentDataInputs;
            }
            form.appendChild(studentDataContainer);
            container.appendChild(form);
        }
    }
    

    saveStudentNamesButton.addEventListener('click', function() {
        const studentNamesData = {};
        const classes = ["Class 1", "Class 2", "Class 3", "Class 4", "Class 5", "Class 6", "Class 7", "Class 8", "Class 9", "Class 10", "Class 11", "Class 12"];
        for (const className of classes) {
            studentNamesData[className] = [];
            for (let i = 1; i <= 25; i++) {
                const inputId = `${className}-student-${i}`;
                const studentName = document.getElementById(inputId).value;
                studentNamesData[className].push(studentName);
            }
        }
        localStorage.setItem('studentNames', JSON.stringify(studentNamesData));
        document.getElementById('saveMessage').textContent = "Student names saved successfully.";
    });

    saveStudentDataButton.addEventListener('click', function() {
        const studentData = {};
        const classes = ["Class 1", "Class 2", "Class 3", "Class 4", "Class 5", "Class 6", 
                         "Class 7", "Class 8", "Class 9", "Class 10", "Class 11", "Class 12"];
    
        for (const className of classes) {
            studentData[className] = [];
            for (let i = 1; i <= 25; i++) {
                const student = {
                    name: document.getElementById(`${className}-student-${i}-name`).value,
                    surname: document.getElementById(`${className}-student-${i}-surname`).value,
                    fatherPhone: document.getElementById(`${className}-student-${i}-father-phone`).value,
                    motherPhone: document.getElementById(`${className}-student-${i}-mother-phone`).value,
                    fatherEmail: document.getElementById(`${className}-student-${i}-father-email`).value,
                    motherEmail: document.getElementById(`${className}-student-${i}-mother-email`).value,
                    image: document.getElementById(`${className}-student-${i}-image`).value, // Note: This is a simplification
                    club: document.getElementById(`${className}-student-${i}-club`).value
                };
                studentData[className].push(student);
            }
        }
    
        localStorage.setItem('studentData', JSON.stringify(studentData));
        document.getElementById('saveMessage').textContent = "Student data saved successfully.";
    });

    function loadStudentData() {
        const savedData = JSON.parse(localStorage.getItem('studentResults')) || [];
        const tableBody = document.querySelector('#passwordTable tbody');
        tableBody.innerHTML = ''; // Clear existing data

        for (let data of savedData) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${data.name}</td>
                <td>${data.password}</td>
            `;
            tableBody.appendChild(row);
        }
    }

    function loadUnapprovedResults() {
        const savedResults = JSON.parse(localStorage.getItem('studentResults')) || [];
        resultsTable.innerHTML = ''; // Clear existing data

        for (let result of savedResults) {
            if (result.approved === false) { // Only display unapproved results
                const row = resultsTable.insertRow();
                const sessionCell = row.insertCell();
                const termCell = row.insertCell();
                const classCell = row.insertCell();
                const nameCell = row.insertCell();
                const deptCell = row.insertCell();
                const totalScoreCell = row.insertCell();
                const averageScoreCell = row.insertCell();
                const actionsCell = row.insertCell();

                sessionCell.textContent = result.session;
                termCell.textContent = result.term;
                classCell.textContent = result.className;
                nameCell.textContent = result.name;
                deptCell.textContent = result.department;
                totalScoreCell.textContent = result.totalScore;
                averageScoreCell.textContent = result.averageScore.toFixed(2);

                const approveButton = document.createElement('button');
                approveButton.textContent = 'Approve';
                approveButton.addEventListener('click', function() {
                    result.approved = true;
                    localStorage.setItem('studentResults', JSON.stringify(savedResults));
                    loadUnapprovedResults(); // Refresh the list
                    loadStudentData(); // Refresh the password table
                });

                const rejectButton = document.createElement('button');
                rejectButton.textContent = 'Reject';
                rejectButton.addEventListener('click', function() {
                    // Handle rejection (e.g., remove result, notify teacher, etc.)
                    // ... (Implementation for result rejection)
                    // For now, let's just remove the result from the list:
                    const index = savedResults.indexOf(result);
                    if (index > -1) {
                        savedResults.splice(index, 1);
                    }
                    localStorage.setItem('studentResults', JSON.stringify(savedResults));
                    loadUnapprovedResults(); // Refresh the list
                    loadStudentData(); // Also refresh the password table after rejecting a result
                });

                const editButton = document.createElement('button');
                editButton.textContent = 'Edit';
                editButton.setAttribute('data-result-index', savedResults.indexOf(result));
                editButton.addEventListener('click', function() {
                    const resultIndex = this.getAttribute('data-result-index');
                    handleEditResult(resultIndex);
                });

                actionsCell.appendChild(approveButton);
                actionsCell.appendChild(rejectButton);
                actionsCell.appendChild(editButton); // Add Edit button to the row
            }
        }
    }

    function loadAndDisplayClassCSVData() {
        const csvPreviewsContainer = document.getElementById('csvPreviews');
        csvPreviewsContainer.innerHTML = ''; // Clear previous previews

        const classes = ["Class 1", "Class 2", "Class 3", "Class 4", "Class 5", "Class 6", "Class 7", "Class 8", "Class 9", "Class 10", "Class 11", "Class 12"];
        for (const className of classes) {
            const csvData = localStorage.getItem(`csvData${className}`);
            if (csvData) {
                // Create a div to display the CSV data for each class
                const csvDataDiv = document.createElement('div');
                csvDataDiv.innerHTML = `<h3>${className}</h3><textarea readonly rows="10" cols="80">${csvData}</textarea>`;
                csvPreviewsContainer.appendChild(csvDataDiv);
            }
        }
    }

    document.getElementById('downloadAllCSV').addEventListener('click', function() {
        const classes = ["Class 1", "Class 2", "Class 3", "Class 4", "Class 5", "Class 6", "Class 7", "Class 8", "Class 9", "Class 10", "Class 11", "Class 12"];
        for (const className of classes) {
            const csvData = localStorage.getItem(`csvData${className}`);
            if (csvData) {
                downloadCSV(csvData, `${className}.csv`);
            }
        }
    });

    function downloadCSV(data, filename) {
        const blob = new Blob([data], { type: 'text/csv' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
    }

    function handleEditResult(resultIndex) {
        const savedResults = JSON.parse(localStorage.getItem('studentResults')) || [];
        const resultToEdit = savedResults[resultIndex];

        if (!resultToEdit) {
            console.error("Result to edit not found.");
            return;
        }

        // Redirect to result input page with data to edit
        localStorage.setItem('resultToEdit', JSON.stringify(resultToEdit));
        window.location.href = 'result-input.html';
    }
});