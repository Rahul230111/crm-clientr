import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import toast from "react-hot-toast";
import Logo from '../../assets/megacraneq.png'; // Assuming this path is correct for your logo

// Helper functions (keeping these as is, no changes needed for file size here)
const formatCurrency = (amount) => {
    const numAmount = parseFloat(amount) || 0;
    return `₹${numAmount.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
};

const convertNumberToWords = (num) => {
    if (typeof num !== "number" || isNaN(num)) return "N/A";
    let number = Math.floor(num);
    let decimal = Math.round((num - number) * 100);

    const units = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];
    const teens = ["Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
    const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
    const scales = ["", "Thousand", "Lakh", "Crore"];

    const numToWords = (n) => {
        if (n < 10) return units[n];
        if (n >= 10 && n < 20) return teens[n - 10];
        return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? " " + units[n % 10] : "");
    };

    let words = [];
    let i = 0;

    if (number === 0) {
        words.push("Zero");
    } else {
        let lastThree = number % 1000;
        if (lastThree > 0) {
            if (lastThree < 100) {
                words.push(numToWords(lastThree));
            } else {
                words.push(units[Math.floor(lastThree / 100)] + " Hundred" + (lastThree % 100 !== 0 ? " " + numToWords(lastThree % 100) : ""));
            }
        }
        number = Math.floor(number / 1000);

        while (number > 0) {
            let chunk = number % 100;
            if (chunk > 0) {
                words.push(numToWords(chunk) + " " + scales[++i]);
            } else {
                i++;
            }
            number = Math.floor(number / 100);
        }
    }

    const finalWords = words.reverse().filter(Boolean).join(" ").trim();
    let result = finalWords ? finalWords + " Rupees" : "Zero Rupees";

    if (decimal > 0) {
        result += ` and ${numToWords(decimal)} Paisa`;
    }
    result += " Only";

    return result.replace(/\s+/g, ' ');
};

export const downloadQuotationPdf = async (record) => {
    const toastId = toast.loading("Generating PDF...", {
        position: "top-center",
    });

    try {
        const pdf = new jsPDF({
            orientation: "portrait",
            unit: "mm",
            format: "a4",
        });

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const padding = 15; // Padding from page edges
        let y = padding; // Current Y position on the PDF

        const lineHeight = 5; // Standard line height for text
        const smallLineHeight = 3.5; // Smaller line height for address/contact details
        const headerHeight = 45; // Approximate height of the header
        const footerHeight = 15; // Approximate height of the footer (for page number)
        const cellPadding = 2; // Padding inside table cells - MOVED THIS DECLARATION HERE

        // --- Helper to add header to a page ---
        const addHeader = async () => {
            const img = new Image();
            img.src = Logo;
            await new Promise(resolve => img.onload = resolve);

            const imgWidth = 20; // Adjust as needed
            const imgHeight = (img.height * imgWidth) / img.width; // Maintain aspect ratio
            const imgX = padding;
            const imgY = padding;

            pdf.addImage(img, 'PNG', imgX, imgY, imgWidth, imgHeight);

            pdf.setFontSize(14);
            pdf.setTextColor("#D35400");
            pdf.setFont("helvetica", "bold");
            pdf.text("MEGA CRANES INDIA PRIVATE LIMITED", pdfWidth / 2, padding + 5, { align: "center" });

            pdf.setFontSize(8);
            pdf.setTextColor("#D35400");
            pdf.setFont("helvetica", "normal");
            pdf.text("(An ISO 9001 : 2015 Certified company)", pdfWidth / 2, padding + 9, { align: "center" });

            pdf.setFontSize(8);
            pdf.setTextColor("#333");
            pdf.text("S.F. No. 2/8, 2/9, 2/11, Thelungupalayam Road, Ellapalayam (P.O), Annur, Coimbatore - 641 697.", pdfWidth / 2, padding + 15, { align: "center" });
            pdf.text("Mob : 99949 63033, 99949 93032.", pdfWidth / 2, padding + 18, { align: "center" });
            pdf.text("E-mail : info@megacranesindia.com, marketing@megacranesindia.com", pdfWidth / 2, padding + 21, { align: "center" });
            pdf.text("Website : www.megacranesindia.com", pdfWidth / 2, padding + 24, { align: "center" });
            pdf.text("GST No : 33AACCM6869G1Z8      PAN No : AACCM6869G      Incorporation No : U29150TZ2009PTC015678", pdfWidth / 2, padding + 27, { align: "center" });

            pdf.setDrawColor("#d35400");
            pdf.setLineWidth(0.5);
            pdf.line(padding, padding + 32, pdfWidth - padding, padding + 32); // Bottom line for header

            y = padding + 40; // Adjust Y position after header
        };

        // --- Helper to add footer to a page ---
        const addFooter = (pageNumber, totalPages) => {
            pdf.setFontSize(8);
            pdf.setTextColor("#999");
            // Corrected position for page number to be centered horizontally and 10mm from the bottom
            pdf.text(`Page ${pageNumber}/${totalPages}`, pdfWidth / 2, pdfHeight - 10, { align: "center" });
        };

        // Initialize variables based on record
        const subTotalAmount = record.items?.reduce(
            (sum, item) => sum + (parseFloat(item.quantity || 0) * parseFloat(item.rate || 0)),
            0
        ) || 0;
        const gstRate = 0.18;
        const gstAmount = subTotalAmount * gstRate;
        const grandTotalAmount = subTotalAmount + gstAmount;

        const toCompany = record.businessName || "M/s. LMW Limited, Foundry Division UNIT - 31 (Unit 2), Arasur, Coimbatore – 641 407";
        const attnContact = record.businessId?.contactName || record.contactName || "N/A";
        const attnMobile = record.mobileNumber || record.businessId?.mobileNumber || record.businessId?.phone || "N/A";
        const attnEmail = record.businessId?.email || record.email || "N/A";

        let subject = record.subject;
        if (!subject && record.items && record.items.length > 0) {
            const itemDescriptions = record.items.map(item => item.productName).filter(Boolean);
            if (itemDescriptions.length > 0) {
                subject = `Offer for ${itemDescriptions.slice(0, 2).join(' & ')}`;
                if (itemDescriptions.length > 2) {
                    subject += '...';
                }
            } else {
                subject = "Offer for your requirement";
            }
        } else if (!subject) {
            subject = "Offer for your requirement";
        }

        const reference = record.reference || `Your telecom enquiry dated ${new Date().toLocaleDateString("en-IN")}`;
        const quotationDate = record.date ? new Date(record.date).toLocaleDateString("en-IN") : new Date().toLocaleDateString("en-IN");
        const quotationNumber = record.quotationNumber || "MCIPL/OFR/0/NXL";

        const quotationNotes = record.quotationNotes || "If Installation or any other Service is required, additional charges of Rs.4,500/- will be Applicable extra on PER MAN DAY (i.e, Per Engineer Per Day) basis + GST 18% Extra. If required, you have to release a separate Work Order";
        const customerScope = record.customerScope || `Transportation from our works to your site\nUnloading the materials @Site, Storage, Security, Inhouse Transportation\nRequired Cables, SFU, Ladders, Scaffoldings, Platforms, Cranes, Chain Block other requirements for Installation.\nInstallation with Required Base & Cables, Materials & Modifications\nAdditional Materials, Spares, Modifications & Services (if required)`;

        const aggregatedHsnSacs = Array.from(new Set(
            record.items
                ?.map(item => item.hsnSac)
                .filter(hsn => hsn && hsn.trim() !== '')
        )).join(', ');

        let hsnCodesValue = record.hsnCodes;
        if (!hsnCodesValue && aggregatedHsnSacs) {
            hsnCodesValue = aggregatedHsnSacs;
        } else if (!hsnCodesValue) {
            hsnCodesValue = "Spares - 84311090, Service - 998719";
        }

        const termsData = [
            { label: "PRICES", value: record.pricesTerms || "EX WORKS COIMBATORE with open packing basis." },
            { label: "TAXES", value: record.warranty || "12 months from the date of dispatch or 1000 running hours whichever is earlier." },

            { label: "PAYMENT TERMS", value: record.ourPaymentTerms || "100% payment + 100% GST before dispatch from our works" },
            { label: "DELIVERY", value: record.delivery || "4 - 6 weeks against receipt of your firm PO" },
            { label: "PACKING & FORWARDING CHARGES", value: record.packingForwardingCharges || "NA" },
            { label: "TRANSPORTATION CHARGES", value: record.transportationCharges || "Customer’s scope" },
            { label: "TRANSPORTER NAME", value: record.transporterName || "Customer’s Vehicle" },
            { label: "MODE & PLACE OF DELIVERY", value: record.modePlaceDelivery || "EX WORKS" },
            { label: "VALIDITY", value: record.offerValidity || "30 days from the date of this offer." },
            { label: "HSN CODES", value: hsnCodesValue }
        ];

        // --- Page 1 Content ---
        await addHeader();

        // Quotation details (left side)
        pdf.setFontSize(10);
        pdf.setTextColor("#000");
        pdf.setFont("helvetica", "normal");

        pdf.text(quotationNumber, padding, y);
        y += lineHeight * 2;
        pdf.text("To,", padding, y);
        y += lineHeight;
        pdf.setFont("helvetica", "bold");
        pdf.text(`M/s ${toCompany}`, padding, y);
        pdf.setFont("helvetica", "normal");
        y += lineHeight;
        pdf.text(`KIND ATTN: ${attnContact}`, padding, y);
        y += lineHeight;
        pdf.text(`Mobile: ${attnMobile}`, padding, y);
        y += lineHeight;
        pdf.text(`E-mail: ${attnEmail}`, padding, y);
        y += lineHeight * 2;
        pdf.setFont("helvetica", "bold");
        pdf.text(`SUB: ${subject}`, padding, y);
        pdf.setFont("helvetica", "normal");
        y += lineHeight;
        pdf.text(`REF: ${reference}`, padding, y);

        // Date (right side)
        pdf.text(`DATE: ${quotationDate}`, pdfWidth - padding, padding + 40, { align: "right" });

        y += lineHeight * 2;
        pdf.setFont("helvetica", "bold");
        pdf.text("Dear Customer,", padding, y);
        y += lineHeight * 2;
        pdf.setFont("helvetica", "normal");
        pdf.text("We thank you for enquiry, we are pleased to submit our Techno Commercial Offer, as under.", padding, y, { maxWidth: pdfWidth - 2 * padding });
        y += lineHeight * 2;
        pdf.text("We, “Mega Cranes” is a Promising & Reliable Original Equipment Manufacturer of Overhead Cranes and Electric Wire Rope Hoist in South India, situated at Coimbatore more than a decade.", padding, y, { maxWidth: pdfWidth - 2 * padding });
        y += lineHeight * 2;
        pdf.text("We are also an Authorized Crane Partner of “KITO” Japan for Electric Chain Hoist, Manual Hoist, Rope Hoist. KITO is the Worlds No.1 Chain Hoist manufacturer.", padding, y, { maxWidth: pdfWidth - 2 * padding });

        y += lineHeight * 4;
        pdf.setFontSize(12);
        pdf.setFont("helvetica", "bold");
        pdf.text("Annexure I - Price & Scope Details", pdfWidth / 2, y, { align: "center" });
        y += lineHeight * 2;
        pdf.text("Annexure II - Terms & Conditions", pdfWidth / 2, y, { align: "center" });
        pdf.setFontSize(10); // Reset font size

        y += lineHeight * 4;
        pdf.setFont("helvetica", "normal");
        pdf.text("We hope you will find our offer most competitive, if you have clarifications, please feel free to contact us.", padding, y, { maxWidth: pdfWidth - 2 * padding });
        y += lineHeight * 2;
        pdf.text("Looking forward for your valued order at the earliest.", padding, y);
        y += lineHeight * 2;
        pdf.text("Yours Faithfully", padding, y);
        y += lineHeight;
        pdf.setFont("helvetica", "bold");
        pdf.text("For MEGA CRANES INDIA PVT LTD.,", padding, y);

        y += lineHeight * 3;
        pdf.text("Sivaraman.P.S", padding, y);
        y += lineHeight;
        pdf.setFont("helvetica", "normal");
        pdf.text("Head – Business Development", padding, y);
        y += lineHeight;
        pdf.text("+91 9944039125", padding, y);

        // Page number for Page 1 - Temporarily "N/A", will be updated later
        let pageCount = pdf.internal.getNumberOfPages();


        // --- Page 2 (and subsequent pages for table) ---
        pdf.addPage();
        y = padding; // Reset Y for new page
        await addHeader(); // Add header to new page

        pdf.setFontSize(14);
        pdf.setFont("helvetica", "bold");
        y += lineHeight;
        pdf.text("ANNEXURE - I (PRICE & SCOPE)", pdfWidth / 2, y, { align: "center" });
        y += lineHeight * 2;

        // Table Headers
        pdf.setFontSize(9);
        pdf.setFont("helvetica", "bold");
        const tableStartX = padding;
        let tableY = y;
        const colWidthDesc = (pdfWidth - 2 * padding) * 0.55;
        const colWidthUnit = (pdfWidth - 2 * padding) * 0.15;
        const colWidthQty = (pdfWidth - 2 * padding) * 0.10;
        const colWidthTotal = (pdfWidth - 2 * padding) * 0.20;
        const headerRowHeight = 7; // Fixed height for header row

        // Draw header row background
        pdf.setFillColor("#f2f2f2");
        pdf.rect(tableStartX, tableY, pdfWidth - 2 * padding, headerRowHeight, "F");

        pdf.setDrawColor("#000");
        pdf.setLineWidth(0.2);

        // Header text positioning - Adjusted for better visual alignment
        // DESCRIPTION (Left align with padding)
        pdf.text("DESCRIPTION", tableStartX + cellPadding, tableY + headerRowHeight / 2 , { align: "left", baseline: "middle" });
        // UNIT PRICE (Right align with padding)
        pdf.text("UNIT PRICE", tableStartX + colWidthDesc + colWidthUnit - cellPadding, tableY + headerRowHeight / 2 , { align: "right", baseline: "middle" });
        // QTY (Center align)
        pdf.text("QTY", tableStartX + colWidthDesc + colWidthUnit + (colWidthQty / 2), tableY + headerRowHeight / 2 , { align: "center", baseline: "middle" });
        // TOTAL PRICE (Right align with padding)
        pdf.text("TOTAL PRICE", tableStartX + colWidthDesc + colWidthUnit + colWidthQty + colWidthTotal - cellPadding, tableY + headerRowHeight / 2 , { align: "right", baseline: "middle" });

        // Draw header borders
        pdf.rect(tableStartX, tableY, colWidthDesc, headerRowHeight);
        pdf.rect(tableStartX + colWidthDesc, tableY, colWidthUnit, headerRowHeight);
        pdf.rect(tableStartX + colWidthDesc + colWidthUnit, tableY, colWidthQty, headerRowHeight);
        pdf.rect(tableStartX + colWidthDesc + colWidthUnit + colWidthQty, tableY, colWidthTotal, headerRowHeight);
        tableY += headerRowHeight;

        // Items rows
        pdf.setFontSize(8);
        pdf.setFont("helvetica", "normal");
        // cellPadding is already declared above

        for (const item of record.items || []) {
            const description = item.description || item.productName || 'N/A';
            const unitPrice = parseFloat(item.rate || 0);
            const quantity = parseFloat(item.quantity || 0);
            const totalPrice = unitPrice * quantity;

            // Split description for text wrapping and calculate its height
            const descriptionLines = pdf.splitTextToSize(description, colWidthDesc - 2 * cellPadding);
            const descriptionHeight = descriptionLines.length * lineHeight; // height based on lines
            const actualRowHeight = Math.max(headerRowHeight, descriptionHeight + 2 * cellPadding); // Ensure a minimum row height, or larger if description wraps

            // Check if enough space for the current row + footer
            if (tableY + actualRowHeight + cellPadding > pdfHeight - footerHeight - padding) {
                // Add footer to current page
                pageCount = pdf.internal.getNumberOfPages();
                addFooter(pageCount, "N/A"); // Total pages unknown yet
                pdf.addPage();
                y = padding; // Reset Y for new page
                await addHeader(); // Add header to new page
                pdf.setFontSize(14);
                pdf.setFont("helvetica", "bold");
                y += lineHeight;
                pdf.text("ANNEXURE - I (PRICE & SCOPE) - Continued", pdfWidth / 2, y, { align: "center" });
                y += lineHeight * 2;
                tableY = y; // Reset tableY after new header

                // Redraw table headers on new page
                pdf.setFontSize(9);
                pdf.setFont("helvetica", "bold");
                pdf.setFillColor("#f2f2f2");
                pdf.rect(tableStartX, tableY, pdfWidth - 2 * padding, headerRowHeight, "F");
                pdf.setDrawColor("#000");
                pdf.setLineWidth(0.2);
                pdf.text("DESCRIPTION", tableStartX + cellPadding, tableY + headerRowHeight / 2 + 1, { align: "left", baseline: "middle" });
                pdf.text("UNIT PRICE", tableStartX + colWidthDesc +   cellPadding, tableY + headerRowHeight / 2 + 1, { align: "right", baseline: "middle" });
                pdf.text("QTY", tableStartX + colWidthDesc + colWidthUnit + (colWidthQty / 2), tableY + headerRowHeight / 2 + 1, { align: "center", baseline: "middle" });
                pdf.text("TOTAL PRICE", tableStartX + colWidthDesc + colWidthUnit + colWidthQty + colWidthTotal - cellPadding, tableY + headerRowHeight / 2 + 1, { align: "right", baseline: "middle" });
                pdf.rect(tableStartX, tableY, colWidthDesc, headerRowHeight);
                pdf.rect(tableStartX + colWidthDesc, tableY, colWidthUnit, headerRowHeight);
                pdf.rect(tableStartX + colWidthDesc + colWidthUnit, tableY, colWidthQty, headerRowHeight);
                pdf.rect(tableStartX + colWidthDesc + colWidthUnit + colWidthQty, tableY, colWidthTotal, headerRowHeight);
                tableY += headerRowHeight;
                pdf.setFontSize(8);
                pdf.setFont("helvetica", "normal");
            }

            // Draw item row content and borders
            pdf.rect(tableStartX, tableY, colWidthDesc, actualRowHeight);
            pdf.rect(tableStartX + colWidthDesc, tableY, colWidthUnit, actualRowHeight);
            pdf.rect(tableStartX + colWidthDesc + colWidthUnit, tableY, colWidthQty, actualRowHeight);
            pdf.rect(tableStartX + colWidthDesc + colWidthUnit + colWidthQty, tableY, colWidthTotal, actualRowHeight);

            // Calculate vertical center for text in cells - Adjusted +1 for better visual alignment
            const textYOffset = (actualRowHeight - (descriptionLines.length * lineHeight)) / 2 + cellPadding + 1;
            const singleLineTextYOffset = actualRowHeight / 2 + 1;

            // Description (Left aligned, wrapped)
            pdf.text(descriptionLines, tableStartX + cellPadding, tableY + textYOffset);

            // Unit Price (Right aligned)
            pdf.text(formatCurrency(unitPrice), tableStartX + colWidthDesc + colWidthUnit - cellPadding, tableY + singleLineTextYOffset, { align: "right", baseline: "middle" });

            // Quantity (Center aligned)
            pdf.text(String(quantity), tableStartX + colWidthDesc + colWidthUnit + (colWidthQty / 2), tableY + singleLineTextYOffset, { align: "center", baseline: "middle" });

            // Total Price (Right aligned)
            pdf.text(formatCurrency(totalPrice), tableStartX + colWidthDesc + colWidthUnit + colWidthQty + colWidthTotal - cellPadding, tableY + singleLineTextYOffset, { align: "right", baseline: "middle" });

            tableY += actualRowHeight;
        }

        // Summary Rows
        const summaryRowHeight = 7;
        pdf.setFontSize(9);
        pdf.setFont("helvetica", "bold");

        // Sub Total
        if (tableY + summaryRowHeight > pdfHeight - footerHeight - padding) {
            pageCount = pdf.internal.getNumberOfPages();
            pdf.addPage();
            y = padding;
            await addHeader();
            y += lineHeight * 2;
            tableY = y;
        }
        pdf.rect(tableStartX, tableY, pdfWidth - 2 * padding, summaryRowHeight); // Spanning across all columns
        pdf.text("SUB TOTAL", tableStartX + colWidthDesc + colWidthUnit + colWidthQty - cellPadding, tableY + summaryRowHeight / 2 + 1, { align: "right", baseline: "middle" });
        pdf.text(formatCurrency(subTotalAmount), tableStartX + colWidthDesc + colWidthUnit + colWidthQty + colWidthTotal - cellPadding, tableY + summaryRowHeight / 2 + 1, { align: "right", baseline: "middle" });
        tableY += summaryRowHeight;

        // GST
        if (tableY + summaryRowHeight > pdfHeight - footerHeight - padding) {
            pageCount = pdf.internal.getNumberOfPages();
            pdf.addPage();
            y = padding;
            await addHeader();
            y += lineHeight * 2;
            tableY = y;
        }
        pdf.setFont("helvetica", "normal");
        pdf.rect(tableStartX, tableY, pdfWidth - 2 * padding, summaryRowHeight);
        pdf.text("TAXES - GST 18%", tableStartX + colWidthDesc + colWidthUnit + colWidthQty - cellPadding, tableY + summaryRowHeight / 2 + 1, { align: "right", baseline: "middle" });
        pdf.text(formatCurrency(gstAmount), tableStartX + colWidthDesc + colWidthUnit + colWidthQty + colWidthTotal - cellPadding, tableY + summaryRowHeight / 2 + 1, { align: "right", baseline: "middle" });
        tableY += summaryRowHeight;

        // Grand Total
        if (tableY + summaryRowHeight > pdfHeight - footerHeight - padding) {
            pageCount = pdf.internal.getNumberOfPages();
            pdf.addPage();
            y = padding;
            await addHeader();
            y += lineHeight * 2;
            tableY = y;
        }
        pdf.setFont("helvetica", "bold");
        pdf.rect(tableStartX, tableY, pdfWidth - 2 * padding, summaryRowHeight);
        pdf.text("GRAND TOTAL", tableStartX + colWidthDesc + colWidthUnit + colWidthQty - cellPadding, tableY + summaryRowHeight / 2 + 1, { align: "right", baseline: "middle" });
        pdf.text(formatCurrency(grandTotalAmount), tableStartX + colWidthDesc + colWidthUnit + colWidthQty + colWidthTotal - cellPadding, tableY + summaryRowHeight / 2 + 1, { align: "right", baseline: "middle" });
        y = tableY + summaryRowHeight + 10; // Move Y cursor past table

        // Total in words
        pdf.setFontSize(9);
        pdf.setFont("helvetica", "normal");
        const totalWordsText = convertNumberToWords(grandTotalAmount);
        const textLines = pdf.splitTextToSize(`Amount in words: ${totalWordsText}`, pdfWidth - 2 * padding - 20); // Add some margin
        y += lineHeight;
        if (y + (textLines.length * lineHeight) > pdfHeight - footerHeight - padding) {
            pageCount = pdf.internal.getNumberOfPages();
            pdf.addPage();
            y = padding;
            await addHeader();
            y += lineHeight * 2;
        }
        pdf.text(`Amount in words:`, padding, y);
        y += lineHeight;
        pdf.text(textLines, padding + 10, y); // Indent the wrapped text
        y += (textLines.length * lineHeight) + 5;


        // Notes and Customer's Scope Box
        const boxPadding = 5;
        const boxStartX = padding;
        const boxWidth = pdfWidth - 2 * padding;

        const noteTitleLines = pdf.splitTextToSize("Note:", boxWidth - 2 * boxPadding);
        const noteContentLines = pdf.splitTextToSize(quotationNotes, boxWidth - 2 * boxPadding);
        const customerScopeTitleLines = pdf.splitTextToSize("CUSTOMER'S SCOPE:", boxWidth - 2 * boxPadding);
        const customerScopeContentLines = customerScope.split('\n').filter(line => line.trim() !== '');

        let requiredBoxHeight = (noteTitleLines.length * lineHeight) + (noteContentLines.length * lineHeight) +
            (customerScopeTitleLines.length * lineHeight) + (customerScopeContentLines.length * lineHeight * 1.2) + // Adjust for list item spacing
            (boxPadding * 4) + 20; // Padding within box and line separators

        if (y + requiredBoxHeight > pdfHeight - footerHeight - padding) {
            pageCount = pdf.internal.getNumberOfPages();
            pdf.addPage();
            y = padding;
            await addHeader();
            y += lineHeight * 2;
        }

        const boxY = y;
        pdf.rect(boxStartX, boxY, boxWidth, requiredBoxHeight); // Draw box border

        let currentBoxY = boxY + boxPadding;
        pdf.setFont("helvetica", "bold");
        pdf.text(noteTitleLines, boxStartX + boxPadding, currentBoxY);
        currentBoxY += (noteTitleLines.length * lineHeight);
        pdf.setDrawColor("#000");
        pdf.setLineWidth(0.1);
        pdf.line(boxStartX + boxPadding, currentBoxY, boxStartX + boxWidth - boxPadding, currentBoxY);
        currentBoxY += boxPadding;

        pdf.setFont("helvetica", "normal");
        pdf.text(noteContentLines, boxStartX + boxPadding, currentBoxY, { maxWidth: boxWidth - 2 * boxPadding });
        currentBoxY += (noteContentLines.length * lineHeight) + boxPadding * 2;

        pdf.setFont("helvetica", "bold");
        pdf.text(customerScopeTitleLines, boxStartX + boxPadding, currentBoxY);
        currentBoxY += (customerScopeTitleLines.length * lineHeight);
        pdf.setDrawColor("#000");
        pdf.setLineWidth(0.1);
        pdf.line(boxStartX + boxPadding, currentBoxY, boxStartX + boxWidth - boxPadding, currentBoxY);
        currentBoxY += boxPadding;

        pdf.setFont("helvetica", "normal");
        for (const line of customerScopeContentLines) {
            const wrappedLines = pdf.splitTextToSize(`• ${line.trim()}`, boxWidth - 2 * boxPadding - 5); // Indent for bullet point
            for (const wrappedLine of wrappedLines) {
                if (currentBoxY + lineHeight * 1.2 > boxY + requiredBoxHeight - boxPadding) {
                    // This indicates the box content might overflow the initial estimate.
                    // For simplicity, we will continue drawing, but in a more complex scenario,
                    // you might need to add a new box or indicate continuation.
                    // For now, let's assume the box size estimation is mostly accurate.
                }
                pdf.text(wrappedLine, boxStartX + boxPadding, currentBoxY);
                currentBoxY += lineHeight * 1.2;
            }
        }
        y = boxY + requiredBoxHeight + 10; // Update overall Y position

        // Terms & Conditions
        pdf.setFontSize(14);
        pdf.setFont("helvetica", "bold");
        if (y + lineHeight * 4 + (termsData.length * headerRowHeight) > pdfHeight - footerHeight - padding) {
            pageCount = pdf.internal.getNumberOfPages();
            pdf.addPage();
            y = padding;
            await addHeader();
            y += lineHeight * 2;
        }
        pdf.text("ANNEXURE - II - TERMS & CONDITIONS", pdfWidth / 2, y, { align: "center" });
        y += lineHeight * 2;

        pdf.setFontSize(9);
        pdf.setFont("helvetica", "normal");
        const termsCol1Width = (pdfWidth - 2 * padding) * 0.35;
        const termsCol2Width = (pdfWidth - 2 * padding) * 0.65;
        const termRowMinHeight = 7; // Minimum height, expands if text wraps

        for (const term of termsData) {
            const labelLines = pdf.splitTextToSize(`${term.label}:`, termsCol1Width - 2 * cellPadding);
            const valueLines = pdf.splitTextToSize(term.value || 'N/A', termsCol2Width - 2 * cellPadding);
            const actualTermRowHeight = Math.max(
                termRowMinHeight,
                (labelLines.length * lineHeight) + 2 * cellPadding,
                (valueLines.length * lineHeight) + 2 * cellPadding
            );

            if (y + actualTermRowHeight > pdfHeight - footerHeight - padding) {
                pageCount = pdf.internal.getNumberOfPages();
                    pdf.addPage();
                y = padding;
                await addHeader();
                y += lineHeight * 2;
                pdf.setFontSize(14);
                pdf.setFont("helvetica", "bold");
                pdf.text("ANNEXURE - II - TERMS & CONDITIONS - Continued", pdfWidth / 2, y, { align: "center" });
                y += lineHeight * 2;
                pdf.setFontSize(9);
                pdf.setFont("helvetica", "normal");
            }

            pdf.setDrawColor("#000");
            pdf.setLineWidth(0.2);
            pdf.rect(padding, y, termsCol1Width, actualTermRowHeight);
            pdf.rect(padding + termsCol1Width, y, termsCol2Width, actualTermRowHeight);

            // Calculate vertical center for text in cells - Adjusted +1 for better visual alignment
            const labelTextYOffset = (actualTermRowHeight - (labelLines.length * lineHeight)) / 2 + cellPadding + 1;
            const valueTextYOffset = (actualTermRowHeight - (valueLines.length * lineHeight)) / 2 + cellPadding + 1;


            pdf.setFont("helvetica", "bold");
            pdf.text(labelLines, padding + cellPadding, y + labelTextYOffset);
            pdf.setFont("helvetica", "normal");
            pdf.text(valueLines, padding + termsCol1Width + cellPadding, y + valueTextYOffset);
            y += actualTermRowHeight; // Move Y for next row
        }

        y += lineHeight * 2;
        pdf.setFont("helvetica", "bold");
        if (y + lineHeight * 5 > pdfHeight - footerHeight - padding) {
            pageCount = pdf.internal.getNumberOfPages();
            pdf.addPage();
            y = padding;
            await addHeader();
            y += lineHeight * 2;
        }
        pdf.text("For MEGA CRANES INDIA PVT LTD.,", padding, y);
        y += lineHeight * 3;
        pdf.text("Sivaraman.P.S", padding, y);
        y += lineHeight;
        pdf.setFont("helvetica", "normal");
        pdf.text("Head – Business Development", padding, y);
        y += lineHeight;
        pdf.text("+91 9944039125", padding, y);

        // Update all page numbers in the footer
        const finalPageCount = pdf.internal.getNumberOfPages();
        for (let i = 1; i <= finalPageCount; i++) {
            pdf.setPage(i);
            addFooter(i, finalPageCount);
        }

        pdf.save(`${record.quotationNumber || "quotation"}_${new Date().toISOString().slice(0, 10)}.pdf`);
        toast.success("PDF downloaded successfully!", { id: toastId });
    } catch (err) {
        console.error("Failed to generate PDF:", err);
        toast.error("Failed to generate PDF. Please try again.", { id: toastId });
    } finally {
        // No temporary divs to clean up as we're drawing directly
    }
};