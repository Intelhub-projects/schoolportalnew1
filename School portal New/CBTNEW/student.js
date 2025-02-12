const quizContainer = document.getElementById('quiz');
const resultsContainer = document.getElementById('results');
const submitButton = document.getElementById('submit');
const nextButton = document.getElementById('next-btn');
const timerDisplay = document.getElementById('time');

const urlParams = new URLSearchParams(window.location.search);
const selectedSubject = urlParams.get('subject');

let allQuestions = JSON.parse(localStorage.getItem('questions')) || [];
let quizData = allQuestions.filter(question => question.subject === selectedSubject);

let currentQuestionIndex = 0;
let numCorrect = 0;
let timerInterval;
let timeLeft;
let userAnswers = [];

function buildQuiz() {
    const output = [];
    quizData.forEach((currentQuestion, questionNumber) => {
        const options = [];
        for (let letter in currentQuestion.options) {
            options.push(`<label><input type="radio" name="question${questionNumber}" value="${currentQuestion.options[letter]}">${currentQuestion.options[letter]}</label>`);
        }
        output.push(`<div class="question" id="question${questionNumber}"><div class="question-text">${currentQuestion.question}</div><div class="options">${options.join('')}</div></div>`);
    });
    quizContainer.innerHTML = output.join('');
}

function showQuestion(index) {
    const questions = document.querySelectorAll('.question');
    questions.forEach(question => question.classList.remove('active'));
    if (questions[index]) {
        questions[index].classList.add('active');
        nextButton.style.display = 'block';
        startTimer();
    } else {
        showResults();
    }
}

function startTimer() {
    clearInterval(timerInterval);
    timeLeft = 60;
    timerDisplay.textContent = timeLeft;
    timerInterval = setInterval(() => {
        if (timeLeft > 0) {
            timeLeft--;
            timerDisplay.textContent = timeLeft;
        } else {
            clearInterval(timerInterval);
            showNextQuestion();
        }
    }, 1000);
}

function showNextQuestion() {
    clearInterval(timerInterval);
    const selectedAnswer = document.querySelector(`input[name="question${currentQuestionIndex}"]:checked`);
    if (selectedAnswer) {
        userAnswers.push(selectedAnswer.value);
        if (selectedAnswer.value === quizData[currentQuestionIndex].answer) {
            numCorrect++;
        }
    } else {
        userAnswers.push(null);
    }

    currentQuestionIndex++;
    if (currentQuestionIndex < quizData.length) {
        showQuestion(currentQuestionIndex);
    } else {
        showResults();
    }
}

function showResults() {
    clearInterval(timerInterval);
    nextButton.style.display = 'none';
    submitButton.style.display = 'none';

    let resultsHTML = `<h2>Quiz Results</h2>You got ${numCorrect} out of ${quizData.length} correct!<br><br>`;

    quizData.forEach((question, index) => {
        resultsHTML += `<div class="result-item">
            <p><strong>Q:</strong> ${question.question}</p>
            <p class="correct-answer"><strong>Correct Answer:</strong> ${question.answer}</p>`;
        if (userAnswers[index]) {
            resultsHTML += `<p class="user-answer ${userAnswers[index] === question.answer ? 'correct-answer' : 'incorrect-answer'}">Your Answer: ${userAnswers[index]}</p>`;
        } else {
            resultsHTML += `<p class="user-answer incorrect-answer">You did not answer this question.</p>`;
        }
        resultsHTML += `</div>`;
    });

    resultsContainer.innerHTML = resultsHTML;
    resultsContainer.style.display = 'block';

    const printButton = document.createElement('button');
    printButton.textContent = 'Print Results';
    printButton.addEventListener('click', () => {
        window.print();
    });
    resultsContainer.appendChild(printButton);

    if (typeof jsPDF !== 'undefined') {
        const pdfButton = document.createElement('button');
        pdfButton.textContent = 'Save as PDF';
        pdfButton.addEventListener('click', () => {
            const username = prompt("Please enter your name to save the PDF:", "Student Name");
            if (username) {
                const doc = new jsPDF('p', 'pt', 'a4');
                const content = resultsContainer;
                doc.html(content, {
                    callback: function (doc) {
                        doc.save(`${username}_results.pdf`);
                    },
                    margin: [40, 20, 40, 20],
                    autoPaging: 'text',
                    x: 10,
                    y: 10
                });
            } else {
                alert("Name is required to save as PDF");
            }
        });
        resultsContainer.appendChild(pdfButton);
    }
}

if (selectedSubject && quizData.length > 0) {
    buildQuiz();
    showQuestion(0);
    nextButton.addEventListener('click', showNextQuestion);
    submitButton.addEventListener('click', showResults);
} else {
    quizContainer.innerHTML = "<p>No questions found for this subject. Please return to the home page to select a different subject.</p>";
    submitButton.style.display = 'none';
    nextButton.style.display = 'none';
    timerDisplay.style.display = 'none';
}