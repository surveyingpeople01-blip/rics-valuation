// Remove property photo
function removePropertyPhoto() {
    if (confirm('Are you sure you want to remove the property photo?')) {
        valuationData.photo = null;

        // Clear the file input
        const photoInput = document.getElementById('propertyPhoto');
        if (photoInput) {
            photoInput.value = '';
        }

        // Hide the preview
        const preview = document.getElementById('photoPreview');
        if (preview) {
            preview.style.display = 'none';
            preview.innerHTML = '';
        }

        console.log('Property photo removed');
    }
}
