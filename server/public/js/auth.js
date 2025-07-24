// Handle authentication related functionality
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    if (token && window.location.pathname === '/') {
        window.location.href = '/dashboard.html';
    }    // Login Form Handler
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault(); // Prevent form submission
            
            try {
                const email = document.getElementById('loginEmail').value;
                const password = document.getElementById('loginPassword').value;

                // Disable the submit button to prevent double submission
                const submitButton = loginForm.querySelector('button[type="submit"]');
                submitButton.disabled = true;
                submitButton.innerHTML = 'Logging in...';

                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();
                
                if (response.ok) {
                    // Store auth data
                    localStorage.setItem('token', data.token);
                    //console.log('token', data.token);
                    localStorage.setItem('user', JSON.stringify(data.user));
                    
                    // Redirect using window.location.replace to prevent back button from returning to login
                    window.location.replace('/dashboard.html');
                } else {
                    showAlert(data.msg || data.error || 'Login failed', 'danger');
                    // Re-enable the submit button
                    submitButton.disabled = false;
                    submitButton.innerHTML = 'Login';
                }
            } catch (error) {
                console.error('Login error:', error);
                showAlert('An error occurred. Please try again.', 'danger');
                // Re-enable the submit button
                const submitButton = loginForm.querySelector('button[type="submit"]');
                submitButton.disabled = false;
                submitButton.innerHTML = 'Login';
            }
        });
    }

    // Register Form Handler
    const registerForm = document.getElementById('registerForm');    // Handle GST checkbox toggle
    const gstCheckbox = document.getElementById('isGstRegistered');
    const gstDetails = document.getElementById('gstDetails');
    const gstInput = document.getElementById('registerGST');

    if (gstCheckbox && gstDetails && gstInput) {
        // Set pattern for GST number (format: 2 letters, 10 numbers, 1 letter, 1 number, 1 letter)
        gstInput.pattern = "^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$";
        gstInput.title = "Enter valid GST number (eg: 29ABCDE1234F1Z5)";
        
        gstCheckbox.addEventListener('change', function() {
            gstDetails.style.display = this.checked ? 'block' : 'none';
            gstInput.required = this.checked;
            
            if (this.checked) {
                gstInput.focus();
            } else {
                gstInput.value = '';
            }
        });

        // Add validation on GST input
        gstInput.addEventListener('input', function() {
            this.value = this.value.toUpperCase();
            if (this.value && !this.value.match(this.pattern)) {
                this.setCustomValidity('Please enter a valid GST number in the format: 29ABCDE1234F1Z5');
            } else {
                this.setCustomValidity('');
            }
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            try {
                const name = document.getElementById('registerName').value;
                const email = document.getElementById('registerEmail').value;
                const password = document.getElementById('registerPassword').value;
                const company = document.getElementById('registerCompany').value;
                const address = document.getElementById('registerAddress').value;
                const phone = document.getElementById('registerPhone').value;
                const website = document.getElementById('registerWebsite').value;
                const panNumber = document.getElementById('registerPAN').value;
                const isGstRegistered = document.getElementById('isGstRegistered').checked;
                const gstNumber = isGstRegistered ? document.getElementById('registerGST').value : null;
                
                // Handle logo file
                const logoInput = document.getElementById('registerLogo');
                let businessLogo = null;
                if (logoInput.files && logoInput.files[0]) {
                    const reader = new FileReader();
                    businessLogo = await new Promise((resolve) => {
                        reader.onload = (e) => resolve(e.target.result);
                        reader.readAsDataURL(logoInput.files[0]);
                    });
                }

                // Log the data being sent
                console.log('Sending registration data:', {
                    name,
                    email,
                    company,
                    address,
                    phone,
                    website,
                    panNumber,
                    isGstRegistered,
                    gstNumber,
                    hasLogo: !!businessLogo
                });

                const response = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ 
                        name, 
                        email, 
                        password,
                        company,
                        address,
                        phone,
                        website,
                        panNumber,
                        isGstRegistered,
                        gstNumber,
                        businessLogo
                    })
                });

                const data = await response.json();
                
                if (response.ok) {
                    showAlert('Registration successful! Please login.', 'success');
                    // Switch to login tab
                    const loginTab = document.getElementById('login-tab');
                    if (loginTab) {
                        loginTab.click();
                    }
                } else {
                    console.error('Registration failed:', data);
                    if (data.msg === 'User already exists') {
                        showAlert('User already exists. Please login.', 'warning');
                        // Switch to login tab
                        const loginTab = document.getElementById('login-tab');
                        if (loginTab) {
                            loginTab.click();
                        }
                        // Pre-fill the email in login form
                        const loginEmail = document.getElementById('loginEmail');
                        if (loginEmail) {
                            loginEmail.value = email;
                        }
                    } else if (data.details) {
                        showAlert(`Registration failed: ${data.error}. ${JSON.stringify(data.details)}`, 'danger');
                    } else {
                        showAlert(data.error || data.msg || 'Registration failed', 'danger');
                    }
                }
            } catch (error) {
                console.error('Registration error:', error);
                showAlert('An error occurred. Please try again.', 'danger');
            }
        });
    }
});

// Utility function to show alerts
function showAlert(message, type) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;

    const container = document.querySelector('.card-body');
    if (container) {
        container.insertBefore(alertDiv, container.firstChild);
    }

    // Auto dismiss after 5 seconds
    setTimeout(() => {
        alertDiv.remove();
    }, 5000);
}

async function handleLogin(event) {
    event.preventDefault();
    
    try {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Login failed');
        }

        localStorage.setItem('token', data.token);
        window.location.href = '/dashboard.html';
    } catch (error) {
        showAlert('Login failed: ' + error.message, 'danger');
    }
}

async function handleRegistration(event) {
    event.preventDefault();
    
    try {
        const formData = new FormData(event.target);
        const userData = {
            name: formData.get('name'),
            email: formData.get('email'),
            password: formData.get('password'),
            company: formData.get('company'),
            address: formData.get('address'),
            phone: formData.get('phone'),
            website: formData.get('website'),
            panNumber: formData.get('panNumber'),
            isGstRegistered: formData.get('isGstRegistered') === 'on',
            gstNumber: formData.get('gstNumber')
        };

        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Registration failed');
        }

        showAlert('Registration successful! Please login.', 'success');
        setTimeout(() => {
            window.location.href = '/';
        }, 2000);
    } catch (error) {
        showAlert('Registration failed: ' + error.message, 'danger');
    }
}
