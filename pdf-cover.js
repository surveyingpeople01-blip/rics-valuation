// ============================================
// PDF Cover Page Generation
// ============================================

async function generatePDFWithCover() {
    if (!validateStep(6)) {
        return;
    }

    saveStepData(6);
    valuationData.status = 'completed';
    saveReport();

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');

    const p = valuationData.property;
    const i = valuationData.inspection;
    const m = valuationData.market;
    const v = valuationData.valuation;
    const valuer = valuationData.valuer;

    const leftMargin = 20;
    const pageWidth = 170;

    // ============================================
    // COVER PAGE
    // ============================================

    // Blue background for top section
    doc.setFillColor(0, 61, 130);
    doc.rect(0, 0, 210, 120, 'F');

    // Add logo using embedded base64 data from logo-data.js
    try {
        if (typeof LOGO_BASE64 !== 'undefined') {
            doc.addImage(LOGO_BASE64, 'JPEG', leftMargin, 20, 60, 30);
        }
    } catch (e) {
        console.log('Logo not added to PDF:', e);
    }

    // Cover title
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(32);
    doc.setFont(undefined, 'bold');
    doc.text('RICS RED BOOK', 105, 70, { align: 'center' });
    doc.text('VALUATION REPORT', 105, 85, { align: 'center' });

    doc.setFontSize(14);
    doc.setFont(undefined, 'normal');
    doc.text('Professional Property Valuation', 105, 100, { align: 'center' });
    doc.text('London, United Kingdom', 105, 110, { align: 'center' });

    // Property photo if available
    if (valuationData.photo) {
        try {
            doc.addImage(valuationData.photo, 'JPEG', 30, 135, 150, 100);
        } catch (e) {
            console.log('Property photo not added to PDF');
        }
    }

    // Property address
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(18);
    doc.setFont(undefined, 'bold');
    const yPosAddress = valuationData.photo ? 245 : 145;
    doc.text(p.address, 105, yPosAddress, { align: 'center' });

    doc.setFontSize(14);
    doc.setFont(undefined, 'normal');
    doc.text(p.postcode || 'N/A', 105, yPosAddress + 8, { align: 'center' });

    // Valuation amount
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(0, 61, 130);
    doc.text('ESTIMATED MARKET VALUE', 105, yPosAddress + 25, { align: 'center' });

    doc.setFontSize(24);
    doc.setTextColor(0, 61, 130);
    doc.text(formatCurrency(v.estimatedValue), 105, yPosAddress + 35, { align: 'center' });

    // Footer
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Valuation Date: ${formatDate(i.valuationDate)}`, 105, 280, { align: 'center' });
    doc.text(`Prepared by: ${valuer.name}, ${valuer.qualification}`, 105, 286, { align: 'center' });

    // ============================================
    // PAGE 2: PROPERTY DETAILS
    // ============================================

    doc.addPage();
    let yPos = 20;

    // Header with logo on subsequent pages
    doc.setFillColor(0, 61, 130);
    doc.rect(0, 0, 210, 40, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont(undefined, 'bold');
    doc.text('RICS RED BOOK VALUATION REPORT', leftMargin, 20);

    doc.setFontSize(11);
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
        if (i > 1) { // Don't add footer text on cover page
            doc.text('RICS Red Book Valuation Report', leftMargin, 287);
            doc.text(formatDate(i.valuationDate), 190, 287, { align: 'right' });
        }
    }

    // Save PDF
    const postcodeForFilename = (p.postcode || 'DRAFT').replace(/\s/g, '_');
    const filename = `RICS_Valuation_${postcodeForFilename}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(filename);

    alert('PDF Report with cover page generated successfully!');
}

// Keep old function as alias for compatibility
async function generatePDF() {
    return generatePDFWithCover();
}
