import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import toast from "react-hot-toast";
// IMPORTANT: Ensure this path points to your MEGA CRANES logo image
import Logo from '../../assets/megacraneq.png'; // Update this path to your actual logo

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
    // Handle hundreds part of the last three digits
    let lastThree = number % 1000;
    if (lastThree > 0) {
      if (lastThree < 100) {
        words.push(numToWords(lastThree));
      } else {
        words.push(units[Math.floor(lastThree / 100)] + " Hundred" + (lastThree % 100 !== 0 ? " " + numToWords(lastThree % 100) : ""));
      }
    }
    number = Math.floor(number / 1000); // Move to thousands

    // Handle thousands, lakhs, crores
    while (number > 0) {
      let chunk = number % 100; // Process in chunks of 100 (for Lakhs, Crores)
      if (chunk > 0) {
        words.push(numToWords(chunk) + " " + scales[++i]);
      } else {
        i++;
      }
      number = Math.floor(number / 100); // Move to next scale
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

const generateQuotationHtmlParts = (quotation) => {
  // Calculate totals based on quotation items
  const subTotalAmount = quotation.items?.reduce(
    (sum, item) => sum + (parseFloat(item.quantity || 0) * parseFloat(item.rate || 0)),
    0
  ) || 0;

  const gstRate = 0.18; // Based on image: GST 18%
  const gstAmount = subTotalAmount * gstRate;
  const grandTotalAmount = subTotalAmount + gstAmount;

  const companyLogoSrc = Logo; // Path to your Mega Cranes logo
  // Use the same logo for signature for now, or replace with actual signature image if available
  const signatureImageSrc = Logo;

  // Dynamic data points from the quotation object, with fallbacks
  const toCompany = quotation.businessName || "M/s. LMW Limited, Foundry Division UNIT - 31 (Unit 2), Arasur, Coimbatore – 641 407";
  const attnContact = quotation.businessId?.contactName || quotation.contactName || "N/A";
  const attnMobile = quotation.mobileNumber || quotation.businessId?.mobileNumber || quotation.businessId?.phone || "N/A";
  const attnEmail = quotation.businessId?.email || quotation.email || "N/A";

  // --- UPDATED SUBJECT LOGIC ---
  let subject = quotation.subject; // Prioritize the subject from the form
  if (!subject && quotation.items && quotation.items.length > 0) {
    // If no specific subject is provided, try to create one from item descriptions
    const itemDescriptions = quotation.items.map(item =>  item.productName).filter(Boolean);
    if (itemDescriptions.length > 0) {
      subject = `Offer for ${itemDescriptions.slice(0, 2).join(' & ')}`; // Take first 2 items
      if (itemDescriptions.length > 2) {
        subject += '...'; // Add ellipsis if more items
      }
    } else {
      subject = "Offer for your requirement"; // Generic fallback if no items have descriptions
    }
  } else if (!subject) {
    subject = "Offer for your requirement"; // Final fallback if no subject and no items
  }
  // --- END UPDATED SUBJECT LOGIC ---

  const reference = quotation.reference || `Your telecom enquiry dated ${new Date().toLocaleDateString("en-IN")}`;
  const quotationDate = quotation.date ? new Date(quotation.date).toLocaleDateString("en-IN") : new Date().toLocaleDateString("en-IN");
  const quotationNumber = quotation.quotationNumber || "MCIPL/OFR/0/NXL";

  // Use dynamic notes and customer scope from quotation object
  const quotationNotes = quotation.quotationNotes || "If Installation or any other Service is required, additional charges of Rs.4,500/- will be Applicable extra on PER MAN DAY (i.e, Per Engineer Per Day) basis + GST 18% Extra. If required, you have to release a separate Work Order";
  const customerScope = quotation.customerScope || `Transportation from our works to your site
Unloading the materials @Site, Storage, Security, Inhouse Transportation
Required Cables, SFU, Ladders, Scaffoldings, Platforms, Cranes, Chain Block other requirements for Installation.
Installation with Required Base & Cables, Materials & Modifications
Additional Materials, Spares, Modifications & Services (if required)`;

  // --- HSN CODES LOGIC MODIFICATION ---
  // Aggregate hsnSac from all items
  const aggregatedHsnSacs = Array.from(new Set(
    quotation.items
      ?.map(item => item.hsnSac)
      .filter(hsn => hsn && hsn.trim() !== '')
  )).join(', ');

  let hsnCodesValue = quotation.hsnCodes; // Prefer the top-level hsnCodes if available

  if (!hsnCodesValue && aggregatedHsnSacs) {
      hsnCodesValue = aggregatedHsnSacs; // Use aggregated hsnSac if top-level hsnCodes is empty
  } else if (!hsnCodesValue) {
      hsnCodesValue = "Spares - 84311090, Service - 998719"; // Fallback to default if both are empty
  }
  // --- END HSN CODES LOGIC MODIFICATION ---


  // Dynamically generate Terms & Conditions table rows
  const termsData = [
    { label: "PRICES", value: quotation.pricesTerms || "EX WORKS COIMBATORE with open packing basis." },
    { label: "OUR PAYMENT TERMS", value: quotation.ourPaymentTerms || "100% payment + 100% GST before dispatch from our works" },
    { label: "DELIVERY", value: quotation.delivery || "4 - 6 weeks against receipt of your firm PO" },
    { label: "PACKING & FORWARDING CHARGES", value: quotation.packingForwardingCharges || "NA" },
    { label: "TRANSPORTATION CHARGES", value: quotation.transportationCharges || "Customer’s scope" },
    { label: "TRANSPORTER NAME", value: quotation.transporterName || "Customer’s Vehicle" },
    { label: "MODE & PLACE OF DELIVERY", value: quotation.modePlaceDelivery || "EX WORKS" },
    { label: "OFFER VALIDITY", value: quotation.offerValidity || "30 days from the date of this offer." },
    { label: "WARRANTY", value: quotation.warranty || "12 months from the date of dispatch or 1000 running hours whichever is earlier." },
    // Use the determined hsnCodesValue
    { label: "HSN CODES", value: hsnCodesValue }
  ];

  const termsRowsHtml = termsData.map(term => `
    <tr>
        <td style="border: 1px solid #000; padding: 6px; font-weight: bold; width: 35%;">${term.label}:</td>
        <td style="border: 1px solid #000; padding: 6px; width: 65%;">${term.value || 'N/A'}</td>
    </tr>
  `).join('');

  // Common Header for both pages
  const commonHeaderHtml = `
    <div style="margin: 0 auto;padding: 10px 20px;font-family: Cambria ;">
  <div style="display: flex;align-items: center;border-bottom: 2px solid #d35400;padding-bottom: 10px;justify-content: space-around;">
    <img src="${companyLogoSrc}" alt="Company Logo" style="width: 80px; height: auto; margin-right: 15px;">
    <div style="text-align: left;">
      <h2 style="margin: 0;font-size: 24px;font-weight: bold;color: #D35400;text-transform: uppercase;">
        MEGA CRANES INDIA PRIVATE LIMITED
      </h2>
      <div style="font-size: 10px;color: #D35400;margin-top: 2px;text-align: center;">
        (An ISO 9001 : 2015 Certified company)
      </div>
    </div>
  </div>

  <div style="text-align: center; font-size: 11px; color: #333; margin-top: 8px; border-bottom: 2px solid #d35400;padding-bottom: 10px">
    <p style="margin: 4px 0;">
      S.F. No. 2/8, 2/9, 2/11, Thelungupalayam Road, Ellapalayam (P.O), Annur, Coimbatore - 641 697.
      Mob : 99949 63033, 99949 93032.
    </p>
    <p style="margin: 4px 0;">
      E-mail : <a href="mailto:info@megacranesindia.com" style="color: #000;">info@megacranesindia.com</a>,
      <a href="mailto:marketing@megacranesindia.com" style="color: #000;">marketing@megacranesindia.com</a>
      &nbsp;&nbsp;&nbsp;&nbsp;
      Website : <a href="http://www.megacranesindia.com" style="color: #D35400; font-weight: bold;">www.megacranesindia.com</a>
    </p>
    <p style="margin: 4px 0;">
      GST No : 33AACCM6869G1Z8 &nbsp;&nbsp;&nbsp;&nbsp;
      PAN No : AACCM6869G &nbsp;&nbsp;&nbsp;&nbsp;
      Incorporation No : U29150TZ2009PTC015678
    </p>
  </div>
</div>
  `;

  // Page 1 HTML content
  const page1Html = `
    <div style="padding: 25px; font-family: Cambria ; font-size: 11px; line-height: 1.4;">
      ${commonHeaderHtml}

      <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
        <div style="width: 65%;">
         <p style="margin: 2px 0;"><span style="font-weight: bold;">${quotationNumber}</span></p>
<p style="margin: 8px 0 2px 0;">To,</p>
<p style="margin: 7px 0;"><span style="font-weight: bold;">M/s</span> ${toCompany}</p>
<p style="margin: 2px 0;"><span style="font-weight: bold;">KIND ATTN:</span> ${attnContact}</p>
<p style="margin: 2px 0;"><span style="font-weight: bold;">Mobile:</span> ${attnMobile}</p>
<p style="margin: 2px 0;"><span style="font-weight: bold;">E-mail:</span> ${attnEmail}</p>
<p style="margin: 8px 0 2px 0;"><span style="font-weight: bold;">SUB:</span> ${subject}</p>
<p style="margin: 2px 0;"><span style="font-weight: bold;">REF:</span> ${reference}</p>

        </div>
        <div style="width: 30%; text-align: right;">
          <p style="2px 0; font-weight: bold;">DATE: ${quotationDate}</p>
        </div>
      </div>

      <p style="10px 0; font-weight: bold;">Dear Customer,</p>
      <p style="10px 0;">We thank you for enquiry, we are pleased to submit our Techno Commercial Offer, as under.</p>
      <p style="10px 0;">We, “Mega Cranes” is a Promising & Reliable Original Equipment Manufacturer of Overhead Cranes and Electric Wire Rope Hoist in South India, situated at Coimbatore more than a decade.</p>
      <p style="10px 0;">We are also an Authorized Crane Partner of “KITO” Japan for Electric Chain Hoist, Manual Hoist, Rope Hoist. KITO is the Worlds No.1 Chain Hoist manufacturer.</p>

      <div style="margin-top: 30px; text-align: center; font-weight: bold; font-size: 12px;">
        <p style="5px 0;">Annexure I - Price & Scope Details</p>
        <p style="5px 0;">Annexure II - Terms & Conditions</p>
      </div>

      <p style="20px 0;">We hope you will find our offer most competitive, if you have clarifications, please feel free to contact us.</p>
      <p style="10px 0;">Looking forward for your valued order at the earliest.</p>
      <p style="10px 0;">Yours Faithfully</p>
      <p style="5px 0; font-weight: bold;">For MEGA CRANES INDIA PVT LTD.,</p>

      <div style="margin-top: 40px;">
        <p style="2px 0; font-weight: bold;">Sivaraman.P.S</p>
        <p style="2px 0;">Head – Business Development</p>
        <p style="2px 0;">+91 9944039125</p>
      </div>
      <p style="text-align: center; font-size: 10px; color: #999; margin-top: 20px;">Page 1/2</p>
    </div>
  `;

  // Generate item rows for the table on Page 2
  const itemRowsHtml = quotation.items?.map((item) => {
    const description = item.description || item.productName || 'N/A';
    // If you need to display hsnSac per item, you would add it here
    const unitPrice = parseFloat(item.rate || 0);
    const quantity = parseFloat(item.quantity || 0);
    const totalPrice = unitPrice * quantity;
    return `
      <tr>
        <td style="border: 1px solid #000; padding: 6px; text-align: left;">${description}</td>
        <td style="border: 1px solid #000; padding: 6px; text-align: right;">${formatCurrency(unitPrice)}</td>
        <td style="border: 1px solid #000; padding: 6px; text-align: center;">${quantity}</td>
        <td style="border: 1px solid #000; padding: 6px; text-align: right;">${formatCurrency(totalPrice)}</td>
      </tr>
    `;
  }).join('') || '';

  // Page 2 HTML content
  const page2Html = `
    <div style="padding: 25px; font-family: Cambria ; font-size: 11px; line-height: 1.4;">
      <div style="margin: 0 auto;padding: 10px 20px;font-family: Cambria ;">
  <div style="border-bottom: 2px solid #d35400;padding-bottom: 10px;justify-content: space-around;">
    <img src="${companyLogoSrc}" alt="Company Logo" style="width: 80px; height: auto; margin-right: 15px;">
    
    </div>
  </div>


      <h3 style="text-align: center; margin-bottom: 15px; font-size: 14px;">ANNEXURE - I (PRICE & SCOPE)</h3>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <thead>
          <tr style="background-color: #f2f2f2;">
            <th style="border: 1px solid #000; padding: 6px; text-align: left; width: 55%;">DESCRIPTION</th>
            <th style="border: 1px solid #000; padding: 6px; text-align: right; width: 15%;">UNIT PRICE</th>
            <th style="border: 1px solid #000; padding: 6px; text-align: center; width: 10%;">QTY</th>
            <th style="border: 1px solid #000; padding: 6px; text-align: right; width: 20%;">TOTAL PRICE</th>
          </tr>
        </thead>
        <tbody>
          ${itemRowsHtml}
          <tr>
            <td colspan="3" style="border: 1px solid #000; padding: 6px; text-align: right; font-weight: bold;">SUB TOTAL</td>
            <td style="border: 1px solid #000; padding: 6px; text-align: right; font-weight: bold;">${formatCurrency(subTotalAmount)}</td>
          </tr>
          <tr>
            <td colspan="3" style="border: 1px solid #000; padding: 6px; text-align: right;">TAXES - GST 18%</td>
            <td style="border: 1px solid #000; padding: 6px; text-align: right;">${formatCurrency(gstAmount)}</td>
          </tr>
          <tr>
            <td colspan="3" style="border: 1px solid #000; padding: 6px; text-align: right; font-weight: bold;">GRAND TOTAL</td>
            <td style="border: 1px solid #000; padding: 6px; text-align: right; font-weight: bold;">${formatCurrency(grandTotalAmount)}</td>
          </tr>
        </tbody>
      </table>

     <div style="border: 1px solid #000; padding: 10px; margin-top: 20px; font-family: Cambria ; font-size: 12px;">
  
  <p style="margin: 0 0 8px 0; font-weight: bold; border-bottom: 1px solid #000; padding-bottom: 5px;">
    Note:
  </p>
  <p style="margin: 0 0 12px 0; line-height: 1.5;">
    ${quotationNotes.split('\n').join('<br/>')}
  </p>

  <p style="margin: 0 0 8px 0; font-weight: bold; border-bottom: 1px solid #000; padding-bottom: 5px;">
    CUSTOMER'S SCOPE:
  </p>
  <ul style="margin-left: 20px; padding-left: 15px; list-style-type: disc; line-height: 1.6;">
    ${customerScope
      .split('\n')
      .filter(line => line.trim() !== '')
      .map(line => `<li>${line}</li>`)
      .join('')}
  </ul>

</div>


      <h3 style="text-align: center; margin-top: 30px; margin-bottom: 15px; font-size: 14px;">ANNEXURE - II - TERMS & CONDITIONS</h3>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <tbody>
          ${termsRowsHtml}
        </tbody>
      </table>

      <p style="5px 0; font-weight: bold;">For MEGA CRANES INDIA PVT LTD.,</p>

      <div style="margin-top: 40px;">
        <p style="2px 0; font-weight: bold;">Sivaraman.P.S</p>
        <p style="2px 0;">Head – Business Development</p>
        <p style="2px 0;">+91 9944039125</p> 

      <p style="text-align: center; font-size: 10px; color: #999; margin-top: 50px;">Page 2/2</p>
    </div>
  `;

  return { page1Html, page2Html };
};

export const downloadQuotationPdf = async (record) => {
  const toastId = toast.loading("Generating PDF...", {
    position: "top-center",
  });

  let tempDivPage1 = null; 
  let tempDivPage2 = null;

  try {
    const { page1Html, page2Html } = generateQuotationHtmlParts(record);

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
      hotfixes: ["px_scaling"]
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const padding = 7; // Padding around the content on the PDF page

    // --- Render Page 1 ---
    tempDivPage1 = document.createElement("div");
    tempDivPage1.style.position = "fixed";
    tempDivPage1.style.top = "-9999px";
    tempDivPage1.style.left = "-9999px";
    // Set width for html2canvas to render correctly within PDF dimensions
    tempDivPage1.style.width = `${pdfWidth - 2 * padding}mm`;
    tempDivPage1.style.padding = '0'; // No internal padding for the temporary div
    tempDivPage1.style.background = "white";
    tempDivPage1.style.zIndex = "-1"; // Keep it hidden
    tempDivPage1.style.display = "block"; // Ensure it takes up space for rendering
    tempDivPage1.innerHTML = page1Html;
    document.body.appendChild(tempDivPage1);

    // Small delay to ensure DOM rendering is complete before html2canvas
    await new Promise((resolve) => setTimeout(resolve, 200));

    const canvasPage1 = await html2canvas(tempDivPage1, {
      scale: 3, // Increased scale for better quality
      useCORS: true, // Important if your logo is from a different origin
      logging: false,
      allowTaint: true,
      letterRendering: true,
      backgroundColor: "#ffffff" // Ensure white background
    });

    const imgDataPage1 = canvasPage1.toDataURL("image/jpeg", 0.95); // Increased JPEG quality
    const imgPropsPage1 = pdf.getImageProperties(imgDataPage1);
    // Calculate image height to maintain aspect ratio within PDF width
    const imgHeightPage1 = (imgPropsPage1.height * (pdfWidth - 2 * padding)) / imgPropsPage1.width;

    pdf.addImage(imgDataPage1, "JPEG", padding, padding, pdfWidth - 2 * padding, imgHeightPage1);

    // --- Render Page 2 ---
    pdf.addPage(); // Add a new page for the second part of the quotation

    tempDivPage2 = document.createElement("div");
    tempDivPage2.style.position = "fixed";
    tempDivPage2.style.top = "-9999px";
    tempDivPage2.style.left = "-9999px";
    tempDivPage2.style.width = `${pdfWidth - 2 * padding}mm`;
    tempDivPage2.style.padding = '0';
    tempDivPage2.style.background = "white";
    tempDivPage2.style.zIndex = "-1";
    tempDivPage2.style.display = "block";
    tempDivPage2.innerHTML = page2Html;
    document.body.appendChild(tempDivPage2);

    await new Promise((resolve) => setTimeout(resolve, 200));

    const canvasPage2 = await html2canvas(tempDivPage2, {
      scale: 3, // Increased scale for better quality
      useCORS: true,
      logging: false,
      allowTaint: true,
      letterRendering: true,
      backgroundColor: "#ffffff"
    });

    const imgDataPage2 = canvasPage2.toDataURL("image/jpeg", 0.95); // Increased JPEG quality
    const imgPropsPage2 = pdf.getImageProperties(imgDataPage2);
    const imgHeightPage2 = (imgPropsPage2.height * (pdfWidth - 2 * padding)) / imgPropsPage2.width;

    pdf.addImage(imgDataPage2, "JPEG", padding, padding, pdfWidth - 2 * padding, imgHeightPage2);

    // Save the PDF with a dynamic filename
    pdf.save(`${record.quotationNumber || "quotation"}_${new Date().toISOString().slice(0, 10)}.pdf`);
    toast.success("PDF downloaded successfully!", { id: toastId });
  } catch (err) {
    console.error("Failed to generate PDF:", err);
    toast.error("Failed to generate PDF. Please try again.", { id: toastId });
  } finally {
    // Clean up temporary divs from the DOM
    if (tempDivPage1 && document.body.contains(tempDivPage1)) {
      document.body.removeChild(tempDivPage1);
    }
    if (tempDivPage2 && document.body.contains(tempDivPage2)) {
      document.body.removeChild(tempDivPage2);
    }
  }
};