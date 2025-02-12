document.addEventListener('DOMContentLoaded', function() {
    const seniorDepartmentSelect = document.getElementById('senior-department');
    const seniorSubjectSelect = document.getElementById('senior-subject');
    const juniorSubjectSelect = document.getElementById('junior-subject');
    const startSeniorTestButton = document.getElementById('start-senior-test');
    const startJuniorTestButton = document.getElementById('start-junior-test');
    const testPage = document.getElementById('test-page');
    const questionArea = document.getElementById('question-area');
    const nextQuestionButton = document.getElementById('next-question');
    const submitTestButton = document.getElementById('submit-test');
    const resultsPage = document.getElementById('results-page');
    const scoreArea = document.getElementById('score-area');
    const saveResultsButton = document.getElementById('save-results');
    const testTimerDisplay = document.getElementById('test-timer');

    let currentQuestions = [];
    let currentQuestionIndex = 0;
    let score = 0;
    let timeLeft = 0;
    let timerInterval;

    // Initialize questionsData here
    let questionsData = {};

    // Load questions from local storage on page load
    loadQuestionsFromLocalStorage();

    // Get the Manage Questions link by its ID
    const manageQuestionsLink = document.getElementById('manage-questions');

    // Attach the event listener to the Manage Questions link
    if (manageQuestionsLink) {
        manageQuestionsLink.addEventListener('click', function(event) {
            event.preventDefault();
            // Check if the user is logged in as a teacher
            const loggedInTeacher = localStorage.getItem('loggedInTeacher');
            if (!loggedInTeacher) {
                alert('You must be logged in as a teacher to access this page.');
                window.location.href = 'teacher-login.html';
                return;
            }
            showManageQuestionsPage();
        });
    }

    // Event listeners for menu items
    document.querySelectorAll('.menu a').forEach(item => {
        item.addEventListener('click', function(event) {
            event.preventDefault();
            const pageId = this.getAttribute('data-page');
            showPage(pageId);
        });
    });

    // Event listeners for department and subject selection
    if(seniorDepartmentSelect){
        seniorDepartmentSelect.addEventListener('change', populateSeniorSubjects);
    }
    if(startSeniorTestButton){
        startSeniorTestButton.addEventListener('click', startSeniorTest);
    }
    if(startJuniorTestButton){
        startJuniorTestButton.addEventListener('click', startJuniorTest);
    }
    

    // Next question and submit test functionality
    if(nextQuestionButton){
        nextQuestionButton.addEventListener('click', nextQuestion);
    }
    
    if(submitTestButton){
        submitTestButton.addEventListener('click', submitTest);
    }
    
    // Save results functionality
    if(saveResultsButton){
        saveResultsButton.addEventListener('click', saveResults);
    }
    

    // Show home page on load
    showPage('home-page');

    function populateSeniorSubjects() {
        const selectedDepartment = seniorDepartmentSelect.value;
        seniorSubjectSelect.innerHTML = '<option value="">Select Subject</option>';

        if (questionsData[selectedDepartment]) {
            for (const subject in questionsData[selectedDepartment]) {
                const option = document.createElement('option');
                option.value = subject;
                option.textContent = subject;
                seniorSubjectSelect.appendChild(option);
            }
        }
    }

    function startSeniorTest() {
        const selectedSubject = seniorSubjectSelect.value;
        if (!selectedSubject) {
            alert('Please select a subject.');
            return;
        }

        const department = seniorDepartmentSelect.value;
        currentQuestions = questionsData[department][selectedSubject];
        startTest();
    }

    function startJuniorTest() {
        const selectedSubject = juniorSubjectSelect.value;
        if (!selectedSubject) {
            alert('Please select a subject.');
            return;
        }

        currentQuestions = questionsData['Junior'][selectedSubject];
        startTest();
    }

    function startTest() {
        currentQuestionIndex = 0;
        score = 0;
        timeLeft = 3600; // 1 hour in seconds

        startTimer(timeLeft, testTimerDisplay);
        loadQuestion();
        showPage('test-page');
    }

    function loadQuestion() {
        if (currentQuestionIndex < currentQuestions.length) {
            const question = currentQuestions[currentQuestionIndex];
            questionArea.innerHTML = '';

            const questionElement = document.createElement('p');
            questionElement.textContent = question.question;
            questionArea.appendChild(questionElement);

            if (question.type === 'multiple-choice') {
                for (let option of question.options) {
                    const optionButton = document.createElement('button');
                    optionButton.textContent = option;
                    optionButton.addEventListener('click', function() {
                        if (option === question.answer) {
                            score++;
                        }
                        nextQuestion();
                    });
                    questionArea.appendChild(optionButton);
                }
            } else if (question.type === 'true-false') {
                const trueButton = document.createElement('button');
                trueButton.textContent = 'True';
                trueButton.addEventListener('click', function() {
                    if (question.answer === 'True') {
                        score++;
                    }
                    nextQuestion();
                });
                questionArea.appendChild(trueButton);

                const falseButton = document.createElement('button');
                falseButton.textContent = 'False';
                falseButton.addEventListener('click', function() {
                    if (question.answer === 'False') {
                        score++;
                    }
                    nextQuestion();
                });
                questionArea.appendChild(falseButton);
            } else if (question.type === 'fill-in-the-blanks') {
                const inputField = document.createElement('input');
                inputField.type = 'text';
                questionArea.appendChild(inputField);

                const submitButton = document.createElement('button');
                submitButton.textContent = 'Submit Answer';
                submitButton.addEventListener('click', function() {
                    if (inputField.value.trim() === question.answer) {
                        score++;
                    }
                    nextQuestion();
                });
                questionArea.appendChild(submitButton);
            }

            nextQuestionButton.style.display = 'block';
            submitTestButton.style.display = 'none';
        } else {
            showResults();
        }
    }

    function nextQuestion() {
        currentQuestionIndex++;
        if (currentQuestionIndex < currentQuestions.length) {
            loadQuestion();
        } else {
            submitTestButton.style.display = 'block';
            nextQuestionButton.style.display = 'none';
        }
    }

    function submitTest() {
        clearInterval(timerInterval);
        showResults();
    }

    function showResults() {
        scoreArea.textContent = `Your score: ${score} out of ${currentQuestions.length}`;
        showPage('results-page');
    }

    function saveResults() {
        const results = {
            score: score,
            totalQuestions: currentQuestions.length,
            // Add other necessary data like student name, subject, etc.
        };

        localStorage.setItem('cbtResults', JSON.stringify(results));
        alert('Results saved successfully!');
    }

    function startTimer(duration, display) {
        clearInterval(timerInterval);
        timeLeft = duration;
        updateTimerDisplay();

        timerInterval = setInterval(function() {
            timeLeft--;
            if (timeLeft < 0) {
                clearInterval(timerInterval);
                alert("Time's up!");
                submitTest();
            } else {
                updateTimerDisplay();
            }
        }, 1000);
    }

    function updateTimerDisplay() {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        testTimerDisplay.textContent = `Time Remaining: <span class="math-inline">\{minutes\}\:</span>{seconds < 10 ? '0' : ''}${seconds}`;
    }

    function showPage(pageId) {
        const pages = document.querySelectorAll('.page');
        pages.forEach(page => {
            page.style.display = 'none';
        });
        document.getElementById(pageId).style.display = 'block';
    }
    function showManageQuestionsPage() {
        // Check if the user is logged in as a teacher
        const loggedInTeacher = localStorage.getItem('loggedInTeacher');
        if (!loggedInTeacher) {
            alert('You must be logged in as a teacher to access this page.');
            window.location.href = 'teacher-login.html';
            return;
        }
    
        // Show the "Manage Questions" page
        showPage('manage-questions-page');
    }
    
    // Update the event listener for the "Manage Questions" link
    document.addEventListener('DOMContentLoaded', () => {
        const manageQuestionsLink = document.getElementById('manage-questions');
        if (manageQuestionsLink) {
            manageQuestionsLink.addEventListener('click', function(event) {
                event.preventDefault();
                showManageQuestionsPage();
            });
        }
    });
    
    function addQuestionForm() {
        const questionFormContainer = document.getElementById('question-form-container');
    
        const questionForm = document.createElement('div');
        questionForm.className = 'question-form';
        questionForm.innerHTML = `
            <select class="question-type">
                <option value="multiple-choice">Multiple Choice</option>
                <option value="true-false">True/False</option>
                <option value="fill-in-the-blanks">Fill in the Blanks</option>
            </select>
            <input type="text" class="question-text" placeholder="Question text">
            <input type="text" class="option-a" placeholder="Option A">
            <input type="text" class="option-b" placeholder="Option B">
            <input type="text" class="option-c" placeholder="Option C">
            <input type="text" class="option-d" placeholder="Option D">
            <input type="text" class="correct-answer" placeholder="Correct answer (A, B, C, or D)">
            <button class="save-question">Save Question</button>
            <button class="remove-question">Remove Question</button>
        `;
    
        questionFormContainer.appendChild(questionForm);
        questionForm.querySelector('.save-question').addEventListener('click', function() {
            saveQuestion(questionForm);
        });
    
        questionForm.querySelector('.remove-question').addEventListener('click', function() {
            questionFormContainer.removeChild(questionForm);
        });
    }
    
    function saveQuestion(form) {
        const questionType = form.querySelector('.question-type').value;
        const questionText = form.querySelector('.question-text').value;
        const optionA = form.querySelector('.option-a')?.value || '';
        const optionB = form.querySelector('.option-b')?.value || '';
        const optionC = form.querySelector('.option-c')?.value || '';
        const optionD = form.querySelector('.option-d')?.value || '';
        const correctAnswer = form.querySelector('.correct-answer')?.value || '';
    
        if (!questionText || !correctAnswer) {
            alert("Please fill in all required fields for the question.");
            return;
        }
    
        const questionData = {
            type: questionType,
            question: questionText,
            options: [optionA, optionB, optionC, optionD].filter(option => option),
            answer: correctAnswer
        };
    
        // Retrieve the logged-in teacher's subject
        const loggedInTeacher = localStorage.getItem('loggedInTeacher');
        const teachers = JSON.parse(localStorage.getItem('teachers')) || {};
        const teacherSubject = teachers[loggedInTeacher] ? teachers[loggedInTeacher].subject : null;
    
        if (!teacherSubject) {
            alert("Teacher's subject not found. Please ensure you are logged in and have an assigned subject.");
            return;
        }
    
        // Determine if the question is for Junior or Senior based on the teacher's subject
        let category = 'Junior'; // Default to Junior
        if (['Science', 'Arts', 'Commercial'].includes(teacherSubject)) {
            category = teacherSubject; // Use department name for Senior subjects
        }
    
        // Save the question under the appropriate category and subject
        let questions = JSON.parse(localStorage.getItem('questionsData')) || {};
        if (!questions[category]) {
            questions[category] = {};
        }
        if (!questions[category][teacherSubject]) {
            questions[category][teacherSubject] = [];
        }
        questions[category][teacherSubject].push(questionData);
    
        localStorage.setItem('questionsData', JSON.stringify(questions));
    
        // Notify the teacher
        const questionMessage = document.getElementById('questionMessage');
        if (!questionMessage) {
            console.error('questionMessage element not found');
            return;
        }
        questionMessage.style.display = 'block';
        setTimeout(() => questionMessage.style.display = 'none', 3000);
    
        // Clear the form
        form.querySelectorAll('input, select').forEach(input => input.value = '');
    }
    
    // Event listener for the 'Add Question' button
    document.getElementById('add-question').addEventListener('click', addNewQuestionField);
});

const questionsData = {};

function loadQuestionsFromLocalStorage() {
    const storedQuestions = JSON.parse(localStorage.getItem('questionsData')) || {};
    
    // Check if there are questions for the 'Junior' category
    if (!storedQuestions['Junior']) {
        storedQuestions['Junior'] = {};
    }

    // Initialize default subjects for 'Junior' if they don't exist
    const defaultJuniorSubjects = ["Mathematics", "English", "Basic Science", "Basic Technology", 
                                  "Social Studies", "Civic Education", "Computer Studies", 
                                  "Physical and Health Education", "Agric Science", "Home Economics"];
    defaultJuniorSubjects.forEach(subject => {
        if (!storedQuestions['Junior'][subject]) {
            storedQuestions['Junior'][subject] = [];
        }
    });

    // Update the questionsData object with the loaded questions
    for (const department in storedQuestions) {
        if (!questionsData[department]) {
            questionsData[department] = {};
        }
        for (const subject in storedQuestions[department]) {
            questionsData[department][subject] = storedQuestions[department][subject];
        }
    }
}

// Function to get subjects by department
function getSubjectsByDepartment(department) {
    switch (department) {
        case 'Science':
            return ["Mathematics", "English Language", "Physics", "Chemistry", "Biology", "Further Mathematics", "Technical Drawing", "Geography"];
        case 'Arts':
            return ["Mathematics", "English Language", "Literature in English", "Government", "History", "Fine Arts", "Music", "French"];
        case 'Commercial':
            return ["Mathematics", "English Language", "Financial Accounting", "Commerce", "Economics", "Office Practice", "Insurance", "Book Keeping"];
        default:
            return [];
    }
}

// Function to populate the senior subjects dropdown
function populateSeniorSubjects() {
    const seniorDepartmentSelect = document.getElementById('senior-department');
    const seniorSubjectSelect = document.getElementById('senior-subject');
    seniorSubjectSelect.innerHTML = '<option value="">Select Subject</option>';

    const selectedDepartment = seniorDepartmentSelect.value;
    if (selectedDepartment && questionsData[selectedDepartment]) {
        for (const subject in questionsData[selectedDepartment]) {
            const option = document.createElement('option');
            option.value = subject;
            option.textContent = subject;
            seniorSubjectSelect.appendChild(option);
        }
    }
}

// Function to populate the junior subjects dropdown
function populateJuniorSubjects() {
    const juniorSubjectSelect = document.getElementById('junior-subject');
    juniorSubjectSelect.innerHTML = '<option value="">Select Subject</option>';

    if (questionsData['Junior']) {
        for (const subject in questionsData['Junior']) {
            const option = document.createElement('option');
            option.value = subject;
            option.textContent = subject;
            juniorSubjectSelect.appendChild(option);
        }
    }
}

// Event listener for changes in the senior department selection
document.getElementById('senior-department').addEventListener('change', populateSeniorSubjects);

// Initialize subjects for junior classes
populateJuniorSubjects();

// Modify the startSeniorTest and startJuniorTest functions to load questions for the selected subject
function startSeniorTest() {
    const selectedSubject = document.getElementById('senior-subject').value;
    if (!selectedSubject) {
        alert('Please select a subject.');
        return;
    }

    const department = document.getElementById('senior-department').value;
    currentQuestions = questionsData[department][selectedSubject];
    startTest();
}

function startJuniorTest() {
    const selectedSubject = document.getElementById('junior-subject').value;
    if (!selectedSubject) {
        alert('Please select a subject.');
        return;
    }

    currentQuestions = questionsData['Junior'][selectedSubject];
    startTest();
}

function startTest() {
    currentQuestionIndex = 0;
    score = 0;
    timeLeft = 3600; // 1 hour in seconds

    startTimer(timeLeft, document.getElementById('test-timer'));
    loadQuestion();
    showPage('test-page');
}

// Load question function remains the same as before

// Function to show a specific page
function showPage(pageId) {
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => {
        page.style.display = 'none';
    });
    document.getElementById(pageId).style.display = 'block';
}

// Call showPage to initially display the home page
showPage('home-page');

// Function to add a new question form field
function addNewQuestionField() {
    const questionFormContainer = document.getElementById('question-form-container');
    const questionForm = document.createElement('div');
    questionForm.className = 'question-form';
    questionForm.innerHTML = `
        <select class="question-type">
            <option value="multiple-choice">Multiple Choice</option>
            <option value="true-false">True/False</option>
            <option value="fill-in-the-blanks">Fill in the Blanks</option>
        </select>
        <input type="text" class="question-text" placeholder="Question text">
        <input type="text" class="option-a" placeholder="Option A">
        <input type="text" class="option-b" placeholder="Option B">
        <input type="text" class="option-c" placeholder="Option C">
        <input type="text" class="option-d" placeholder="Option D">
        <input type="text" class="correct-answer" placeholder="Correct answer (A, B, C, or D)">
        <button class="save-question">Save Question</button>
        <button class="remove-question">Remove Question</button>
    `;

    questionFormContainer.appendChild(questionForm);

    // Attach event listeners to the dynamically created buttons
    questionForm.querySelector('.save-question').addEventListener('click', function() {
        saveQuestion(questionForm);
    });

    questionForm.querySelector('.remove-question').addEventListener('click', function() {
        questionFormContainer.removeChild(questionForm);
    });
}

// Function to save a question
function saveQuestion(form) {
    const questionType = form.querySelector('.question-type').value;
    const questionText = form.querySelector('.question-text').value;
    const optionA = form.querySelector('.option-a')?.value || '';
    const optionB = form.querySelector('.option-b')?.value || '';
    const optionC = form.querySelector('.option-c')?.value || '';
    const optionD = form.querySelector('.option-d')?.value || '';
    const correctAnswer = form.querySelector('.correct-answer')?.value || '';

    if (!questionText || !correctAnswer) {
        alert("Please fill in all required fields for the question.");
        return;
    }

    const questionData = {
        type: questionType,
        question: questionText,
        options: [optionA, optionB, optionC, optionD].filter(option => option),
        answer: correctAnswer
    };

    // Retrieve the logged-in teacher's subject
    const loggedInTeacher = localStorage.getItem('loggedInTeacher');
    const teachers = JSON.parse(localStorage.getItem('teachers')) || {};
    const teacherSubject = teachers[loggedInTeacher] ? teachers[loggedInTeacher].subject : null;

    if (!teacherSubject) {
        alert("Teacher's subject not found. Please ensure you are logged in and have an assigned subject.");
        return;
    }

    // Determine if the question is for Junior or Senior based on the teacher's subject
    let category = 'Junior'; // Default to Junior
    if (['Science', 'Arts', 'Commercial'].includes(teacherSubject)) {
        category = teacherSubject; // Use department name for Senior subjects
    }

    // Save the question under the appropriate category and subject
    let questions = JSON.parse(localStorage.getItem('questionsData')) || {};
    if (!questions[category]) {
        questions[category] = {};
    }
    if (!questions[category][teacherSubject]) {
        questions[category][teacherSubject] = [];
    }
    questions[category][teacherSubject].push(questionData);

    localStorage.setItem('questionsData', JSON.stringify(questions));

    // Notify the teacher
    const questionMessage = document.getElementById('questionMessage');
    if (!questionMessage) {
        console.error('questionMessage element not found');
        return;
    }
    questionMessage.style.display = 'block';
    setTimeout(() => questionMessage.style.display = 'none', 3000);

    // Clear the form
    form.querySelectorAll('input, select').forEach(input => input.value = '');
}

// Event listener for the 'Add Question' button
if (document.getElementById('add-question')) {
    document.getElementById('add-question').addEventListener('click', addNewQuestionField);
}

// Function to check if a teacher is logged in
function isTeacherLoggedIn() {
    return localStorage.getItem('loggedInTeacher') !== null;
}

// Function to set up the admin login
function setupAdminLogin() {
    const adminLoginButton = document.getElementById('adminLogin');
    const adminLoginForm = document.getElementById('adminAuth');
    const adminContent = document.getElementById('adminContent');
    const correctAdminPassword = 'admin'; // Replace with your actual admin password

    if (adminLoginButton) {
        adminLoginButton.addEventListener('click', function() {
            const enteredPassword = document.getElementById('adminPassword').value;

            if (enteredPassword === correctAdminPassword) {
                adminLoginForm.style.display = 'none';
                adminContent.style.display = 'block';
                loadTeachers();
                // Show the manage questions section if in admin mode
                document.getElementById('manage-questions-section').style.display = 'block';
            } else {
                document.getElementById('loginMessage').textContent = "Incorrect admin password.";
            }
        });
    }
}

// Call this to set up the admin login process
setupAdminLogin();

// Ensure the 'manage-questions-section' is initially hidden if no teacher is logged in
document.getElementById('manage-questions-section').style.display = 'none';

// Update the function that handles teacher login to show the question management section
function handleTeacherLogin(username) {
    localStorage.setItem('loggedInTeacher', username);

    // Show the manage questions section for logged in teachers
    document.getElementById('manage-questions-section').style.display = 'block';

    // Redirect to the CBT home page or a specific teacher dashboard
    window.location.href = 'index.html';
}

// Modify the validateTeacherLogin function in teacher-login.js to use the new handler
function validateTeacherLogin(username, password) {
    const teachers = JSON.parse(localStorage.getItem('teachers')) || {};
    if (teachers[username] && teachers[username].password === password) {
        handleTeacherLogin(username);
        return true;
    }
    return false;
}

// Rest of the functions remain unchanged

// Update the function that handles teacher login to show the question management section
function handleTeacherLogin(username) {
    localStorage.setItem('loggedInTeacher', username);

    // Show the manage questions section for logged in teachers
    document.getElementById('manage-questions-section').style.display = 'block';

    // Redirect to the CBT home page or a specific teacher dashboard
    window.location.href = 'index.html';
}

// Modify the validateTeacherLogin function in teacher-login.js to use the new handler
function validateTeacherLogin(username, password) {
    const teachers = JSON.parse(localStorage.getItem('teachers')) || {};
    if (teachers[username] && teachers[username].password === password) {
        handleTeacherLogin(username);
        return true;
    }
    return false;
}