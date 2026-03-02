function showSignIn() {
    document.getElementById('signin-form').classList.remove('hidden');
    document.getElementById('signup-form').classList.add('hidden');
    document.getElementById('toggle-signin').classList.add('active');
    document.getElementById('toggle-signup').classList.remove('active');
}

function showSignUp() {
    document.getElementById('signin-form').classList.add('hidden');
    document.getElementById('signup-form').classList.remove('hidden');
    document.getElementById('toggle-signin').classList.remove('active');
    document.getElementById('toggle-signup').classList.add('active');
}

function handleSignIn(e) {
    e.preventDefault();

    const emailStr = document.getElementById('signin-email').value.trim();
    const passwordStr = document.getElementById('signin-password').value;

    if (
        (emailStr === 'maniyadhruvikgmail.com' || emailStr === 'maniyadhruvik@gmail.com') &&
        passwordStr === 'maniya@#07'
    ) {
        alert("Signed in successfully!");
        window.location.href = 'dashboard.html';
    } else {
        alert("Invalid Email or Password. Please try again.");
    }
}

function handleSignUp(e) {
    e.preventDefault();
    // In a real app, this would involve server creation
    alert("Account created! Please sign in.");
    showSignIn();
}
