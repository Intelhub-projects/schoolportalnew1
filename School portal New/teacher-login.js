document.addEventListener('DOMContentLoaded', function() {
    const teacherLoginForm = document.getElementById('teacherLogin');
    const teacherLoginMessage = document.getElementById('teacherLoginMessage');

    document.getElementById('teacherLoginBtn').addEventListener('click', function() {
        const enteredUsername = document.getElementById('teacherUsername').value;
        const enteredPassword = document.getElementById('teacherPassword').value;

        if (validateTeacherLogin(enteredUsername, enteredPassword)) {
            // Set the logged-in teacher's username to local storage
            localStorage.setItem('loggedInTeacher', enteredUsername);

            // Redirect to the result input page (result-input.html) after successful login
            window.location.href = 'result-input.html';
        } else {
            teacherLoginMessage.textContent = "Invalid username or password.";
        }
    });
});

function validateTeacherLogin(username, password) {
    const teachers = JSON.parse(localStorage.getItem('teachers')) || {};
    return teachers[username] && teachers[username].password === password;
}