document.addEventListener('DOMContentLoaded', () => {
    // Check authentication
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/';
        return;
    }

    // Get form elements
    const profileForm = document.getElementById('profileForm');
    const gstCheckbox = document.getElementById('isGstRegistered');
    const gstDetails = document.getElementById('gstDetails');
    const gstInput = document.getElementById('gstNumber');
    const currentLogo = document.getElementById('currentLogo');

    // Set GST number pattern
    if (gstInput) {
        gstInput.pattern = "^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$";
        gstInput.title = "Enter valid GST number (eg: 29ABCDE1234F1Z5)";
    }

    // Handle GST checkbox toggle
    if (gstCheckbox && gstDetails && gstInput) {
        gstCheckbox.addEventListener('change', function() {
            gstDetails.style.display = this.checked ? 'block' : 'none';
            gstInput.required = this.checked;
            
            if (!this.checked) {
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

    // Load user profile
    loadProfile();

    // Handle form submission
    if (profileForm) {
        profileForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await updateProfile(e);
        });
    }

    // Handle logout
    document.getElementById('logoutBtn')?.addEventListener('click', () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/';
    });
});

async function loadProfile() {
    try {
        const response = await fetch('/api/auth/profile', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (response.ok) {
            const user = await response.json();
            
            // Populate form fields
            document.getElementById('name').value = user.name || '';
            document.getElementById('email').value = user.email || '';
            document.getElementById('company').value = user.company || '';
            document.getElementById('address').value = user.address || '';
            document.getElementById('phone').value = user.phone || '';
            document.getElementById('website').value = user.website || '';
            document.getElementById('panNumber').value = user.panNumber || '';
            
            const gstCheckbox = document.getElementById('isGstRegistered');
            const gstDetails = document.getElementById('gstDetails');
            if (gstCheckbox && gstDetails) {
                gstCheckbox.checked = user.isGstRegistered || false;
                gstDetails.style.display = user.isGstRegistered ? 'block' : 'none';
                if (user.isGstRegistered) {
                    document.getElementById('gstNumber').value = user.gstNumber || '';
                }
            }

            // Show current logo if exists
            if (user.businessLogo) {
                document.getElementById('currentLogo').innerHTML = `
                    <img src="${user.businessLogo}" alt="Business Logo" style="max-width: 200px; margin-top: 10px;">
                `;
            }
        }
    } catch (error) {
        showAlert('Error loading profile: ' + error.message, 'danger');
    }
}

async function updateProfile(event) {
    event.preventDefault();
    
    try {
        const formData = new FormData(event.target);
        const profileData = {
            name: formData.get('name'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            address: formData.get('address'),
            company: formData.get('company'),
            website: formData.get('website'),
            panNumber: formData.get('panNumber'),
            isGstRegistered: formData.get('isGstRegistered') === 'on',
            gstNumber: formData.get('gstNumber')
        };

        const response = await fetch('/api/auth/profile', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(profileData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to update profile');
        }

        showAlert('Profile updated successfully', 'success');
    } catch (error) {
        showAlert('Error updating profile: ' + error.message, 'danger');
    }
}

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
