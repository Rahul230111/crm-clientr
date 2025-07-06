// generateInvoicePdf.js
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { saveAs } from "file-saver";
import toast from "react-hot-toast";
import Logo from '../../assets/Primary Logo 01.png'; // Ensure this path is correct

// Helper functions (retained)

const formatIndianCurrency = (num) => {
    if (isNaN(num)) return "0.00";
    return num.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
};

const numberToWords = (num) => {
    if (typeof num !== "number" || isNaN(num)) return "N/A";
    let number = Math.floor(num);
    let decimal = Math.round((num - number) * 100);

    const units = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];
    const teens = ["Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
    const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
    const scales = ["", "Thousand", "Lakh", "Crore"];

    const numToWordsChunk = (n) => {
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
                words.push(numToWordsChunk(lastThree));
            } else {
                words.push(units[Math.floor(lastThree / 100)] + " Hundred" + (lastThree % 100 !== 0 ? " " + numToWordsChunk(lastThree % 100) : ""));
            }
        }
        number = Math.floor(number / 1000);

        while (number > 0) {
            let chunk = number % 100;
            if (chunk > 0) {
                words.push(numToWordsChunk(chunk) + " " + scales[++i]);
            } else {
                i++;
            }
            number = Math.floor(number / 100);
        }
    }

    const finalWords = words.reverse().filter(Boolean).join(" ").trim();
    let result = finalWords ? finalWords + " Rupees" : "Zero Rupees";

    if (decimal > 0) {
        result += ` and ${numToWordsChunk(decimal)} Paisa`;
    }
    result += " Only";

    return result.replace(/\s+/g, ' ');
};

/**
 * Generates the HTML content for the invoice PDF.
 * This function creates the main HTML string for the invoice.
 * @param {object} invoiceData - The invoice data object.
 * @returns {string} The HTML string for the invoice.
 */
const generateInvoiceHtml = (invoiceData) => {
    // Determine customer details, prioritizing businessId properties if available
    const customerContactName = invoiceData.businessId?.contactName || invoiceData.contactName || "N/A";
    const customerPhone = invoiceData.mobileNumber || invoiceData.businessId?.mobileNumber || invoiceData.businessId?.phone || "N/A";
    const customerEmail = invoiceData.businessId?.email || invoiceData.email || "N/A";
    const customerGSTIN = invoiceData.businessId?.gstNumber || invoiceData.gstin || "N/A";
    // Prioritize businessId.address, then customerAddress (if exists and replaces newlines)
    const customerAddress =  invoiceData.businessId ?
            `${invoiceData.businessId.addressLine1 || ''}, ${invoiceData.businessId.addressLine2 || ''}, ${invoiceData.businessId.addressLine3 || ''}, ${invoiceData.businessId.city || ''} - ${invoiceData.businessId.pincode || ''}, ${invoiceData.businessId.state || ''}, ${invoiceData.businessId.country || ''}`
            : invoiceData.customerAddress || "N/A";
     


      

      
    // Calculate totals
    const subTotal = parseFloat(invoiceData.subTotal) || 0;
    const igstAmount = parseFloat(invoiceData.igstAmount) || 0;
    const cgstAmount = parseFloat(invoiceData.cgstAmount) || 0;
    const sgstAmount = parseFloat(invoiceData.sgstAmount) || 0;
    const grandTotal = parseFloat(invoiceData.totalAmount) || 0;

    const companyLogoSrc = Logo; // Your logo path
    const signatureImageSrc = Logo; // Use same logo or a separate signature image

    const gstBreakdownHtml = () => {
        if (invoiceData.gstType === "interstate") {
            return `
                <tr>
                    <td style="width: 70%;"></td>
                    <td style="border: 1px solid #e0e0e0; padding: 10px; text-align: right; width: 15%; background: #f0f2f5;">IGST (${invoiceData.gstPercentage || 0}%)</td>
                    <td style="border: 1px solid #e0e0e0; padding: 10px; text-align: right; width: 15%;">₹${formatIndianCurrency(igstAmount)}</td>
                </tr>
            `;
        } else if (invoiceData.gstType === "intrastate") {
            const gstHalf = (invoiceData.gstPercentage || 0) / 2;
            return `
                <tr>
                    <td style="width: 70%;"></td>
                    <td style="border: 1px solid #e0e0e0; padding: 10px; text-align: right; width: 15%; background: #f0f2f5;">CGST (${gstHalf}%)</td>
                    <td style="border: 1px solid #e0e0e0; padding: 10px; text-align: right; width: 15%;">₹${formatIndianCurrency(cgstAmount)}</td>
                </tr>
                <tr>
                    <td style="width: 70%;"></td>
                    <td style="border: 1px solid #e0e0e0; padding: 10px; text-align: right; width: 15%; background: #f0f2f5;">SGST (${gstHalf}%)</td>
                    <td style="border: 1px solid #e0e0e0; padding: 10px; text-align: right; width: 15%;">₹${formatIndianCurrency(sgstAmount)}</td>
                </tr>
            `;
        }
        return '';
    };

    const notesHtml = invoiceData.notes && Array.isArray(invoiceData.notes) && invoiceData.notes.length > 0
        ? invoiceData.notes.map(note => `<p style="margin: 2px 0;">${note.text}</p>`).join('')
        : `<p style="margin: 2px 0;">Thank you for your business!</p>`;

    return `
    <div style="padding: 10px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; width: 100%; box-sizing: border-box;">
        <div style="margin-bottom: 15px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <div style="display: flex; align-items: center;">
                    <img src="${companyLogoSrc}" alt="Company Logo" style="height: 60px; margin-right: 10px;">
                    <div>
                        <h2 style="margin: 0; font-size: 18px; font-weight: 600; color: #2c3e50; margin-bottom: 3px;">ACE AUTOMATION</h2>
                        <p style="margin: 1px 0; font-size: 9px; color: #555;">S.F. No. 91, 14B, Padiveedu Thottam,</p>
                        <p style="margin: 1px 0; font-size: 9px; color: #555;">Kalapatty road, Saravanampatti (PO),</p>
                        <p style="margin: 1px 0; font-size: 9px; color: #555;">Coimbatore - 641 035. TN, INDIA.</p>
                        <p style="margin: 1px 0; font-size: 9px; color: #555;">+91 98422 53389 | aceautomation.cbe@gmail.com</p>
                        <p style="margin: 1px 0; font-size: 9px; color: #555;">www.aceautomation.in | GST No. : 33AVDPD3093Q1ZD</p>
                    </div>
                </div>

                <div style="background: linear-gradient(135deg, #4CAF50, #8BC34A); color: white; padding: 10px 20px; font-weight: 600; font-size: 18px; text-align: center; border-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    TAX INVOICE
                </div>
            </div>
            <div style="border-bottom: 1px solid #eee; margin-bottom: 10px;"></div>
        </div>

        <div style="margin-bottom: 20px; background: #f9fafb; border-radius: 4px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
            <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
                <tr>
                    <td style="border: 1px solid #e0e0e0; padding: 6px; font-weight: 600; width: 25%; background: #f0f2f5;">Bill To</td>
                    <td style="border: 1px solid #e0e0e0; padding: 6px; width: 25%;">
                        ${invoiceData.businessId?.businessName || invoiceData.customerName || "N/A"}
                    </td>
                    <td style="border: 1px solid #e0e0e0; padding: 6px; font-weight: 600; width: 25%; background: #f0f2f5;">Invoice No</td>
                    <td style="border: 1px solid #e0e0e0; padding: 6px; width: 25%;">
                        ${invoiceData.invoiceNumber || "N/A"}
                    </td>
                </tr>
                <tr>
                    <td style="border: 1px solid #e0e0e0; padding: 6px; font-weight: 600; background: #f0f2f5;">Contact Person</td>
                    <td style="border: 1px solid #e0e0e0; padding: 6px;">
                        ${customerContactName}
                    </td>
                    <td style="border: 1px solid #e0e0e0; padding: 6px; font-weight: 600; background: #f0f2f5;">Date</td>
                    <td style="border: 1px solid #e0e0e0; padding: 6px;">
                        ${invoiceData.date || new Date().toLocaleDateString("en-IN")}
                    </td>
                </tr>
                <tr>
                    <td style="border: 1px solid #e0e0e0; padding: 6px; font-weight: 600; background: #f0f2f5;">Mobile</td>
                    <td style="border: 1px solid #e0e0e0; padding: 6px;">
                        ${customerPhone}
                    </td>
                    <td style="border: 1px solid #e0e0e0; padding: 6px; font-weight: 600; background: #f0f2f5;">Due Date</td>
                    <td style="border: 1px solid #e0e0e0; padding: 6px;">
                        ${invoiceData.dueDate || "N/A"}
                    </td>
                </tr>
                <tr>
                    <td style="border: 1px solid #e0e0e0; padding: 6px; font-weight: 600; background: #f0f2f5;">Email</td>
                    <td style="border: 1px solid #e0e0e0; padding: 6px;" colspan="3">
                        ${customerEmail}
                    </td>
                </tr>
                <tr>
                    <td style="border: 1px solid #e0e0e0; padding: 6px; font-weight: 600; background: #f0f2f5;">GSTIN</td>
                    <td style="border: 1px solid #e0e0e0; padding: 6px;" colspan="3">
                        ${customerGSTIN}
                    </td>
                </tr>
                <tr>
                    <td style="border: 1px solid #e0e0e0; padding: 6px; font-weight: 600; background: #f0f2f5;">Address</td>
                    <td style="border: 1px solid #e0e0e0; padding: 6px;" colspan="3">
                        ${customerAddress}
                    </td>
                </tr>
            </table>
        </div>

        ${
            invoiceData.items?.length > 0
                ? `
                <div style="margin-top: 20px; overflow: hidden; border-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
                    <table style="width: 100%; border-collapse: collapse; margin-bottom: 10px; table-layout: fixed; font-size: 11px;">
                        <colgroup>
                            <col style="width: 5%;"> <col style="width: 20%;"> <col style="width: 25%;"> <col style="width: 10%;"> <col style="width: 8%;"> <col style="width: 12%;"> <col style="width: 10%;"> <col style="width: 10%;"> </colgroup>
                        <thead>
                            <tr style="background: linear-gradient(135deg, #2c3e50, #34495e); color: white;">
                                <th style="border: 1px solid #2c3e50; padding: 8px; text-align: center;">S.No</th>
                                <th style="border: 1px solid #2c3e50; padding: 8px; text-align: left;">Product Name</th>
                                <th style="border: 1px solid #2c3e50; padding: 8px; text-align: left;">Specification</th>
                                <th style="border: 1px solid #2c3e50; padding: 8px; text-align: center;">Qty</th>
                                <th style="border: 1px solid #2c3e50; padding: 8px; text-align: center;">Unit</th>
                                <th style="border: 1px solid #2c3e50; padding: 8px; text-align: center;">HSN/SAC</th>
                                <th style="border: 1px solid #2c3e50; padding: 8px; text-align: right;">Unit Price (₹)</th>
                                <th style="border: 1px solid #2c3e50; padding: 8px; text-align: right;">Total (₹)</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${invoiceData.items
                                .map((item, idx) => {
                                    let itemDescription = item?.productName || item?.description || ""; // Prioritize productName
                                    if (!itemDescription && item.specifications?.length > 0) {
                                        const modelSpec = item.specifications.find(s => s.name === "Model");
                                        if (modelSpec) {
                                            itemDescription = modelSpec.value;
                                        } else if (item.specifications.length > 0) {
                                            itemDescription = item.specifications.map(s => `${s.name}: ${s.value}`).join(", ");
                                        }
                                    }
                                    itemDescription = itemDescription || "N/A";

                                    const specifications =
                                        item?.specifications && item.specifications.length > 0
                                            ? item.specifications
                                                .map((spec) => `${spec.name}: ${spec.value}`)
                                                .join(", ")
                                            : "N/A";
                                    const quantity = parseFloat(item.quantity) || 0;
                                    const rate = parseFloat(item.rate) || 0;
                                    const total = (quantity * rate).toFixed(2);

                                    return `
                                    <tr style="${idx % 2 === 0 ? 'background: #fff;' : 'background: #f9fafb;'}">
                                        <td style="border: 1px solid #e0e0e0; padding: 8px; text-align: center; vertical-align: top;">${idx + 1}</td>
                                        <td style="border: 1px solid #e0e0e0; padding: 8px; text-align: left; vertical-align: top;">${itemDescription}</td>
                                        <td style="border: 1px solid #e0e0e0; padding: 8px; text-align: left; vertical-align: top;">${specifications}</td>
                                        <td style="border: 1px solid #e0e0e0; padding: 8px; text-align: center; vertical-align: top;">${quantity}</td>
                                        <td style="border: 1px solid #e0e0e0; padding: 8px; text-align: center; vertical-align: top;">${item.quantityType || "N/A"}</td>
                                        <td style="border: 1px solid #e0e0e0; padding: 8px; text-align: center; vertical-align: top;">${item.hsnSac || "N/A"}</td>
                                        <td style="border: 1px solid #e0e0e0; padding: 8px; text-align: right; vertical-align: top;">₹${formatIndianCurrency(rate)}</td>
                                        <td style="border: 1px solid #e0e0e0; padding: 8px; text-align: right; font-weight: 600; vertical-align: top;">₹${formatIndianCurrency(parseFloat(total))}</td>
                                    </tr>
                                `;
                                })
                                .join("")}
                        </tbody>
                    </table>
                </div>

                <div style="margin-top: 15px; background: #f9fafb; border-radius: 4px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
                    <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
                        <tr>
                            <td style="width: 70%;"></td>
                            <td style="border: 1px solid #e0e0e0; padding: 8px; text-align: right; font-weight: 600; width: 15%; background: #f0f2f5;">Sub Total</td>
                            <td style="border: 1px solid #e0e0e0; padding: 8px; text-align: right; font-weight: 600; width: 15%;">₹${formatIndianCurrency(subTotal)}</td>
                        </tr>
                        ${gstBreakdownHtml()}
                        <tr style="background: #e8f5e9;">
                            <td style="width: 70%;"></td>
                            <td style="border: 1px solid #e0e0e0; padding: 8px; text-align: right; font-weight: 600; font-size: 12px; width: 15%;">Grand Total</td>
                            <td style="border: 1px solid #e0e0e0; padding: 8px; text-align: right; font-weight: 600; font-size: 12px; width: 15%;">₹${formatIndianCurrency(grandTotal)}</td>
                        </tr>
                    </table>
                </div>

                <div style="margin-top: 10px; background: #f5f5f5; border: 1px solid #e0e0e0; border-radius: 4px; padding: 10px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
                    <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
                        <tr>
                            <td style="font-weight: 600; padding: 3px; width: 25%; color: #555;">Amount In Words</td>
                            <td style="padding: 3px; font-style: italic; width: 75%;">${numberToWords(grandTotal)}</td>
                        </tr>
                    </table>
                </div>
            `
                : ""
        }

        <div style="margin-top: 15px; font-size: 11px; color: #555;">
            <p style="margin: 4px 0; font-weight: 600; color: #2c3e50;">Payment Terms:</p>
            <p style="margin: 1px 0;">${invoiceData.paymentTerms || "Payment due within 15 days of invoice date."}</p>

            <p style="margin: 8px 0; font-weight: 600; color: #2c3e50;">Notes:</p>
            <div style="margin-left: 5px;">
                ${notesHtml}
            </div>

            <p style="margin: 8px 0; font-weight: 600; color: #2c3e50;">Bank Details:</p>
            <p style="margin: 1px 0;">Bank Name: Your Bank Name</p>
            <p style="margin: 1px 0;">Account Number: XXXXXXXXXXXX</p>
            <p style="margin: 1px 0;">IFSC Code: XXXXXXXXXX</p>
            <p style="margin: 1px 0;">Branch: Your Branch Name</p>
        </div>

        <div style="margin-top: 25px; border-top: 1px solid #eee; padding-top: 15px;">
            <div style="text-align: right;">
                <img src="${signatureImageSrc}" alt="Authorized Signature" style="height: 50px; display: block; margin-left: auto; margin-bottom: 3px;">
                <p style="margin: 4px 0; font-size: 11px; font-weight: 600; color: #2c3e50;">Authorized Signatory</p>
            </div>
            <p style="text-align: center; font-size: 9px; color: #999; margin-top: 15px;">
                This is Computer Generated Invoice & requires no Signature
            </p>
        </div>
    </div>
    `;
};


const generateInvoicePdf = async (invoiceData) => {
    if (!invoiceData) return;

    const toastId = toast.loading("Generating Invoice PDF...", {
        position: "top-center",
    });

    let tempDiv = null;

    try {
        const htmlContent = generateInvoiceHtml(invoiceData);

        const doc = new jsPDF({
            orientation: "portrait",
            unit: "mm",
            format: "a4",
            hotfixes: ["px_scaling"]
        });

        doc.setProperties({
            title: `Invoice - ${invoiceData.invoiceNumber}`,
            subject: "Invoice",
            author: invoiceData.companyName || "ACE AUTOMATION",
            keywords: "invoice, billing",
            creator: "Invoice Management System",
        });

        const pdfWidth = doc.internal.pageSize.getWidth();
        const pdfHeight = doc.internal.pageSize.getHeight();
        const padding = 5; // Reduced global padding for the PDF page itself

        // Create a temporary div element to render HTML content for html2canvas
        tempDiv = document.createElement("div");
        tempDiv.style.position = "fixed";
        tempDiv.style.top = "-9999px";
        tempDiv.style.left = "-9999px";
        // Set width to match PDF content area, considering padding
        tempDiv.style.width = `${pdfWidth - 2 * padding}mm`;
        // No padding on tempDiv, as padding is handled by the root HTML element's style
        tempDiv.style.background = "white";
        tempDiv.style.zIndex = "-1";
        tempDiv.style.display = "block";
        tempDiv.innerHTML = htmlContent;
        document.body.appendChild(tempDiv);

        await new Promise((resolve) => setTimeout(resolve, 200));

        const canvas = await html2canvas(tempDiv, {
            scale: 3,
            useCORS: true,
            logging: false,
            allowTaint: true,
            letterRendering: true,
            backgroundColor: "#ffffff"
        });

        const imgData = canvas.toDataURL("image/png", 1.0);
        const imgProps = doc.getImageProperties(imgData);
        const imgHeight = (imgProps.height * (pdfWidth - 2 * padding)) / imgProps.width; // Use new padding here

        let currentY = padding;
        let pageHeight = pdfHeight - 2 * padding;

        if (imgHeight > pageHeight) {
            let heightLeft = imgHeight;
            let position = 0;

            doc.addImage(imgData, "PNG", padding, currentY, pdfWidth - 2 * padding, imgHeight);
            heightLeft -= pageHeight;
            position -= pageHeight;

            while (heightLeft > 0) {
                doc.addPage();
                doc.addImage(imgData, "PNG", padding, position + currentY, pdfWidth - 2 * padding, imgHeight);
                heightLeft -= pageHeight;
                position -= pageHeight;
            }
        } else {
            doc.addImage(imgData, "PNG", padding, currentY, pdfWidth - 2 * padding, imgHeight);
        }

        const pdfBlob = doc.output("blob");
        saveAs(
            pdfBlob,
            `invoice-${invoiceData.invoiceNumber || "draft"}.pdf`
        );  
        toast.success("Invoice PDF downloaded successfully!", { id: toastId });
    } catch (error) {
        console.error("Error generating PDF:", error);
        toast.error("Failed to generate PDF. Please try again.", { id: toastId });
    } finally {
        if (tempDiv && document.body.contains(tempDiv)) {
            document.body.removeChild(tempDiv);
        }
    }
};

export default generateInvoicePdf;