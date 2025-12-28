// ============================================
// RICS Red Book Valuation Application
// ============================================

// Global state
let currentStep = 1;
let currentView = 'tile'; // 'tile' or 'list'
let currentValuationId = null;
let allReports = [];

let valuationData = {
    property: {},
    inspection: {},
    comparables: [],
    market: {},
    valuation: {},
    valuer: {}
};

// Initialize application
document.addEventListener('DOMContentLoaded', function () {
    loadReports();
    migrateReportsWithoutIds(); // Fix any reports missing IDs
    renderDashboard();
});

// ============================================
// Data Migration Functions
// ============================================

function migrateReportsWithoutIds() {
    let needsSave = false;

    allReports.forEach(report => {
        if (!report.id) {
            // Generate a unique ID for reports that don't have one
            report.id = `val_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            needsSave = true;
            console.log(`Assigned ID to report: ${report.id}`);
        }
    });

    if (needsSave) {
        localStorage.setItem('ricsValuationReports', JSON.stringify(allReports));
        console.log('Fixed reports without IDs');
    }
}


// ============================================
// Dashboard Functions
// ============================================

function startNewValuation() {
    currentValuationId = `val_${Date.now()}`;
    valuationData = {
        id: currentValuationId,
        property: {},
        inspection: {},
        comparables: [
            {
                id: 1,
                address: 'Example Property 1',
                postcode: 'SW1A 1AA',
                salePrice: 500000,
                saleDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                bedrooms: 3,
                propertyType: 'terraced',
                squareFeet: 1200,
                areaUnit: 'sqm',
                condition: 'good',
                adjustments: { size: 0, condition: 0, location: 0, timing: 0 }
            },
            {
                id: 2,
                address: 'Example Property 2',
                postcode: 'SW1A 2AA',
                salePrice: 525000,
                saleDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                bedrooms: 3,
                propertyType: 'terraced',
                squareFeet: 1250,
                areaUnit: 'sqm',
                condition: 'good',
                adjustments: { size: 0, condition: 0, location: 0, timing: 0 }
            },
            {
                id: 3,
                address: 'Example Property 3',
                postcode: 'SW1A 3AA',
                salePrice: 510000,
                saleDate: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                bedrooms: 3,
                propertyType: 'terraced',
                squareFeet: 1180,
                areaUnit: 'sqm',
                condition: 'average',
                adjustments: { size: 0, condition: 0, location: 0, timing: 0 }
            },
            {
                id: 4,
                address: 'Example Property 4',
                postcode: 'SW1A 4AA',
                salePrice: 535000,
                saleDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                bedrooms: 3,
                propertyType: 'semi-detached',
                squareFeet: 1300,
                areaUnit: 'sqm',
                condition: 'good',
                adjustments: { size: 0, condition: 0, location: 0, timing: 0 }
            },
            {
                id: 5,
                address: 'Example Property 5',
                postcode: 'SW1A 5AA',
                salePrice: 495000,
                saleDate: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                bedrooms: 2,
                propertyType: 'terraced',
                squareFeet: 1100,
                areaUnit: 'sqm',
                condition: 'average',
                adjustments: { size: 0, condition: 0, location: 0, timing: 0 }
            }
        ],
        market: {},
        valuation: {},
        valuer: {},
        status: 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    currentStep = 1;
    document.getElementById('dashboardView').classList.add('hidden');
    document.getElementById('valuationView').classList.remove('hidden');

    // Reset form fields EXCEPT the default values in Step 6
    document.querySelectorAll('input, select, textarea').forEach(field => {
        // Skip the Step 6 default fields
        if (field.id === 'valuerName' || field.id === 'valuerQualification' ||
            field.id === 'companyName' || field.id === 'companyAddress') {
            return; // Keep default values
        }

        if (field.type === 'checkbox' || field.type === 'radio') {
            field.checked = false;
        } else {
            field.value = '';
        }
    });

    initializeComparables();
    updateProgressBar();
    showStep(1);
}

function returnToDashboard() {
    saveDraft(); // Auto-save before leaving

    // Hide valuation view
    const valuationView = document.getElementById('valuationView');
    if (valuationView) {
        valuationView.classList.add('hidden');
    }

    // Show dashboard view
    const dashboardView = document.getElementById('dashboardView');
    if (dashboardView) {
        dashboardView.classList.remove('hidden');
    }

    // Reload and render
    loadReports();

    // Restore filters with a small delay to ensure DOM is ready
    setTimeout(() => {
        restoreDashboardFilters();
    }, 50);

    window.scrollTo(0, 0);
}

function loadReports() {
    const stored = localStorage.getItem('ricsValuationReports');
    allReports = stored ? JSON.parse(stored) : [];
}

function saveReport() {
    const existingIndex = allReports.findIndex(r => r.id === currentValuationId);

    valuationData.updatedAt = new Date().toISOString();

    if (existingIndex >= 0) {
        allReports[existingIndex] = valuationData;
    } else {
        allReports.push(valuationData);
    }

    try {
        localStorage.setItem('ricsValuationReports', JSON.stringify(allReports));
    } catch (e) {
        console.error('Failed to save report to localStorage:', e);
        // If storage quota exceeded, try saving without the photo
        if (e.name === 'QuotaExceededError' || e.code === 22) {
            alert('The photo is too large to save. Please use a smaller image or remove the photo.');
        }
    }
}

function loadReport(id) {
    const report = allReports.find(r => r.id === id);
    if (report) {
        currentValuationId = id;
        valuationData = JSON.parse(JSON.stringify(report)); // Deep copy

        document.getElementById('dashboardView').classList.add('hidden');
        document.getElementById('valuationView').classList.remove('hidden');

        populateFormFields();
        showStep(1);
        updateProgressBar();
    }
}

function deleteReport(id) {
    console.log('Delete report called with ID:', id);
    console.log('Current reports:', allReports);

    if (confirm('Are you sure you want to delete this valuation report?')) {
        const beforeCount = allReports.length;
        allReports = allReports.filter(r => r.id !== id);
        const afterCount = allReports.length;

        console.log(`Reports before: ${beforeCount}, after: ${afterCount}`);

        if (beforeCount === afterCount) {
            alert('Error: Report not found or could not be deleted');
            console.error('Report ID not found:', id);
            return;
        }

        localStorage.setItem('ricsValuationReports', JSON.stringify(allReports));
        console.log('Report deleted successfully');

        // Force hard reload to clear cache
        window.location.href = window.location.href.split('?')[0] + '?t=' + Date.now();
    }
}

// Delete current report from within the valuation form
function deleteCurrentReport() {
    if (!currentValuationId) {
        alert('No report to delete');
        return;
    }

    // Call deleteReport directly - it has its own confirmation dialog
    deleteReport(currentValuationId);
}

function renderDashboard(data) {
    const reports = data || allReports;
    const container = document.getElementById('reportsContainer');
    const emptyState = document.getElementById('emptyState');

    if (reports.length === 0) {
        container.innerHTML = '';
        emptyState.classList.remove('hidden');
        return;
    }

    emptyState.classList.add('hidden');

    if (currentView === 'tile') {
        container.className = 'reports-grid';
        container.innerHTML = reports.map(report => createReportCard(report)).join('');
    } else {
        container.className = 'reports-list';
        container.innerHTML = reports.map(report => createReportListItem(report)).join('');
    }
}

// Helper function to render dashboard with specific data (for filtering)
function renderDashboardWithData(filteredData) {
    renderDashboard(filteredData);
}

function createReportCard(report) {
    const address = report.property?.address || 'Untitled Property';
    const postcode = report.property?.postcode || '';
    const value = report.valuation?.estimatedValue || 0;
    const date = new Date(report.updatedAt).toLocaleDateString('en-GB');
    const status = report.status || 'draft';
    const propertyType = report.property?.type || 'N/A';
    const bedrooms = report.property?.bedrooms || 'N/A';

    return `
        <div class="report-card" onclick="loadReport('${report.id}')">
            <div class="report-card-header">
                <div>
                    <h3 class="report-title">${address}</h3>
                    <p class="report-postcode">${postcode}</p>
                </div>
                <select class="report-status-select ${status}" onclick="event.stopPropagation()" onchange="changeReportStatus('${report.id}', this.value)">
                    <option value="working" ${status === 'working' ? 'selected' : ''}>Working</option>
                    <option value="complete" ${status === 'complete' ? 'selected' : ''}>Complete</option>
                    <option value="archive" ${status === 'archive' ? 'selected' : ''}>Archive</option>
                </select>
            </div>
            <div class="report-details">
                <div class="report-detail-item">
                    <span class="report-detail-label">Type</span>
                    <span class="report-detail-value">${propertyType}</span>
                </div>
                <div class="report-detail-item">
                    <span class="report-detail-label">Bedrooms</span>
                    <span class="report-detail-value">${bedrooms}</span>
                </div>
            </div>
            <div class="report-value">${formatCurrency(value)}</div>
            <div class="report-date">Last updated: ${date}</div>
            <div class="report-actions" onclick="event.stopPropagation()">
                <button class="report-action-btn" onclick="loadReport('${report.id}')">Edit</button>
                <button class="report-action-btn" onclick="exportReportPDF('${report.id}')">Export PDF</button>
                <button class="report-action-btn delete" onclick="deleteReport('${report.id}')">Delete</button>
            </div>
        </div>
    `;
}

function createReportListItem(report) {
    const address = report.property?.address || 'Untitled Property';
    const postcode = report.property?.postcode || '';
    const value = report.valuation?.estimatedValue || 0;
    const date = new Date(report.updatedAt).toLocaleDateString('en-GB');
    const status = report.status || 'draft';

    return `
        <div class="report-list-item" onclick="loadReport('${report.id}')">
            <div class="report-list-property">
                <div class="report-list-title">${address}</div>
                <div class="report-list-postcode">${postcode}</div>
            </div>
            <div class="report-list-value">${formatCurrency(value)}</div>
            <div class="report-list-date">${date}</div>
            <select class="report-status-select ${status}" onclick="event.stopPropagation()" onchange="changeReportStatus('${report.id}', this.value)">
                <option value="working" ${status === 'working' ? 'selected' : ''}>Working</option>
                <option value="complete" ${status === 'complete' ? 'selected' : ''}>Complete</option>
                <option value="archive" ${status === 'archive' ? 'selected' : ''}>Archive</option>
            </select>
            <div class="report-list-actions" onclick="event.stopPropagation()">
                <button class="report-list-action-btn" onclick="loadReport('${report.id}')">Edit</button>
                <button class="report-list-action-btn" onclick="exportReportPDF('${report.id}')">Export PDF</button>
                <button class="report-list-action-btn delete" onclick="deleteReport('${report.id}')">Delete</button>
            </div>
        </div>
    `;
}

function toggleView(view) {
    currentView = view;
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-view="${view}"]`).classList.add('active');
    renderDashboard();
}

function filterReports() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const statusFilter = document.getElementById('statusFilter').value;
    const dateRange = typeof getSelectedDateRange === 'function' ? getSelectedDateRange() : null;

    // Save filter state to sessionStorage
    sessionStorage.setItem('dashboardFilters', JSON.stringify({
        search: searchTerm,
        status: statusFilter,
        dateRange: dateRange
    }));

    let filtered = allReports.slice(); // Create a copy, don't modify original

    // Search filter
    if (searchTerm) {
        filtered = filtered.filter(report => {
            const address = (report.property?.address || '').toLowerCase();
            const postcode = (report.property?.postcode || '').toLowerCase();
            const client = (report.valuer?.company || '').toLowerCase();
            return address.includes(searchTerm) || postcode.includes(searchTerm) || client.includes(searchTerm);
        });
    }

    // Date range filter (from calendar picker)
    if (dateRange && dateRange.start) {
        filtered = filtered.filter(report => {
            const reportDate = new Date(report.updatedAt || report.createdAt);
            const startDate = new Date(dateRange.start);
            const endDate = dateRange.end ? new Date(dateRange.end) : new Date(dateRange.start);

            // Set time to start/end of day for accurate comparison
            startDate.setHours(0, 0, 0, 0);
            endDate.setHours(23, 59, 59, 999);
            reportDate.setHours(12, 0, 0, 0); // Noon to avoid timezone issues

            return reportDate >= startDate && reportDate <= endDate;
        });
    }

    // Status filter
    if (statusFilter) {
        filtered = filtered.filter(report => report.status === statusFilter);
    }

    // Render with filtered data without modifying allReports
    renderDashboardWithData(filtered);
}

// Restore dashboard filters when returning from a report
function restoreDashboardFilters() {
    const savedFilters = sessionStorage.getItem('dashboardFilters');
    if (savedFilters) {
        try {
            const filters = JSON.parse(savedFilters);

            // Restore search
            if (filters.search && document.getElementById('searchInput')) {
                document.getElementById('searchInput').value = filters.search;
            }

            // Restore status filter
            if (filters.status && document.getElementById('statusFilter')) {
                document.getElementById('statusFilter').value = filters.status;
            }

            // Restore date range if available
            if (filters.dateRange && typeof dateRangePickerInstance !== 'undefined' && dateRangePickerInstance) {
                // Flatpickr will be restored by the date picker itself
            }

            // Re-apply filters by calling filterReports
            setTimeout(() => {
                if (typeof filterReports === 'function') {
                    filterReports();
                }
            }, 100);
        } catch (e) {
            console.error('Error restoring filters:', e);
        }
    } else {
        // No saved filters, just render dashboard normally
        renderDashboard();
    }
}

// ============================================
// Navigation Functions
// ============================================

function nextStep(step) {
    // Validation disabled - allow free navigation through all steps
    // if (!validateStep(step)) {
    //     return;
    // }

    saveStepData(step);

    if (step === 4) {
        // Only calculate if in automatic mode
        if (!valuationData.valuation || valuationData.valuation.mode !== 'manual') {
            calculateValuation();
        }
    }

    if (step === 5) {
        populateReviewSummary();
    }

    currentStep = step + 1;
    showStep(currentStep);
    updateProgressBar();
    window.scrollTo(0, 0);
}

function previousStep(step) {
    currentStep = step - 1;
    showStep(currentStep);
    updateProgressBar();
    window.scrollTo(0, 0);
}

function goToStep(stepNumber) {
    // Save current step data before navigating
    saveStepData(currentStep);

    // Jump directly to the clicked step
    currentStep = stepNumber;
    showStep(currentStep);
    updateProgressBar();
    window.scrollTo(0, 0);
}

function showStep(stepNumber) {
    document.querySelectorAll('.form-section').forEach(section => {
        section.classList.remove('active');
    });
    const stepElement = document.getElementById(`step${stepNumber}`);
    if (stepElement) {
        stepElement.classList.add('active');

        // Restore valuation mode when showing Step 5
        if (stepNumber === 5 && valuationData.valuation?.mode) {
            toggleValuationMode(valuationData.valuation.mode);
        }
    } else {
        console.error(`Step ${stepNumber} not found`);
    }
}

function updateProgressBar() {
    const progressSteps = document.querySelectorAll('.progress-step');
    const progressFill = document.getElementById('progressFill');

    progressSteps.forEach((step, index) => {
        const stepNumber = index + 1;
        step.classList.remove('active', 'completed');

        if (stepNumber < currentStep) {
            step.classList.add('completed');
        } else if (stepNumber === currentStep) {
            step.classList.add('active');
        }
    });

    const progressPercentage = ((currentStep - 1) / 5) * 100;
    progressFill.style.width = `${progressPercentage}%`;
}

// ============================================
// Validation Functions
// ============================================

function validateStep(step) {
    const stepElement = document.getElementById(`step${step}`);
    if (!stepElement) return true;

    const requiredFields = stepElement.querySelectorAll('[required]');
    let isValid = true;

    requiredFields.forEach(field => {
        if (!field.value || !field.value.trim()) {
            field.classList.add('error');
            isValid = false;
        } else {
            field.classList.remove('error');
        }
    });

    if (step === 3 && valuationData.comparables.filter(c => c.salePrice > 0).length < 3) {
        alert('Please add at least 3 comparable properties with sale prices for accurate valuation.');
        isValid = false;
    }

    // Step 5: Valuation validation
    if (step === 5) {
        const mode = valuationData.valuation?.mode || 'automatic';

        if (!valuationData.valuation || !valuationData.valuation.estimatedValue) {
            if (mode === 'manual') {
                alert('Please enter a manual valuation amount and range.');
            } else {
                alert('Please calculate the valuation or switch to manual mode to enter your own valuation.');
            }
            return false;
        }

        // Validate manual mode inputs
        if (mode === 'manual') {
            if (!valuationData.valuation.lowerRange || !valuationData.valuation.upperRange) {
                alert('Please enter both lower and upper range values for your manual valuation.');
                return false;
            }
            if (valuationData.valuation.lowerRange >= valuationData.valuation.estimatedValue ||
                valuationData.valuation.upperRange <= valuationData.valuation.estimatedValue) {
                alert('The valuation range should have the lower value below and upper value above the estimated value.');
                return false;
            }
        }
    }

    if (!isValid) {
        alert('Please fill in all required fields before proceeding.');
    }

    return isValid;
}

// ============================================
// Data Management Functions
// ============================================

function saveStepData(step) {
    switch (step) {
        case 1:
            valuationData.property = {
                address: document.getElementById('propertyAddress').value,
                postcode: document.getElementById('postcode').value,
                borough: document.getElementById('borough').value,
                type: document.getElementById('propertyType').value,
                tenure: document.getElementById('tenure').value,
                bedrooms: parseInt(document.getElementById('propertyBedrooms').value) || 0,
                bathrooms: parseInt(document.getElementById('bathrooms').value) || 0,
                receptionRooms: parseInt(document.getElementById('receptionRooms').value) || 0,
                area: parseInt(document.getElementById('propertyArea').value) || 0,
                areaUnit: document.getElementById('propertyAreaUnit').value,
                floorArea: parseInt(document.getElementById('floorArea').value) || 0,
                floorAreaUnit: document.getElementById('floorAreaUnit').value,
                yearBuilt: document.getElementById('yearBuilt').value,
                condition: document.getElementById('propertyCondition').value
            };
            break;

        case 2:
            valuationData.inspection = {
                inspectionDate: document.getElementById('inspectionDate').value,
                valuationDate: document.getElementById('valuationDate').value,
                inspectionType: document.getElementById('inspectionType').value,
                limitations: document.getElementById('inspectionLimitations').value,
                purpose: document.getElementById('valuationPurpose').value,
                basis: document.getElementById('valuationBasis').value,
                assumptions: document.getElementById('assumptions').value
            };
            break;

        case 3:
            // Comparables are saved in real-time
            break;

        case 4:
            valuationData.market = {
                conditions: document.getElementById('marketConditions').value,
                trend: document.getElementById('marketTrend').value,
                locationQuality: document.getElementById('locationQuality').value,
                transportLinks: document.getElementById('transportLinks').value,
                amenities: document.getElementById('localAmenities').value,
                commentary: document.getElementById('marketCommentary').value
            };
            break;

        case 5:
            valuationData.valuation.notes = document.getElementById('valuationNotes').value;
            break;

        case 6:
            valuationData.valuer = {
                name: document.getElementById('valuerName').value,
                qualification: document.getElementById('valuerQualification').value,
                company: document.getElementById('companyName').value,
                companyAddress: document.getElementById('companyAddress').value
            };
            break;
    }

    saveDraft();
}

function saveDraft() {
    saveReport();
    console.log('Draft saved successfully');
}

function populateFormFields() {
    // Property details
    if (valuationData.property) {
        const p = valuationData.property;
        setFieldValue('propertyAddress', p.address);
        setFieldValue('postcode', p.postcode);
        setFieldValue('borough', p.borough);
        setFieldValue('propertyType', p.type);
        setFieldValue('tenure', p.tenure);
        setFieldValue('propertyBedrooms', p.bedrooms);
        setFieldValue('bathrooms', p.bathrooms);
        setFieldValue('receptionRooms', p.receptionRooms);
        setFieldValue('propertyArea', p.area);
        setFieldValue('propertyAreaUnit', p.areaUnit);
        setFieldValue('floorArea', p.floorArea);
        setFieldValue('floorAreaUnit', p.floorAreaUnit);
        setFieldValue('yearBuilt', p.yearBuilt);
        setFieldValue('propertyCondition', p.condition);
    }

    // Inspection details
    if (valuationData.inspection) {
        const i = valuationData.inspection;
        setFieldValue('inspectionDate', i.inspectionDate);
        setFieldValue('valuationDate', i.valuationDate);
        setFieldValue('inspectionType', i.inspectionType);
        setFieldValue('inspectionLimitations', i.limitations);
        setFieldValue('valuationPurpose', i.purpose);
        setFieldValue('valuationBasis', i.basis);
        setFieldValue('assumptions', i.assumptions);
    }

    // Market analysis
    if (valuationData.market) {
        const m = valuationData.market;
        setFieldValue('marketConditions', m.conditions);
        setFieldValue('marketTrend', m.trend);
        setFieldValue('locationQuality', m.locationQuality);
        setFieldValue('transportLinks', m.transportLinks);
        setFieldValue('localAmenities', m.amenities);
        setFieldValue('marketCommentary', m.commentary);
    }

    // Valuer details
    if (valuationData.valuer) {
        const v = valuationData.valuer;
        setFieldValue('valuerName', v.name);
        setFieldValue('valuerQualification', v.qualification);
        setFieldValue('companyName', v.company);
        setFieldValue('companyAddress', v.companyAddress);
    }

    // Comparables
    if (valuationData.comparables && valuationData.comparables.length > 0) {
        renderComparables();
    }

    // Valuation notes
    if (valuationData.valuation && valuationData.valuation.notes) {
        setFieldValue('valuationNotes', valuationData.valuation.notes);
    }
}

function setFieldValue(id, value) {
    const field = document.getElementById(id);
    if (field && value !== undefined && value !== null && value !== '') {
        field.value = value;
    }
}

// ============================================
// Comparable Properties Management
// ============================================

let comparableCount = 0;

function initializeComparables() {
    if (valuationData.comparables.length === 0) {
        // Add 3 empty comparables by default
        for (let i = 0; i < 3; i++) {
            addComparable();
        }
    } else {
        comparableCount = valuationData.comparables.length;
        renderComparables();
    }
}

function addComparable() {
    comparableCount++;
    const id = `comp${comparableCount}`;

    const comparable = {
        id: id,
        address: '',
        salePrice: 0,
        saleDate: '',
        floorArea: 0,
        bedrooms: 0,
        condition: '',
        adjustments: {
            size: 0,
            condition: 0,
            location: 0,
            time: 0
        }
    };

    valuationData.comparables.push(comparable);
    renderComparables();
}

function removeComparable(id) {
    valuationData.comparables = valuationData.comparables.filter(comp => comp.id !== id);
    renderComparables();
    saveDraft();
}

function renderComparables() {
    const container = document.getElementById('comparablesList');
    if (!container) return;

    container.innerHTML = '';

    valuationData.comparables.forEach((comp, index) => {
        const compHTML = `
            <div class="comparable-item" data-id="${comp.id}">
                <div class="comparable-header">
                    <span class="comparable-number">Comparable ${index + 1}</span>
                    ${valuationData.comparables.length > 3 ? `<button type="button" class="btn-remove" onclick="removeComparable('${comp.id}')">Remove</button>` : ''}
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label>Property Address</label>
                        <input type="text" class="comp-address" data-id="${comp.id}" value="${comp.address || ''}" 
                               onchange="updateComparable('${comp.id}', 'address', this.value)" 
                               placeholder="Full address">
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label>Sale Price (Â£)</label>
                        <input type="number" class="comp-price" data-id="${comp.id}" value="${comp.salePrice || ''}" 
                               onchange="updateComparable('${comp.id}', 'salePrice', parseFloat(this.value))" 
                               placeholder="0" min="0">
                    </div>
                    <div class="form-group">
                        <label>Sale Date</label>
                        <input type="date" class="comp-date" data-id="${comp.id}" value="${comp.saleDate || ''}" 
                               onchange="updateComparable('${comp.id}', 'saleDate', this.value)">
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label>Floor Area</label>
                        <div style="display: flex; gap: 10px;">
                            <input type="number" class="comp-area" data-id="${comp.id}" value="${comp.floorArea || ''}" 
                                   onchange="updateComparable('${comp.id}', 'floorArea', parseInt(this.value))" 
                                   placeholder="0" min="0" style="flex: 1;">
                            <select class="comp-area-unit" data-id="${comp.id}" 
                                    onchange="updateComparable('${comp.id}', 'areaUnit', this.value)" 
                                    style="width: 100px;">
                                <option value="sqm" ${comp.areaUnit === 'sqm' || !comp.areaUnit ? 'selected' : ''}>sq m</option>
                                <option value="sqft" ${comp.areaUnit === 'sqft' ? 'selected' : ''}>sq ft</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Bedrooms</label>
                        <input type="number" class="comp-beds" data-id="${comp.id}" value="${comp.bedrooms || ''}" 
                               onchange="updateComparable('${comp.id}', 'bedrooms', parseInt(this.value))" 
                               placeholder="0" min="0">
                    </div>
                    <div class="form-group">
                        <label>Condition</label>
                        <select class="comp-condition" data-id="${comp.id}" 
                                onchange="updateComparable('${comp.id}', 'condition', this.value)">
                            <option value="">Select</option>
                            <option value="Excellent" ${comp.condition === 'Excellent' ? 'selected' : ''}>Excellent</option>
                            <option value="Good" ${comp.condition === 'Good' ? 'selected' : ''}>Good</option>
                            <option value="Fair" ${comp.condition === 'Fair' ? 'selected' : ''}>Fair</option>
                            <option value="Poor" ${comp.condition === 'Poor' ? 'selected' : ''}>Poor</option>
                        </select>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label>Size Adjustment (%)</label>
                        <input type="number" class="comp-adj-size" data-id="${comp.id}" 
                               value="${comp.adjustments?.size || 0}" 
                               onchange="updateComparableAdjustment('${comp.id}', 'size', parseFloat(this.value))" 
                               placeholder="0" step="0.1">
                    </div>
                    <div class="form-group">
                        <label>Condition Adjustment (%)</label>
                        <input type="number" class="comp-adj-condition" data-id="${comp.id}" 
                               value="${comp.adjustments?.condition || 0}" 
                               onchange="updateComparableAdjustment('${comp.id}', 'condition', parseFloat(this.value))" 
                               placeholder="0" step="0.1">
                    </div>
                    <div class="form-group">
                        <label>Location Adjustment (%)</label>
                        <input type="number" class="comp-adj-location" data-id="${comp.id}" 
                               value="${comp.adjustments?.location || 0}" 
                               onchange="updateComparableAdjustment('${comp.id}', 'location', parseFloat(this.value))" 
                               placeholder="0" step="0.1">
                    </div>
                    <div class="form-group">
                        <label>Time Adjustment (%)</label>
                        <input type="number" class="comp-adj-time" data-id="${comp.id}" 
                               value="${comp.adjustments?.time || 0}" 
                               onchange="updateComparableAdjustment('${comp.id}', 'time', parseFloat(this.value))" 
                               placeholder="0" step="0.1">
                    </div>
                </div>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', compHTML);
    });
}

function updateComparable(id, field, value) {
    const comparable = valuationData.comparables.find(comp => comp.id === id);
    if (comparable) {
        comparable[field] = value;
        saveDraft();
    }
}

function updateComparableAdjustment(id, field, value) {
    const comparable = valuationData.comparables.find(comp => comp.id === id);
    if (comparable) {
        if (!comparable.adjustments) {
            comparable.adjustments = { size: 0, condition: 0, location: 0, time: 0 };
        }
        comparable.adjustments[field] = value || 0;
        saveDraft();
    }
}

// ============================================
// Valuation Mode Functions
// ============================================

function toggleValuationMode(mode) {
    // Update button states
    const autoBtn = document.getElementById('autoModeBtn');
    const manualBtn = document.getElementById('manualModeBtn');
    const autoContent = document.getElementById('automaticModeContent');
    const manualContent = document.getElementById('manualModeContent');

    if (mode === 'automatic') {
        autoBtn.classList.add('active');
        manualBtn.classList.remove('active');
        autoContent.classList.remove('hidden');
        manualContent.classList.add('hidden');

        // Initialize valuation mode if not set
        if (!valuationData.valuation) {
            valuationData.valuation = {};
        }
        valuationData.valuation.mode = 'automatic';

        // Recalculate if comparables exist
        if (valuationData.comparables && valuationData.comparables.length > 0) {
            calculateValuation();
        }
    } else {
        autoBtn.classList.remove('active');
        manualBtn.classList.add('active');
        autoContent.classList.add('hidden');
        manualContent.classList.remove('hidden');

        // Initialize valuation mode
        if (!valuationData.valuation) {
            valuationData.valuation = {};
        }
        valuationData.valuation.mode = 'manual';

        // Populate manual inputs if valuation exists
        if (valuationData.valuation.estimatedValue) {
            document.getElementById('manualValuation').value = valuationData.valuation.estimatedValue;
            document.getElementById('manualLowerRange').value = valuationData.valuation.lowerRange;
            document.getElementById('manualUpperRange').value = valuationData.valuation.upperRange;
            updateManualValuation();
        }
    }

    saveDraft();
}

function updateManualValuation() {
    const manualValue = parseFloat(document.getElementById('manualValuation').value) || 0;
    const lowerRange = parseFloat(document.getElementById('manualLowerRange').value) || 0;
    const upperRange = parseFloat(document.getElementById('manualUpperRange').value) || 0;

    // Update display
    document.getElementById('manualValuationAmount').textContent = formatCurrency(manualValue);
    document.getElementById('manualValuationRange').textContent =
        `Range: ${formatCurrency(lowerRange)} - ${formatCurrency(upperRange)}`;

    // Save to valuationData
    if (!valuationData.valuation) {
        valuationData.valuation = {};
    }

    valuationData.valuation.mode = 'manual';
    valuationData.valuation.estimatedValue = manualValue;
    valuationData.valuation.lowerRange = lowerRange;
    valuationData.valuation.upperRange = upperRange;

    saveDraft();
}


// ============================================
// Valuation Calculation
// ============================================

function calculateValuation() {
    const comparables = valuationData.comparables.filter(comp => comp.salePrice > 0);

    if (comparables.length === 0) {
        // Skip calculation if no comparables - allow navigation
        console.log('No comparables added yet - skipping automatic calculation');
        return;
    }

    let adjustedValues = [];

    comparables.forEach(comp => {
        const basePrice = comp.salePrice;
        const totalAdjustment = (comp.adjustments?.size || 0) +
            (comp.adjustments?.condition || 0) +
            (comp.adjustments?.location || 0) +
            (comp.adjustments?.time || 0);

        const adjustedPrice = basePrice * (1 + totalAdjustment / 100);
        adjustedValues.push(adjustedPrice);
    });

    // Calculate average adjusted value
    const averageValue = adjustedValues.reduce((a, b) => a + b, 0) / adjustedValues.length;

    // Apply market condition adjustments
    let marketAdjustment = 1.0;

    switch (valuationData.market.conditions) {
        case 'Strong':
            marketAdjustment = 1.05;
            break;
        case 'Weak':
            marketAdjustment = 0.95;
            break;
        default:
            marketAdjustment = 1.0;
    }

    switch (valuationData.market.locationQuality) {
        case 'Prime':
            marketAdjustment *= 1.1;
            break;
        case 'Good':
            marketAdjustment *= 1.05;
            break;
        case 'Below Average':
            marketAdjustment *= 0.95;
            break;
    }

    const finalValue = Math.round(averageValue * marketAdjustment);
    const lowerRange = Math.round(finalValue * 0.95);
    const upperRange = Math.round(finalValue * 1.05);

    valuationData.valuation = {
        estimatedValue: finalValue,
        lowerRange: lowerRange,
        upperRange: upperRange,
        comparableCount: comparables.length,
        averageComparable: Math.round(averageValue),
        marketAdjustment: marketAdjustment,
        notes: valuationData.valuation?.notes || ''
    };

    displayValuation();
    saveDraft();
}

function displayValuation() {
    const val = valuationData.valuation;

    const amountEl = document.getElementById('valuationAmount');
    const rangeEl = document.getElementById('valuationRange');

    if (amountEl) amountEl.textContent = formatCurrency(val.estimatedValue);
    if (rangeEl) rangeEl.textContent = `Range: ${formatCurrency(val.lowerRange)} - ${formatCurrency(val.upperRange)}`;

    const summaryHTML = `
        <div class="summary-card">
            <div class="summary-label">Number of Comparables</div>
            <div class="summary-value">${val.comparableCount}</div>
        </div>
        <div class="summary-card">
            <div class="summary-label">Average Comparable Value</div>
            <div class="summary-value">${formatCurrency(val.averageComparable)}</div>
        </div>
        <div class="summary-card">
            <div class="summary-label">Market Adjustment</div>
            <div class="summary-value">${((val.marketAdjustment - 1) * 100).toFixed(1)}%</div>
        </div>
        <div class="summary-card">
            <div class="summary-label">Price per sq ft</div>
            <div class="summary-value">${formatCurrency(Math.round(val.estimatedValue / valuationData.property.floorArea))}</div>
        </div>
    `;

    const summaryEl = document.getElementById('calculationSummary');
    if (summaryEl) summaryEl.innerHTML = summaryHTML;
}

// ============================================
// Review Summary
// ============================================

function populateReviewSummary() {
    const p = window.valuationData?.property || valuationData.property;
    const i = window.valuationData?.inspection || valuationData.inspection;
    const v = window.valuationData?.valuation || valuationData.valuation;

    const summaryHTML = `
        <div class="card">
            <div class="card-header">
                <h3 class="card-title">Property Information</h3>
            </div>
            <p><strong>Address:</strong> ${p.address}, ${p.postcode}</p>
            <p><strong>Borough:</strong> ${p.borough}</p>
            <p><strong>Type:</strong> ${p.type} | <strong>Tenure:</strong> ${p.tenure}</p>
            <p><strong>Bedrooms:</strong> ${p.bedrooms} | <strong>Bathrooms:</strong> ${p.bathrooms} | <strong>Reception Rooms:</strong> ${p.receptionRooms}</p>
            <p><strong>Floor Area:</strong> ${p.floorArea} sq ft</p>
            <p><strong>Condition:</strong> ${p.condition}</p>
        </div>
        
        <div class="card mt-lg">
            <div class="card-header">
                <h3 class="card-title">Inspection Details</h3>
            </div>
            <p><strong>Inspection Date:</strong> ${formatDate(i.inspectionDate)}</p>
            <p><strong>Valuation Date:</strong> ${formatDate(i.valuationDate)}</p>
            <p><strong>Inspection Type:</strong> ${i.inspectionType}</p>
            <p><strong>Purpose:</strong> ${i.purpose}</p>
            <p><strong>Basis:</strong> ${i.basis}</p>
        </div>
        
        <div class="valuation-result mt-lg">
            <h2>Final Valuation</h2>
            <div class="valuation-amount">${formatCurrency(v.estimatedValue)}</div>
            <div class="valuation-range">Range: ${formatCurrency(v.lowerRange)} - ${formatCurrency(v.upperRange)}</div>
        </div>
    `;

    const reviewEl = document.getElementById('reviewSummary');
    if (reviewEl) reviewEl.innerHTML = summaryHTML;

    // Set the status dropdown to current report status
    const statusSelect = document.getElementById('reportStatus');
    if (statusSelect && valuationData.status) {
        statusSelect.value = valuationData.status;
    }
}

// ============================================
// Report Status Update (In-Form)
// ============================================

function updateReportStatus(newStatus) {
    if (valuationData && valuationData.id) {
        valuationData.status = newStatus;
        valuationData.updatedAt = new Date().toISOString();

        // Update in localStorage
        const reportsJSON = localStorage.getItem('ricsValuationReports');
        if (reportsJSON) {
            const reports = JSON.parse(reportsJSON);
            const reportIndex = reports.findIndex(r => r.id === valuationData.id);
            if (reportIndex !== -1) {
                reports[reportIndex] = valuationData;
                localStorage.setItem('ricsValuationReports', JSON.stringify(reports));
                console.log(`Report status updated to: ${newStatus}`);
            }
        }
    }
}


// ============================================
// PDF Generation
// ============================================

async function generatePDF(bypassValidation = false) {
    // Skip validation and form data saving when called from dashboard
    if (!bypassValidation) {
        if (!validateStep(6)) {
            return;
        }
        saveStepData(6);
        valuationData.status = 'completed';
        saveReport();
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');

    const p = valuationData.property;
    const i = valuationData.inspection;
    const m = valuationData.market;
    const v = valuationData.valuation;
    const valuer = valuationData.valuer;

    let yPos = 20;
    const leftMargin = 20;
    const pageWidth = 170;

    // ============================================
    // COVER PAGE - Professional White Design
    // ============================================

    // White background
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, 210, 297, 'F');


    // Add logo using embedded base64 data
    try {
        const logoBase64 = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDAAMCAgICAgMCAgIDAwMDBAYEBAQEBAgGBgUGCQgKCgkICQkKDA8MCgsOCwkJDRENDg8QEBEQCgwSExIQEw8QEBD/2wBDAQMDAwQDBAgEBAgQCwkLEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBD/wAARCADQBAADASIAAhEBAxEB/8QAHgABAAICAwEBAQAAAAAAAAAAAAgJBwoBBQYEAgP/xABoEAABAwMCBAIEBQoODAsFCQABAAIDBAUGBxEIEiExCRMiQVFhFDJCcrEVFhhCUnV2gZGVFhkjNjdYYnOhsrO00Q==';
        const logoWidth = 70;
        const logoX = (210 - logoWidth) / 2;
        doc.addImage(logoBase64, 'JPEG', logoX, 15, logoWidth, 35);
        console.log('✓ Logo added to PDF');
    } catch (error) {
        console.log('✗ Logo error:', error);
    }

    // Blue header bar
    doc.setFillColor(0, 61, 130);
    doc.rect(0, 50, 210, 35, 'F');

    // Title in white on blue bar
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont(undefined, 'bold');
    doc.text('RICS RED BOOK VALUATION REPORT', 105, 65, { align: 'center' });
    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    doc.text('Professional Property Valuation', 105, 75, { align: 'center' });

    // Reset to black text
    doc.setTextColor(0, 0, 0);

    // Property Photo (if available)
    if (valuationData.photo) {
        try {
            const photoWidth = 80;   // Portrait width
            const photoHeight = 120; // Portrait height
            const photoX = (210 - photoWidth) / 2;
            const photoY = 100;

            // Add border around photo
            doc.setDrawColor(200, 200, 200);
            doc.setLineWidth(0.5);
            doc.rect(photoX - 1, photoY - 1, photoWidth + 2, photoHeight + 2, 'S');

            doc.addImage(valuationData.photo, 'JPEG', photoX, photoY, photoWidth, photoHeight);
        } catch (error) {
            console.log('Property photo not added:', error);
        }
    }

    // Property Details Box
    const detailsY = valuationData.photo ? 245 : 120;

    // Property Address
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(0, 61, 130);
    doc.text(p.address || 'Property Address', 105, detailsY, { align: 'center' });

    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(80, 80, 80);
    doc.text(`${p.postcode || ''} | ${p.borough || ''}`, 105, detailsY + 8, { align: 'center' });

    // Valuation Date
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Valuation Date: ${formatDate(i.valuationDate)}`, 105, detailsY + 18, { align: 'center' });

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('Prepared in accordance with RICS Valuation - Global Standards (Red Book)', 105, 285, { align: 'center' });

    // Start new page for content
    doc.addPage();
    yPos = 20;
    doc.setTextColor(0, 0, 0);

    // Property Details Section
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(0, 61, 130);
    doc.text('PROPERTY DETAILS', leftMargin, yPos);
    yPos += 10;

    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(0, 0, 0);

    doc.text(`Address: ${p.address}`, leftMargin, yPos);
    yPos += 6;
    doc.text(`Postcode: ${p.postcode} | Borough: ${p.borough}`, leftMargin, yPos);
    yPos += 6;
    doc.text(`Property Type: ${p.type} | Tenure: ${p.tenure}`, leftMargin, yPos);
    yPos += 6;
    doc.text(`Bedrooms: ${p.bedrooms} | Bathrooms: ${p.bathrooms} | Reception Rooms: ${p.receptionRooms}`, leftMargin, yPos);
    yPos += 6;
    doc.text(`Internal Floor Area: ${p.floorArea} sq ft`, leftMargin, yPos);
    yPos += 6;
    doc.text(`Condition: ${p.condition}`, leftMargin, yPos);
    yPos += 12;

    // Inspection Details
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(0, 61, 130);
    doc.text('INSPECTION & VALUATION BASIS', leftMargin, yPos);
    yPos += 10;

    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(0, 0, 0);

    doc.text(`Inspection Date: ${formatDate(i.inspectionDate)}`, leftMargin, yPos);
    yPos += 6;
    doc.text(`Valuation Date: ${formatDate(i.valuationDate)}`, leftMargin, yPos);
    yPos += 6;
    doc.text(`Extent of Inspection: ${i.inspectionType}`, leftMargin, yPos);
    yPos += 6;
    doc.text(`Purpose of Valuation: ${i.purpose}`, leftMargin, yPos);
    yPos += 6;
    doc.text(`Basis of Valuation: ${i.basis}`, leftMargin, yPos);
    yPos += 12;

    if (i.limitations) {
        doc.setFont(undefined, 'bold');
        doc.text('Inspection Limitations:', leftMargin, yPos);
        yPos += 6;
        doc.setFont(undefined, 'normal');
        const limitationsLines = doc.splitTextToSize(i.limitations, pageWidth);
        doc.text(limitationsLines, leftMargin, yPos);
        yPos += (limitationsLines.length * 6) + 6;
    }

    // Market Analysis
    if (yPos > 240) {
        doc.addPage();
        yPos = 20;
    }

    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(0, 61, 130);
    doc.text('MARKET ANALYSIS', leftMargin, yPos);
    yPos += 10;

    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(0, 0, 0);

    doc.text(`Market Conditions: ${m.conditions}`, leftMargin, yPos);
    yPos += 6;
    doc.text(`Market Trend: ${m.trend || 'Not specified'}`, leftMargin, yPos);
    yPos += 6;
    doc.text(`Location Quality: ${m.locationQuality}`, leftMargin, yPos);
    yPos += 6;
    doc.text(`Transport Links: ${m.transportLinks || 'Not specified'}`, leftMargin, yPos);
    yPos += 12;

    // Comparable Evidence
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(0, 61, 130);
    doc.text('COMPARABLE EVIDENCE', leftMargin, yPos);
    yPos += 10;

    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(0, 0, 0);

    valuationData.comparables.forEach((comp, index) => {
        if (yPos > 250) {
            doc.addPage();
            yPos = 20;
        }

        doc.setFont(undefined, 'bold');
        doc.text(`Comparable ${index + 1}:`, leftMargin, yPos);
        yPos += 6;
        doc.setFont(undefined, 'normal');
        doc.text(`Address: ${comp.address}`, leftMargin + 5, yPos);
        yPos += 6;
        doc.text(`Sale Price: ${formatCurrency(comp.salePrice)} | Sale Date: ${formatDate(comp.saleDate)}`, leftMargin + 5, yPos);
        yPos += 6;
        doc.text(`Floor Area: ${comp.floorArea} sq ft | Bedrooms: ${comp.bedrooms} | Condition: ${comp.condition}`, leftMargin + 5, yPos);
        yPos += 6;

        const totalAdj = (comp.adjustments?.size || 0) + (comp.adjustments?.condition || 0) +
            (comp.adjustments?.location || 0) + (comp.adjustments?.time || 0);
        doc.text(`Total Adjustments: ${totalAdj.toFixed(1)}%`, leftMargin + 5, yPos);
        yPos += 10;
    });

    // Valuation Summary
    if (yPos > 200) {
        doc.addPage();
        yPos = 20;
    }

    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(0, 61, 130);
    doc.text('VALUATION SUMMARY', leftMargin, yPos);
    yPos += 10;

    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(0, 0, 0);

    // Valuation Method Indicator
    const valuationMode = v.mode || 'automatic';
    doc.setFont(undefined, 'bold');
    doc.setFillColor(valuationMode === 'manual' ? 197 : 0, valuationMode === 'manual' ? 165 : 61, valuationMode === 'manual' ? 114 : 130);
    doc.rect(leftMargin - 5, yPos - 3, 60, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.text(`METHOD: ${valuationMode.toUpperCase()}`, leftMargin, yPos + 2);
    doc.setTextColor(0, 0, 0);
    yPos += 12;

    // Show calculation details only for automatic mode
    if (valuationMode === 'automatic' && v.comparableCount) {
        doc.setFont(undefined, 'normal');
        doc.setFontSize(10);
        doc.text(`Number of Comparables Analyzed: ${v.comparableCount}`, leftMargin, yPos);
        yPos += 6;
        doc.text(`Average Comparable Value: ${formatCurrency(v.averageComparable)}`, leftMargin, yPos);
        yPos += 6;
        doc.text(`Market Adjustment Factor: ${((v.marketAdjustment - 1) * 100).toFixed(1)}%`, leftMargin, yPos);
        yPos += 6;
        doc.text(`Price per Square Foot: ${formatCurrency(Math.round(v.estimatedValue / p.floorArea))}`, leftMargin, yPos);
        yPos += 15;
    } else if (valuationMode === 'manual') {
        doc.setFont(undefined, 'italic');
        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);
        doc.text('Valuation determined by professional judgment based on comparable analysis.', leftMargin, yPos);
        yPos += 6;
        doc.text(`Price per Square Foot: ${formatCurrency(Math.round(v.estimatedValue / p.floorArea))}`, leftMargin, yPos);
        yPos += 15;
        doc.setTextColor(0, 0, 0);
        doc.setFont(undefined, 'normal');
    }

    // Opinion of Value - Highlighted Box
    doc.setFillColor(0, 61, 130);
    doc.rect(leftMargin - 5, yPos - 5, pageWidth + 10, 30, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('OPINION OF MARKET VALUE', leftMargin, yPos + 5);

    doc.setFontSize(20);
    doc.text(formatCurrency(v.estimatedValue), leftMargin, yPos + 15);

    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(`Valuation Range: ${formatCurrency(v.lowerRange)} - ${formatCurrency(v.upperRange)}`, leftMargin, yPos + 22);

    yPos += 40;
    doc.setTextColor(0, 0, 0);

    // Valuation Notes
    if (v.notes) {
        if (yPos > 230) {
            doc.addPage();
            yPos = 20;
        }

        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(0, 61, 130);
        doc.text('VALUATION NOTES & JUSTIFICATION', leftMargin, yPos);
        yPos += 8;

        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(0, 0, 0);
        const notesLines = doc.splitTextToSize(v.notes, pageWidth);
        doc.text(notesLines, leftMargin, yPos);
        yPos += (notesLines.length * 6) + 10;
    }

    // Assumptions
    if (i.assumptions) {
        if (yPos > 230) {
            doc.addPage();
            yPos = 20;
        }

        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(0, 61, 130);
        doc.text('ASSUMPTIONS', leftMargin, yPos);
        yPos += 8;

        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(0, 0, 0);
        const assumptionsLines = doc.splitTextToSize(i.assumptions, pageWidth);
        doc.text(assumptionsLines, leftMargin, yPos);
        yPos += (assumptionsLines.length * 6) + 10;
    }

    // New page for declarations
    doc.addPage();
    yPos = 20;

    // RICS Compliance Statement
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(0, 61, 130);
    doc.text('RICS RED BOOK COMPLIANCE', leftMargin, yPos);
    yPos += 8;

    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(0, 0, 0);
    const complianceText = 'This valuation has been prepared in accordance with the RICS Valuation - Global Standards (Red Book), which incorporate the International Valuation Standards (IVS), and the UK national supplement. The valuer confirms compliance with all mandatory requirements of the Red Book.';
    const complianceLines = doc.splitTextToSize(complianceText, pageWidth);
    doc.text(complianceLines, leftMargin, yPos);
    yPos += (complianceLines.length * 6) + 10;

    // Valuer Declaration
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(0, 61, 130);
    doc.text('VALUER DECLARATION', leftMargin, yPos);
    yPos += 8;

    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(0, 0, 0);

    doc.text(`Valuer: ${valuer.name}, ${valuer.qualification}`, leftMargin, yPos);
    yPos += 6;
    doc.text(`Company: ${valuer.company}`, leftMargin, yPos);
    yPos += 6;
    if (valuer.companyAddress) {
        doc.text(`Address: ${valuer.companyAddress}`, leftMargin, yPos);
        yPos += 6;
    }
    yPos += 6;

    const declarationText = 'I confirm that I have the necessary competence, independence, and objectivity to undertake this valuation. I have no material interest in the subject property and this valuation has been prepared objectively and impartially.';
    const declarationLines = doc.splitTextToSize(declarationText, pageWidth);
    doc.text(declarationLines, leftMargin, yPos);
    yPos += (declarationLines.length * 6) + 15;

    doc.text('Signature: _______________________________', leftMargin, yPos);
    yPos += 10;
    doc.text(`Date: ${formatDate(new Date().toISOString().split('T')[0])}`, leftMargin, yPos);

    // Footer on all pages
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);
        doc.text(`Page ${i} of ${pageCount}`, 105, 287, { align: 'center' });
        doc.text('RICS Red Book Valuation Report', leftMargin, 287);
        doc.text(formatDate(i.valuationDate), 190, 287, { align: 'right' });
    }

    // Save PDF
    const postcodeForFilename = (p.postcode || 'DRAFT').replace(/\s/g, '_');
    const filename = `RICS_Valuation_${postcodeForFilename}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(filename);

    alert('PDF Report generated successfully!');
}

// ============================================
// Utility Functions
// ============================================

function formatCurrency(amount) {
    if (!amount || isNaN(amount)) return 'Â£0';
    return new Intl.NumberFormat('en-GB', {
        style: 'currency',
        currency: 'GBP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

function formatDate(dateString) {
    if (!dateString) return 'Not specified';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    });
}

// ============================================
// Photo Upload Functions
// ============================================

// Initialize photo upload click handler reliably
function initializePhotoUpload() {
    const zone = document.getElementById('photoUploadZone');
    const fileInput = document.getElementById('photoFileInput');

    if (zone && fileInput) {
        // Remove any existing inline onclick to prevent double-firing
        zone.removeAttribute('onclick');

        // Add robust click handler
        zone.addEventListener('click', function (event) {
            // Prevent triggering if clicking remove button or already previewing
            if (event.target.closest('.btn-remove-photo') || event.target.closest('.photo-preview:not(.hidden)')) {
                return;
            }
            fileInput.click();
        });

        console.log('Photo upload zone initialized');
    }
}

// Call initialization when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializePhotoUpload);
} else {
    // DOM already loaded, initialize now
    setTimeout(initializePhotoUpload, 100);
}

function handlePhotoDragOver(event) {
    event.preventDefault();
    event.stopPropagation();
    document.getElementById('photoUploadZone').classList.add('drag-over');
}

function handlePhotoDragLeave(event) {
    event.preventDefault();
    event.stopPropagation();
    document.getElementById('photoUploadZone').classList.remove('drag-over');
}

function handlePhotoDrop(event) {
    event.preventDefault();
    event.stopPropagation();
    document.getElementById('photoUploadZone').classList.remove('drag-over');

    const files = event.dataTransfer.files;
    if (files.length > 0) {
        processPhotoFile(files[0]);
    }
}

function handlePhotoSelect(event) {
    const files = event.target.files;
    if (files.length > 0) {
        processPhotoFile(files[0]);
    }
}

function processPhotoFile(file) {
    if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
    }

    // Compress and resize image to prevent localStorage quota issues
    const maxWidth = 800;
    const maxHeight = 600;
    const quality = 0.7;

    const reader = new FileReader();
    reader.onload = function (e) {
        const img = new Image();
        img.onload = function () {
            // Create canvas for resizing
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;

            // Calculate new dimensions
            if (width > maxWidth || height > maxHeight) {
                const ratio = Math.min(maxWidth / width, maxHeight / height);
                width = Math.round(width * ratio);
                height = Math.round(height * ratio);
            }

            canvas.width = width;
            canvas.height = height;

            // Draw and compress
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);

            // Convert to compressed JPEG
            const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);

            valuationData.photo = compressedDataUrl;
            displayPhotoPreview(compressedDataUrl);
            saveDraft();

            console.log('Photo compressed and saved. Original size: ' + Math.round(e.target.result.length / 1024) + 'KB, Compressed: ' + Math.round(compressedDataUrl.length / 1024) + 'KB');
        };
        img.onerror = function () {
            console.error('Failed to load image for compression');
            // Fallback to original if compression fails
            valuationData.photo = e.target.result;
            displayPhotoPreview(e.target.result);
            saveDraft();
        };
        img.src = e.target.result;
    };
    reader.onerror = function () {
        console.error('Failed to read photo file');
        alert('Failed to read the photo file. Please try again.');
    };
    reader.readAsDataURL(file);
}

// Remove property photo
function removePropertyPhoto() {
    if (confirm('Are you sure you want to remove the property photo?')) {
        valuationData.photo = null;

        // Clear the file input
        const photoInput = document.getElementById('photoFileInput');
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

function displayPhotoPreview(dataUrl) {
    const preview = document.getElementById('photoPreview');
    const content = document.getElementById('photoUploadContent');
    const removeBtn = document.getElementById('removePhotoBtn');

    if (preview) {
        preview.src = dataUrl;
        preview.classList.remove('hidden');
    }
    if (content) {
        content.classList.add('hidden');
    }
    if (removeBtn) {
        removeBtn.classList.remove('hidden');
    }
}

function removePhoto() {
    valuationData.photo = null;
    resetPhotoUpload();
    saveDraft();
}

function resetPhotoUpload() {
    const preview = document.getElementById('photoPreview');
    const content = document.getElementById('photoUploadContent');
    const removeBtn = document.getElementById('removePhotoBtn');
    const fileInput = document.getElementById('photoFileInput');

    if (preview) {
        preview.src = '';
        preview.classList.add('hidden');
    }
    if (content) {
        content.classList.remove('hidden');
    }
    if (removeBtn) {
        removeBtn.classList.add('hidden');
    }
    if (fileInput) {
        fileInput.value = '';
    }
}

