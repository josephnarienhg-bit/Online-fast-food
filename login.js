// Client-side login/register using localStorage
// Data shapes in localStorage:
// users => [{id: 'user1', password: '...'}, ...]
// currentUser => 'user1'

(function () {
    const $ = id => document.getElementById(id);
    const messageEl = $('message');
    const userIdEl = $('userId');
    const passwordEl = $('password');
    const loginBtn = $('loginBtn');
    const registerBtn = $('registerBtn');
    const showPwd = $('showPwd');

    function showMessage(text, type = 'error') {
        messageEl.textContent = text;
        messageEl.className = 'message ' + (type === 'success' ? 'success' : 'error');
        messageEl.style.display = 'block';
        setTimeout(() => {
            messageEl.style.display = 'none';
        }, 4000);
    }

    function getUsers() {
        try {
            return JSON.parse(localStorage.getItem('users') || '[]');
        } catch (e) {
            return [];
        }
    }

    function saveUsers(users) {
        localStorage.setItem('users', JSON.stringify(users));
    }

    function setCurrentUser(id) {
        localStorage.setItem('currentUser', id);
    }

    function clearFields() {
        userIdEl.value = '';
        passwordEl.value = '';
    }

    function register() {
        const id = userIdEl.value.trim();
        const pwd = passwordEl.value;

        // Validation
        if (!id || !pwd) {
            showMessage('Please enter username and password');
            return;
        }

        if (id.length < 3) {
            showMessage('Username must be at least 3 characters');
            return;
        }

        if (pwd.length < 6) {
            showMessage('Password must be at least 6 characters');
            return;
        }

        const users = getUsers();
        if (users.find(u => u.id === id)) {
            showMessage('Username already exists. Please choose another.');
            return;
        }

        users.push({ id: id, password: pwd });
        saveUsers(users);
        setCurrentUser(id);
        showMessage('Account created successfully! ✓', 'success');
        setTimeout(() => { window.location.href = 'index.html'; }, 900);
    }

    function login() {
        const id = userIdEl.value.trim();
        const pwd = passwordEl.value;

        if (!id || !pwd) {
            showMessage('Please enter username and password');
            return;
        }

        const users = getUsers();
        const found = users.find(u => u.id === id && u.password === pwd);
        if (!found) {
            showMessage('Invalid username or password');
            return;
        }

        setCurrentUser(id);
        showMessage('Welcome back! ✓', 'success');
        setTimeout(() => { window.location.href = 'index.html'; }, 700);
    }

    // Show/hide password toggle
    showPwd.addEventListener('change', () => {
        passwordEl.type = showPwd.checked ? 'text' : 'password';
    });

    // Login and Register button handlers
    loginBtn.addEventListener('click', login);
    registerBtn.addEventListener('click', register);

    // Enter key support for quick login
    [userIdEl, passwordEl].forEach(el => {
        el.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') login();
        });
    });
})();
