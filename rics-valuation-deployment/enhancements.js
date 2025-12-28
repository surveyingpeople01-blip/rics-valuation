// ============================================
// RICS Valuation - Enhanced Features
// Authentication, Status Management, PDF Export
// ============================================

// ============================================
// Authentication Functions
// ============================================

function logout() {
    localStorage.removeItem('ricsUserSession');
    sessionStorage.removeItem('ricsUserSession');
    window.location.href = 'login.html';
}

function getCurrentUser() {
    const session = localStorage.getItem('ricsUserSession') || sessionStorage.getItem('ricsUserSession');
    return session ? JSON.parse(session) : null;
}

// ============================================
// Status Management Functions
// ============================================

function migrateReportStatuses() {
    // Migrate old statuses to new ones
    const reportsJSON = localStorage.getItem('ricsValuationReports');
    if (!reportsJSON) return;

    const reports = JSON.parse(reportsJSON);
    let migrated = false;

    reports.forEach(report => {
        if (report.status === 'draft') {
            report.status = 'working';
            migrated = true;
        } else if (report.status === 'completed') {
            report.status = 'complete';
            migrated = true;
        }
    });

    if (migrated) {
        localStorage.setItem('ricsValuationReports', JSON.stringify(reports));
        console.log('Migrated report statuses to new format');
    }
}

function changeReportStatus(id, newStatus) {
    const reportsJSON = localStorage.getItem('ricsValuationReports');
    if (!reportsJSON) return;

    const reports = JSON.parse(reportsJSON);
    const report = reports.find(r => r.id === id);

    if (report) {
        report.status = newStatus;
        report.updatedAt = new Date().toISOString();
        localStorage.setItem('ricsValuationReports', JSON.stringify(reports));

        // Reload allReports array from localStorage to get fresh data
        if (typeof allReports !== 'undefined') {
            allReports = JSON.parse(localStorage.getItem('ricsValuationReports')) || [];
        }

        // Use filterReports if it exists (maintains current filter state)
        // Otherwise fall back to renderDashboard
        if (typeof filterReports === 'function') {
            filterReports();
        } else if (typeof renderDashboard === 'function') {
            renderDashboard();
        }
    }
}

function archiveReport(id) {
    changeReportStatus(id, 'archive');
}

// ============================================
// PDF Export from Dashboard
// ============================================

async function exportReportPDF(reportId) {
    const reportsJSON = localStorage.getItem('ricsValuationReports');
    if (!reportsJSON) {
        alert('No reports found');
        return;
    }

    const reports = JSON.parse(reportsJSON);
    const report = reports.find(r => r.id === reportId);

    if (!report) {
        alert('Report not found');
        return;
    }

    // Temporarily set valuationData to this report
    const originalData = window.valuationData ? { ...window.valuationData } : null;
    window.valuationData = report;

    // Generate PDF with validation bypass (since we're on dashboard, not in form)
    if (typeof generatePDF === 'function') {
        await generatePDF(true); // Pass true to bypass form validation
    } else {
        alert('PDF generation function not available');
    }

    // Restore original data
    if (originalData) {
        window.valuationData = originalData;
    } else {
        window.valuationData = null;
    }
}

// ============================================
// Initialize on page load
// ============================================

document.addEventListener('DOMContentLoaded', function () {
    // Migrate statuses on load
    migrateReportStatuses();

    // Initialize Flatpickr date range picker
    initializeDateRangePicker();

    console.log('Enhanced features loaded: Authentication, Status Management, PDF Export, Calendar, View Toggle');
});

// ============================================
// Date Range Picker with Flatpickr
// ============================================

let dateRangePickerInstance = null;
let selectedDateRange = null;

function initializeDateRangePicker() {
    const dateInput = document.getElementById('dateRangePicker');
    if (!dateInput || typeof flatpickr === 'undefined') return;

    dateRangePickerInstance = flatpickr(dateInput, {
        mode: 'range',
        dateFormat: 'M d, Y',
        onChange: function (selectedDates, dateStr, instance) {
            if (selectedDates.length === 2) {
                selectedDateRange = {
                    start: selectedDates[0],
                    end: selectedDates[1]
                };
            } else if (selectedDates.length === 1) {
                // Single date selected
                selectedDateRange = {
                    start: selectedDates[0],
                    end: selectedDates[0]
                };
            } else {
                selectedDateRange = null;
            }

            // Trigger filter
            if (typeof filterReports === 'function') {
                filterReports();
            }
        },
        onClose: function (selectedDates, dateStr, instance) {
            if (selectedDates.length === 0) {
                selectedDateRange = null;
                dateInput.placeholder = 'Dates';
                if (typeof filterReports === 'function') {
                    filterReports();
                }
            }
        }
    });
}

function getSelectedDateRange() {
    return selectedDateRange;
}

function clearDateRange() {
    if (dateRangePickerInstance) {
        dateRangePickerInstance.clear();
    }
    selectedDateRange = null;
    const dateInput = document.getElementById('dateRangePicker');
    if (dateInput) {
        dateInput.placeholder = 'Dates';
    }
}

// ============================================
// Single View Toggle Function
// ============================================

function toggleViewSingle() {
    // Get current view from the actual variable used by renderDashboard
    const v = typeof currentView !== 'undefined' ? currentView : (window.currentView || 'tile');
    const newView = v === 'tile' ? 'list' : 'tile';

    // Update both just in case
    if (typeof currentView !== 'undefined') {
        // Update the global variable if accessible
        try { currentView = newView; } catch (e) { }
    }
    window.currentView = newView;

    // Update button icon and label
    const viewIcon = document.getElementById('viewIcon');
    const viewLabel = document.getElementById('viewLabel');

    if (newView === 'tile') {
        if (viewIcon) viewIcon.textContent = '⊞';
        if (viewLabel) viewLabel.textContent = 'Tile';
    } else {
        if (viewIcon) viewIcon.textContent = '☰';
        if (viewLabel) viewLabel.textContent = 'List';
    }

    // Re-render dashboard
    if (typeof renderDashboard === 'function') {
        renderDashboard();
    }
}
