// Delete current report from within the valuation form
function deleteCurrentReport() {
    if (!currentValuationId) {
        alert('No report to delete');
        return;
    }

    if (confirm('Are you sure you want to delete this valuation report? This cannot be undone.')) {
        deleteReport(currentValuationId);
    }
}
