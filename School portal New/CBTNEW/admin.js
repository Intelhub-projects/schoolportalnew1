const questionInput = document.getElementById('question');
const optionInputs = [
    document.getElementById('option1'),
    document.getElementById('option2'),
    document.getElementById('option3'),
    document.getElementById('option4')
];
const answerInput = document.getElementById('answer');
const addQuestionButton = document.getElementById('add-question');
const questionsContainer = document.getElementById('questions-container');
const questionSubjectSelect = document.getElementById('question-subject');

let subjects = ["Mathematics", "English Language", "Basic Science", "Social Studies", "Physics", "Chemistry", "Biology", "Accounting", "Business Studies", "Economics", "Literature", "Government", "History"];
let questions = JSON.parse(localStorage.getItem('questions')) || []; // Load from localStorage ONCE
renderQuestions();
populateSubjects();

function populateSubjects() {
    questionSubjectSelect.innerHTML = '<option value="">Select Subject</option>';
    subjects.forEach(subject => {
        const option = document.createElement('option');
        option.value = subject;
        option.textContent = subject;
        questionSubjectSelect.appendChild(option);
    });
}

addQuestionButton.addEventListener('click', () => {
    const selectedSubject = questionSubjectSelect.value;
    if (!selectedSubject) {
        alert("Please select a subject.");
        return;
    }

    const newQuestion = {
        question: questionInput.value,
        options: optionInputs.map(input => input.value),
        answer: answerInput.value,
        subject: selectedSubject
    };

    questions.push(newQuestion);
    localStorage.setItem('questions', JSON.stringify(questions)); // SAVE to localStorage HERE

    questionInput.value = '';
    optionInputs.forEach(input => input.value = '');
    answerInput.value = '';
    questionSubjectSelect.selectedIndex = 0; // Reset the select
    renderQuestions();
});

function renderQuestions() {
    questionsContainer.innerHTML = '';
    questions.forEach((question, index) => {
        const questionDiv = document.createElement('div');
        questionDiv.classList.add('question-item');
        questionDiv.innerHTML = `
            <p><strong>Q:</strong> ${question.question}</p>
            <ul>${question.options.map(option => `<li>${option}</li>`).join('')}</ul>
            <p><strong>A:</strong> ${question.answer}</p>
            <p><strong>Subject:</strong> ${question.subject}</p>
            <button class="delete-question" data-index="${index}">Delete</button>`;
        questionsContainer.appendChild(questionDiv);
    });

    const deleteButtons = document.querySelectorAll('.delete-question');
    deleteButtons.forEach(button => {
        button.addEventListener('click', () => {
            const indexToDelete = parseInt(button.dataset.index);
            questions.splice(indexToDelete, 1);
            localStorage.setItem('questions', JSON.stringify(questions)); // SAVE after deleting
            renderQuestions();
        });
    });
}