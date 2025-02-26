// Set current date and initialize form
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('currentDate').valueAsDate = new Date();

    // Generate requisition number
    const today = new Date();
    const reqNo = today.getFullYear().toString() +
        (today.getMonth() + 1).toString().padStart(2, '0') +
        today.getDate().toString().padStart(2, '0') +
        '-' + Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    document.getElementById('reqNo').value = reqNo;

    // Add event listener for the requestedBy field
    document.getElementById('requestedBy').addEventListener('input', updateSignatureNames);

    // Initialize an event listener for the approvedBy field if it exists
    const approvedByField = document.getElementById('approvedBy');
    if (approvedByField) {
        approvedByField.addEventListener('input', updateSignatureNames);
    }
});

// Update the signature names based on form input
function updateSignatureNames() {
    const requestedByValue = document.getElementById('requestedBy').value;
    document.getElementById('requestedByName').textContent = requestedByValue;

    const approvedByField = document.getElementById('approvedBy');
    const approvedByNameField = document.getElementById('approvedByName');

    if (approvedByField && approvedByNameField) {
        approvedByNameField.textContent = approvedByField.value;
    }
}

// Add new row
function addRow() {
    const tbody = document.getElementById('requisitionBody');
    const rowCount = tbody.children.length;

    const newRow = document.createElement('tr');
    newRow.innerHTML = `
            <td class="text-center">
                <div class="item-number mx-auto">${rowCount + 1}</div>
            </td>
            <td>
                <input type="text" class="form-control" name="items[${rowCount}].description" placeholder="Enter item description">
            </td>
            <td>
                <input type="text" class="form-control" name="items[${rowCount}].unit" placeholder="Unit">
            </td>
            <td>
                <input type="number" class="form-control quantity" min="0" onchange="calculateRow(this)" name="items[${rowCount}].quantity" placeholder="0">
            </td>
            <td>
                <div class="input-group">
                    <span class="input-group-text">UGX</span>
                    <input type="number" class="form-control price" min="0" step="1" onchange="calculateRow(this)" name="items[${rowCount}].price" placeholder="0">
                </div>
            </td>
            <td>
                <div class="input-group">
                    <span class="input-group-text">UGX</span>
                    <input type="number" class="form-control total" readonly name="items[${rowCount}].total" placeholder="0">
                </div>
            </td>
            <td class="text-center add-item-btn">
                <button type="button" class="btn btn-sm btn-outline-danger btn-remove" onclick="removeRow(this)" title="Remove Item">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        `;

    tbody.appendChild(newRow);

    // Add animation class then remove it after animation completes
    newRow.classList.add('animate-fade-in-up');
    setTimeout(() => {
        newRow.classList.remove('animate-fade-in-up');
    }, 500);

    renumberRows();
}

// Remove row
function removeRow(button) {
    const tbody = document.getElementById('requisitionBody');
    const row = button.closest('tr');

    // Only remove if there's more than one row
    if (tbody.children.length > 1) {
        row.remove();
        calculateGrandTotal();
        renumberRows();
    }
}

// Renumber rows
function renumberRows() {
    const rows = document.getElementById('requisitionBody').children;
    for (let i = 0; i < rows.length; i++) {
        rows[i].querySelector('.item-number').textContent = i + 1;
        const inputs = rows[i].querySelectorAll('input');
        inputs.forEach(input => {
            if (input.name) {
                input.name = input.name.replace(/\[\d+\]/, `[${i}]`);
            }
        });
    }
}

// Calculate row total
function calculateRow(input) {
    const row = input.closest('tr');
    const quantity = parseFloat(row.querySelector('.quantity').value) || 0;
    const price = parseFloat(row.querySelector('.price').value) || 0;
    const total = quantity * price;
    row.querySelector('.total').value = Math.round(total); // Rounded to whole number for UGX

    calculateGrandTotal();
}

// Calculate grand total
function calculateGrandTotal() {
    const totals = Array.from(document.getElementsByClassName('total'));
    const grandTotal = totals.reduce((sum, input) => sum + (parseFloat(input.value) || 0), 0);
    document.getElementById('grandTotal').value = Math.round(grandTotal); // Rounded to whole number for UGX
}

// Print form with improved function
function printForm() {
    // Update signature names
    updateSignatureNames();

    // Prepare for printing
    window.print();
}

// Reset form
function resetForm() {
    // Ask for confirmation before resetting
    if (confirm("Are you sure you want to reset the form? All entered data will be lost.")) {
        document.getElementById('requisitionForm').reset();
        document.getElementById('currentDate').valueAsDate = new Date();

        // Generate new requisition number
        const today = new Date();
        const reqNo = today.getFullYear().toString() +
            (today.getMonth() + 1).toString().padStart(2, '0') +
            today.getDate().toString().padStart(2, '0') +
            '-' + Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        document.getElementById('reqNo').value = reqNo;

        // Clear all rows except the first one
        const tbody = document.getElementById('requisitionBody');
        while (tbody.children.length > 1) {
            tbody.removeChild(tbody.lastChild);
        }

        // Reset the first row values
        const firstRow = tbody.firstChild;
        const inputs = firstRow.querySelectorAll('input');
        inputs.forEach(input => {
            input.value = '';
        });

        // Reset grand total
        document.getElementById('grandTotal').value = '0';

        // Reset signature names
        document.getElementById('requestedByName').textContent = '';
        const approvedByNameField = document.getElementById('approvedByName');
        if (approvedByNameField) {
            approvedByNameField.textContent = '';
        }
    }
}

// Download PDF - improved function
function downloadPDF() {
    // Get form data
    const date = document.getElementById('currentDate').value;
    const reqNo = document.getElementById('reqNo').value;
    const requestedBy = document.getElementById('requestedBy').value;

    try {
        // Create PDF document
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // Set font sizes
        const titleFontSize = 16;
        const headerFontSize = 12;
        const normalFontSize = 10;
        const smallFontSize = 8;

        // Add title
        doc.setFontSize(titleFontSize);
        doc.setFont(undefined, 'bold');
        doc.text("HAWN KINDERGARTEN AND JUNIOR SCHOOL", 105, 20, { align: 'center' });

        doc.setFontSize(headerFontSize);
        doc.text("REQUISITION FORM", 105, 30, { align: 'center' });

        // Add form details
        doc.setFontSize(normalFontSize);
        doc.setFont(undefined, 'normal');

        doc.text(`Date: ${date}`, 20, 45);
        doc.text(`Requisition No: ${reqNo}`, 120, 45);
        doc.text(`Requested By: ${requestedBy}`, 20, 55);

        // Draw table headers
        const startY = 70;
        const cellPadding = 5;
        const colWidths = [10, 70, 20, 25, 30, 30];
        let currentY = startY;

        // Draw header row
        doc.setFillColor(67, 97, 238); // Primary color
        doc.setTextColor(255, 255, 255);
        doc.setFont(undefined, 'bold');

        doc.rect(15, currentY, colWidths[0], 10, 'F');
        doc.rect(15 + colWidths[0], currentY, colWidths[1], 10, 'F');
        doc.rect(15 + colWidths[0] + colWidths[1], currentY, colWidths[2], 10, 'F');
        doc.rect(15 + colWidths[0] + colWidths[1] + colWidths[2], currentY, colWidths[3], 10, 'F');
        doc.rect(15 + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3], currentY, colWidths[4], 10, 'F');
        doc.rect(15 + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4], currentY, colWidths[5], 10, 'F');

        doc.text('#', 15 + colWidths[0]/2, currentY + 7, { align: 'center' });
        doc.text('Item Description', 15 + colWidths[0] + colWidths[1]/2, currentY + 7, { align: 'center' });
        doc.text('Unit', 15 + colWidths[0] + colWidths[1] + colWidths[2]/2, currentY + 7, { align: 'center' });
        doc.text('Quantity', 15 + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3]/2, currentY + 7, { align: 'center' });
        doc.text('Unit Price (UGX)', 15 + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4]/2, currentY + 7, { align: 'center' });
        doc.text('Total (UGX)', 15 + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4] + colWidths[5]/2, currentY + 7, { align: 'center' });

        currentY += 10;

        // Get items data
        const rows = document.getElementById('requisitionBody').children;
        let grandTotal = 0;

        // Reset text color to black for items
        doc.setTextColor(0, 0, 0);
        doc.setFont(undefined, 'normal');

        // Draw item rows
        for (let i = 0; i < rows.length; i++) {
            const description = rows[i].querySelector('input[name^="items"][name$=".description"]').value;
            const unit = rows[i].querySelector('input[name^="items"][name$=".unit"]').value;
            const quantity = rows[i].querySelector('input[name^="items"][name$=".quantity"]').value;
            const price = rows[i].querySelector('input[name^="items"][name$=".price"]').value;
            const total = rows[i].querySelector('input[name^="items"][name$=".total"]').value;

            // Add a new page if we're near the bottom
            if (currentY > 270) {
                doc.addPage();
                currentY = 20;
            }

            // Alternate row background
            if (i % 2 === 0) {
                doc.setFillColor(240, 240, 255);
                doc.rect(15, currentY, colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4] + colWidths[5], 10, 'F');
            }

            // Draw row borders
            doc.setDrawColor(200, 200, 200);
            doc.rect(15, currentY, colWidths[0], 10);
            doc.rect(15 + colWidths[0], currentY, colWidths[1], 10);
            doc.rect(15 + colWidths[0] + colWidths[1], currentY, colWidths[2], 10);
            doc.rect(15 + colWidths[0] + colWidths[1] + colWidths[2], currentY, colWidths[3], 10);
            doc.rect(15 + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3], currentY, colWidths[4], 10);
            doc.rect(15 + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4], currentY, colWidths[5], 10);

            // Add text
            doc.text((i+1).toString(), 15 + colWidths[0]/2, currentY + 7, { align: 'center' });

            // Handle long description text with wrapping
            const descLines = doc.splitTextToSize(description, colWidths[1] - cellPadding*2);
            doc.text(descLines, 15 + colWidths[0] + cellPadding, currentY + 7);

            doc.text(unit, 15 + colWidths[0] + colWidths[1] + colWidths[2]/2, currentY + 7, { align: 'center' });
            doc.text(quantity, 15 + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3]/2, currentY + 7, { align: 'center' });
            doc.text(price, 15 + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4]/2, currentY + 7, { align: 'center' });
            doc.text(total, 15 + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4] + colWidths[5]/2, currentY + 7, { align: 'center' });

            grandTotal += parseFloat(total) || 0;
            currentY += 10;
        }

        // Draw total row
        doc.setFillColor(230, 230, 250);
        doc.rect(15, currentY, colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4], 10, 'F');
        doc.rect(15 + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4], currentY, colWidths[5], 10, 'F');

        doc.setFont(undefined, 'bold');
        doc.text("TOTAL AMOUNT:", 15 + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4] - cellPadding, currentY + 7, { align: 'right' });
        doc.text(grandTotal.toFixed(0).toString(), 15 + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4] + colWidths[5]/2, currentY + 7, { align: 'center' });

        currentY += 20;

        // Add signature section
        doc.setDrawColor(100, 100, 100);
        doc.setFont(undefined, 'normal');

        // Requested by signature
        doc.text("Requested by:", 40, currentY);
        doc.text(requestedBy, 40, currentY + 7);
        doc.line(25, currentY + 15, 80, currentY + 15);
        doc.setFontSize(smallFontSize);
        doc.text("Signature & Date", 40, currentY + 20, { align: 'center' });

        // Approved by signature
        doc.setFontSize(normalFontSize);
        doc.text("Approved by:", 140, currentY);
        doc.line(120, currentY + 15, 175, currentY + 15);
        doc.setFontSize(smallFontSize);
        doc.text("Signature & Date", 140, currentY + 20, { align: 'center' });

        // Footer
        currentY = 280;
        doc.setFontSize(8);
        doc.text("© 2025 Hawn Kindergarten and Junior School. All rights reserved.", 105, currentY, { align: 'center' });

        // Save the PDF
        const fileName = reqNo ? `Requisition_${reqNo}.pdf` : 'Requisition_Form.pdf';
        doc.save(fileName);
    } catch (error) {
        console.error("Error generating PDF:", error);
        alert("Failed to generate PDF: " + error.message);
    }
}