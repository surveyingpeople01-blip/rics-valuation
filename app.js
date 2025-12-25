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
        comparables: [],
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

    // Reset form
    document.querySelectorAll('input, select, textarea').forEach(field => {
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
    document.getElementById('valuationView').classList.add('hidden');
    document.getElementById('dashboardView').classList.remove('hidden');
    loadReports();
    renderDashboard();
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

    localStorage.setItem('ricsValuationReports', JSON.stringify(allReports));
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
    if (confirm('Are you sure you want to delete this valuation report?')) {
        allReports = allReports.filter(r => r.id !== id);
        localStorage.setItem('ricsValuationReports', JSON.stringify(allReports));
        renderDashboard();
    }
}

function renderDashboard() {
    const container = document.getElementById('reportsContainer');
    const emptyState = document.getElementById('emptyState');

    if (allReports.length === 0) {
        container.innerHTML = '';
        emptyState.classList.remove('hidden');
        return;
    }

    emptyState.classList.add('hidden');

    if (currentView === 'tile') {
        container.className = 'reports-grid';
        container.innerHTML = allReports.map(report => createReportCard(report)).join('');
    } else {
        container.className = 'reports-list';
        container.innerHTML = allReports.map(report => createReportListItem(report)).join('');
    }
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

    let filtered = allReports;

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

    // Temporarily replace allReports for rendering
    const originalReports = allReports;
    allReports = filtered;
    renderDashboard();
    allReports = originalReports;
}

// ============================================
// Navigation Functions
// ============================================

function nextStep(step) {
    if (!validateStep(step)) {
        return;
    }

    saveStepData(step);

    if (step === 4) {
        calculateValuation();
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

function showStep(stepNumber) {
    document.querySelectorAll('.form-section').forEach(section => {
        section.classList.remove('active');
    });
    const stepElement = document.getElementById(`step${stepNumber}`);
    if (stepElement) {
        stepElement.classList.add('active');
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
                bedrooms: parseInt(document.getElementById('bedrooms').value) || 0,
                bathrooms: parseInt(document.getElementById('bathrooms').value) || 0,
                receptionRooms: parseInt(document.getElementById('receptionRooms').value) || 0,
                floorArea: parseInt(document.getElementById('floorArea').value) || 0,
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
        setFieldValue('bedrooms', p.bedrooms);
        setFieldValue('bathrooms', p.bathrooms);
        setFieldValue('receptionRooms', p.receptionRooms);
        setFieldValue('floorArea', p.floorArea);
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
                        <label>Floor Area (sq ft)</label>
                        <input type="number" class="comp-area" data-id="${comp.id}" value="${comp.floorArea || ''}" 
                               onchange="updateComparable('${comp.id}', 'floorArea', parseInt(this.value))" 
                               placeholder="0" min="0">
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
// Valuation Calculation
// ============================================

function calculateValuation() {
    const comparables = valuationData.comparables.filter(comp => comp.salePrice > 0);

    if (comparables.length === 0) {
        alert('Please add at least one comparable property with a sale price.');
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
    const p = valuationData.property;
    const i = valuationData.inspection;
    const v = valuationData.valuation;

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

    // Header
    doc.setFillColor(0, 61, 130);
    doc.rect(0, 0, 210, 40, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont(undefined, 'bold');
    doc.text('RICS RED BOOK VALUATION REPORT', leftMargin, 20);

    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    doc.text('Professional Property Valuation - London, UK', leftMargin, 30);

    yPos = 50;
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

    doc.text(`Number of Comparables Analyzed: ${v.comparableCount}`, leftMargin, yPos);
    yPos += 6;
    doc.text(`Average Comparable Value: ${formatCurrency(v.averageComparable)}`, leftMargin, yPos);
    yPos += 6;
    doc.text(`Market Adjustment Factor: ${((v.marketAdjustment - 1) * 100).toFixed(1)}%`, leftMargin, yPos);
    yPos += 6;
    doc.text(`Price per Square Foot: ${formatCurrency(Math.round(v.estimatedValue / p.floorArea))}`, leftMargin, yPos);
    yPos += 15;

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
    const filename = `RICS_Valuation_${p.postcode.replace(/\s/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
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

    const reader = new FileReader();
    reader.onload = function (e) {
        valuationData.photo = e.target.result;
        displayPhotoPreview(e.target.result);
        saveDraft();
    };
    reader.readAsDataURL(file);
}

function displayPhotoPreview(dataUrl) {
    const preview = document.getElementById('photoPreview');
    const content = document.getElementById('photoUploadContent');
    const removeBtn = document.getElementById('removePhotoBtn');

    preview.src = dataUrl;
    preview.classList.remove('hidden');
    content.classList.add('hidden');
    removeBtn.classList.remove('hidden');
}

function removePhoto() {
    valuationData.photo = null;
    resetPhotoUpload();
    saveDraft();
}

