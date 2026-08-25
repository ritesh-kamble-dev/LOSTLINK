document.addEventListener("DOMContentLoaded", () => {
    localStorage.removeItem("loggedInUser");
    localStorage.removeItem("userType");
    localStorage.removeItem("userId");
    localStorage.removeItem("jwtToken");

    const btnLogin = document.getElementById("btnLogin");
    const btnSignup = document.getElementById("btnSignup");
    const loginForm = document.getElementById("loginForm");
    const signupForm = document.getElementById("signupForm");
    const loginError = document.getElementById("loginError");
    const signupError = document.getElementById("signupError");

    signupForm.querySelectorAll('input').forEach(input => input.value = '');
    loginForm.querySelectorAll('input').forEach(input => input.value = '');
    function showToast(message, type) {
        Swal.fire({
            toast: true,
            position: "top-end",
            icon: type,
            title: message,
            showConfirmButton: false,
            timer: 3500,
            timerProgressBar: true,
            didOpen: toast => {
                toast.addEventListener("mouseenter", Swal.stopTimer);
                toast.addEventListener("mouseleave", Swal.resumeTimer);
            }
        });
    }

    btnLogin.addEventListener("click", () => {
        signupForm.querySelectorAll('input').forEach(input => input.value = '');
        loginForm.classList.remove("hidden");
        signupForm.classList.add("hidden");
        btnLogin.disabled = true;
        btnSignup.disabled = false;
        signupError.textContent = "";

        loginForm.style.opacity = 0;
        setTimeout(() => {
            loginForm.style.opacity = 1;
        }, 200);
    });

    btnSignup.addEventListener("click", () => {
        loginForm.querySelectorAll('input').forEach(input => input.value = '');
        signupForm.classList.remove("hidden");
        loginForm.classList.add("hidden");
        btnSignup.disabled = true;
        btnLogin.disabled = false;
        loginError.textContent = "";

        signupForm.style.opacity = 0;
        setTimeout(() => {
            signupForm.style.opacity = 1;
        }, 200);
    });

    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = document.getElementById("loginEmail").value;
        const password = document.getElementById("loginPassword").value;

        loginError.textContent = "";

        try {
            const response = await fetch("/api/users/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            if (response.ok) {
                const user = await response.json(); 
                localStorage.setItem("loggedInUser", user.username); 
                localStorage.setItem("userType", user.userType);
                localStorage.setItem("userId", user.userId);
                localStorage.setItem("jwtToken", user.token);
                showToast("Login successful! Welcome back.", 'success');
                if(user.userType === "Admin")
                    window.location.href = "AdminPanel.html"; 
                else
                    window.location.href = "UserHome.html";
            } else {
                const errorData = await response.json();
                console.log(errorData);
                showToast("Log-In failed. " + errorData.error + "Please try again.", 'error');
            }
        } catch (error) {
            console.log(error);
            showToast("Server error. Please try again later.", 'error');
        }
    });

    signupForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const firstName = document.getElementById("fname").value;
        const lastName = document.getElementById("lname").value;
        const username = document.getElementById("username").value;
        const dateOfBirth = document.getElementById("dob").value;
        const gender = document.getElementById("gender").value;
        const email = document.getElementById("signupEmail").value;
        const password = document.getElementById("signupPassword").value;
        const confirmPassword = document.getElementById("confirmPassword").value;

        if (password !== confirmPassword) {
            showToast("Passwords do not match!", 'error');
            return;
        }

        try {
            const response = await fetch("/api/users/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ firstName, lastName, username, dateOfBirth, gender, email, password }),
            });

            if (response.ok) {
                showToast("Signup successful! Please log in.", 'success');
                btnLogin.click(); 
            } else {
                const errorData = await response.json();
                showToast("Signup failed: " + errorData.error + "\nPlease try again.", 'error');
            }
        } catch (error) {
            showToast("Server error. Please try again later.", 'error');
        }
    });

    btnLogin.click();
});
