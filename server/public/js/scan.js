document.addEventListener('DOMContentLoaded', function() {
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const preview = document.getElementById('preview');
    const scanForm = document.getElementById('scanForm');
    const loading = document.querySelector('.loading');
    const scanButton = document.getElementById('scanButton');

    // Handle drag and drop
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = '#0d6efd';
    });

    dropZone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = '#ccc';
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = '#ccc';
        const files = e.dataTransfer.files;
        handleFiles(files);
    });

    // Handle click to upload
    dropZone.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
        handleFiles(e.target.files);
    });

    function handleFiles(files) {
        const file = files[0];
        if (!file) return;

        // Check file size (3MB limit)
        if (file.size > 3 * 1024 * 1024) {
            alert('File size exceeds 3MB limit');
            return;
        }

        // Check file type
        const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
        if (!validTypes.includes(file.type)) {
            alert('Invalid file type. Please upload PDF, JPG, JPEG, or PNG files only.');
            return;
        }

        // Preview image if it's an image file
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                preview.innerHTML = `<img src="${e.target.result}" class="preview-image" alt="Preview">`;
            };
            reader.readAsDataURL(file);
        } else {
            preview.innerHTML = '<p class="text-muted">PDF file selected</p>';
        }
    }

    // Handle form submission
    scanForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const file = fileInput.files[0];
        if (!file) {
            alert('Please select a file first');
            return;
        }

        // Get the authentication token from localStorage
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Please log in to continue');
            window.location.href = '/login';
            return;
        }

        const formData = new FormData();
        formData.append('image', file);
        formData.append('type', document.querySelector('input[name="invoiceType"]:checked').value);

        try {
            loading.style.display = 'block';
            scanButton.disabled = true;

            const response = await fetch('/api/scan-invoice', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (response.status === 401) {
                // Token expired or invalid
                localStorage.removeItem('token');
                alert('Your session has expired. Please log in again.');
                window.location.href = '/login';
                return;
            }

            const data = await response.json();

            if (data.success) {
                // Redirect to dashboard
                window.location.href = data.redirectUrl;
            } else {
                alert(data.message || 'Error scanning invoice');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error scanning invoice. Please try again.');
        } finally {
            loading.style.display = 'none';
            scanButton.disabled = false;
        }
    });
}); 