import{r as C,an as P,x as e,B as V,S as ne,K as ie,V as F,H as ae,T as re,ao as le,ap as E}from"./index-CuM4TiFX.js";import{i as _}from"./axios-YBtE4rUB.js";import{h as Y}from"./moment-C5S46NFB.js";import{D as de}from"./index-B7ezPVWn.js";import{T as ee}from"./index-D4RF15dB.js";import{D as pe,d as ce}from"./index-D8s0gBqr.js";import{I as te,R as me}from"./index-9qapg5qh.js";import{D as Q}from"./index-DocOD8MG.js";import{L as J}from"./index-CYJ6Kzbe.js";import{R as oe}from"./MessageOutlined-Rc44LvQC.js";import{E as ge,h as X,R as ue}from"./html2canvas.esm-_Wf3QgNw.js";import{c as xe}from"./TextArea-CzDgEUcr.js";import{F as H}from"./Table-B5QDeFtF.js";import{M as fe}from"./index-Bdbn2WmV.js";import{D as f}from"./index-iMMGJRXF.js";import{T as z}from"./index-DB8oLP_t.js";import{R as Z}from"./PrinterOutlined-BUtqzqu1.js";import{R as he}from"./ScheduleOutlined-duVF55BB.js";import{R as ye}from"./EditOutlined-Bsata_IE.js";import{P as be}from"./index-BItQ59Y-.js";import{R as we}from"./DeleteOutlined-1zXcO0Ge.js";import"./context-Oj4zGlqB.js";import"./useClosable-DIZBziib.js";import"./styleChecker-6qEOE0Hk.js";import"./index-BH4MDtWK.js";import"./dayjs.min-BlNs4lII.js";import"./Pagination-B9nc9cN4.js";import"./addEventListener-D-0kJSpi.js";import"./index-BZ38ig3q.js";import"./InfoCircleFilled-BifyHQyJ.js";import"./ActionButton-DbXsjZW0.js";import"./index-CamWhiX0.js";const{TextArea:Ie}=te,{Text:B}=ee,Ne=({visible:i,onClose:w,quotation:r,refreshQuotations:p})=>{const[I,N]=C.useState(""),[g,u]=C.useState(null),[T,c]=C.useState(!1),[s,j]=C.useState([]),[S,v]=C.useState(null),[$,A]=C.useState([]),[x,h]=C.useState(!1),D=()=>{try{const n=JSON.parse(localStorage.getItem("user"));return(n==null?void 0:n.email)||"Unknown"}catch{return"Unknown"}};C.useEffect(()=>{i&&(r!=null&&r._id)?(R(),k()):(j([]),v(null),N(""),u(null),A([]))},[i,r]);const k=async()=>{h(!0);try{const n=await _.get("/api/users");Array.isArray(n.data)?A(n.data):(console.warn("API for users did not return an array:",n.data),A([]))}catch(n){console.error("Failed to fetch users:",n),P.error("Could not load user details for display."),A([])}finally{h(!1)}},O=n=>{if(!n)return"Unknown User";if(typeof n=="object"&&n!==null)return n.name||n.email||"Unknown User";const m=$.find(t=>t._id===n||t.id===n);return m?m.name||m.email||`User ID: ${n}`:`Unknown User (ID: ${n})`},R=async()=>{if(r!=null&&r._id){c(!0);try{const n=await _.get(`/api/quotations/${r._id}/followups`);j(n.data.sort((m,t)=>Y(t.createdAt).diff(Y(m.createdAt))))}catch(n){console.error("Error fetching follow-ups:",n),P.error("Failed to fetch follow-ups.")}finally{c(!1)}}},L=async()=>{if(!g||!I.trim()){P.error("Please select a date and enter a note for the follow-up.");return}c(!0);try{let n;const m=JSON.parse(localStorage.getItem("user")),t=(m==null?void 0:m._id)||(m==null?void 0:m.id);if(!t){P.error("User information not found. Please log in."),c(!1);return}const o={date:Y(g).toISOString(),note:I.trim(),addedBy:t};S===null?n=_.post(`/api/quotations/${r._id}/followups`,o):n=_.put(`/api/quotations/${r._id}/followups/${S._id}`,o),n.then(()=>{P.success(S===null?"Follow-up added successfully!":"Follow-up updated successfully!"),N(""),u(null),v(null),R(),typeof p=="function"&&p()}).catch(a=>{var l,y;console.error("Error saving follow-up:",a),P.error(`Error saving follow-up: ${((y=(l=a.response)==null?void 0:l.data)==null?void 0:y.message)||a.message}`)}).finally(()=>{c(!1)})}catch(n){console.error("Error preparing follow-up data:",n),P.error("An unexpected error occurred."),c(!1)}},M=n=>e.jsx(J.Item,{children:e.jsxs("div",{style:{backgroundColor:"#f0f2f5",borderRadius:"12px",padding:"10px 15px",maxWidth:"calc(100% - 80px)",flexGrow:1},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",marginBottom:"5px"},children:[e.jsx(ie,{style:{marginRight:"5px",color:"#888"}}),e.jsx(B,{strong:!0,style:{marginRight:"10px",color:"#333"},children:O(n.addedBy)}),e.jsx(ce,{style:{marginRight:"5px",color:"#888"}}),e.jsx(B,{type:"secondary",style:{fontSize:"0.8em"},children:Y(n.createdAt).format("DD/MM/YYYY, h:mm:ss A")})]}),e.jsxs("div",{style:{display:"flex",alignItems:"flex-start"},children:[e.jsx(oe,{style:{marginRight:"8px",marginTop:"3px",color:"#555"}}),e.jsx(B,{style:{flexGrow:1},children:n.note})]})]})});return e.jsxs(de,{title:`Follow-ups for Quotation: ${(r==null?void 0:r.quotationNumber)||"N/A"}`,open:i,onClose:()=>{v(null),N(""),u(null),w()},width:720,children:[e.jsxs("div",{style:{marginBottom:20},children:[e.jsxs(B,{type:"secondary",style:{marginBottom:8,display:"block",fontSize:"0.9em"},children:["Adding follow-up as: ",e.jsx(B,{strong:!0,children:D()})]}),e.jsx(pe,{style:{width:"100%",marginBottom:8},format:"DD-MM-YYYY",value:g,onChange:n=>u(n),placeholder:"Select follow-up date"}),e.jsx(Ie,{rows:4,placeholder:"Enter follow-up note",value:I,onChange:n=>N(n.target.value)}),e.jsx(V,{type:"primary",style:{marginTop:10,backgroundColor:"#ef7a1b",borderColor:"#ef7a1b",color:"white"},block:!0,onClick:L,loading:T,children:S===null?"Add Follow-up":"Update Follow-up"})]}),e.jsxs(Q,{children:["All Follow-ups (",s.length,")"]}),T||x?e.jsx("div",{style:{textAlign:"center",padding:"20px"},children:e.jsx(ne,{size:"large",tip:"Loading Follow-ups..."})}):e.jsx(J,{dataSource:s,renderItem:M,locale:{emptyText:"No follow-ups found for this quotation."},style:{marginTop:16}})]})},Se="/assets/megacraneq-CnNkYVbt.png",G=i=>`₹${(parseFloat(i)||0).toLocaleString("en-IN",{minimumFractionDigits:2,maximumFractionDigits:2})}`,Ae=i=>{var n,m,t,o,a,l,y;const w=((n=i.items)==null?void 0:n.reduce((d,U)=>d+parseFloat(U.quantity||0)*parseFloat(U.rate||0),0))||0,p=w*.18,I=w+p,N=Se,g=i.businessName||"M/s. LMW Limited, Foundry Division UNIT - 31 (Unit 2), Arasur, Coimbatore – 641 407",u=((m=i.businessId)==null?void 0:m.contactName)||i.contactName||"N/A",T=i.mobileNumber||((t=i.businessId)==null?void 0:t.mobileNumber)||((o=i.businessId)==null?void 0:o.phone)||"N/A",c=((a=i.businessId)==null?void 0:a.email)||i.email||"N/A";let s=i.subject;if(!s&&i.items&&i.items.length>0){const d=i.items.map(U=>U.productName).filter(Boolean);d.length>0?(s=`Offer for ${d.slice(0,2).join(" & ")}`,d.length>2&&(s+="...")):s="Offer for your requirement"}else s||(s="Offer for your requirement");const j=i.reference||`Your telecom enquiry dated ${new Date().toLocaleDateString("en-IN")}`,S=i.date?new Date(i.date).toLocaleDateString("en-IN"):new Date().toLocaleDateString("en-IN"),v=i.quotationNumber||"MCIPL/OFR/0/NXL",$=i.quotationNotes||"If Installation or any other Service is required, additional charges of Rs.4,500/- will be Applicable extra on PER MAN DAY (i.e, Per Engineer Per Day) basis + GST 18% Extra. If required, you have to release a separate Work Order",A=i.customerScope||`Transportation from our works to your site
Unloading the materials @Site, Storage, Security, Inhouse Transportation
Required Cables, SFU, Ladders, Scaffoldings, Platforms, Cranes, Chain Block other requirements for Installation.
Installation with Required Base & Cables, Materials & Modifications
Additional Materials, Spares, Modifications & Services (if required)`,x=Array.from(new Set((l=i.items)==null?void 0:l.map(d=>d.hsnSac).filter(d=>d&&d.trim()!==""))).join(", ");let h=i.hsnCodes;!h&&x?h=x:h||(h="Spares - 84311090, Service - 998719");const k=[{label:"PRICES",value:i.pricesTerms||"EX WORKS COIMBATORE with open packing basis."},{label:"OUR PAYMENT TERMS",value:i.ourPaymentTerms||"100% payment + 100% GST before dispatch from our works"},{label:"DELIVERY",value:i.delivery||"4 - 6 weeks against receipt of your firm PO"},{label:"PACKING & FORWARDING CHARGES",value:i.packingForwardingCharges||"NA"},{label:"TRANSPORTATION CHARGES",value:i.transportationCharges||"Customer’s scope"},{label:"TRANSPORTER NAME",value:i.transporterName||"Customer’s Vehicle"},{label:"MODE & PLACE OF DELIVERY",value:i.modePlaceDelivery||"EX WORKS"},{label:"OFFER VALIDITY",value:i.offerValidity||"30 days from the date of this offer."},{label:"WARRANTY",value:i.warranty||"12 months from the date of dispatch or 1000 running hours whichever is earlier."},{label:"HSN CODES",value:h}].map(d=>`
    <tr>
        <td style="border: 1px solid #000; padding: 6px; font-weight: bold; width: 35%;">${d.label}:</td>
        <td style="border: 1px solid #000; padding: 6px; width: 65%;">${d.value||"N/A"}</td>
    </tr>
  `).join(""),R=`
    <div style="padding: 25px; font-family: Cambria ; font-size: 11px; line-height: 1.4;">
      ${`
    <div style="margin: 0 auto;padding: 10px 20px;font-family: Cambria ;">
  <div style="display: flex;align-items: center;border-bottom: 2px solid #d35400;padding-bottom: 10px;justify-content: space-around;">
    <img src="${N}" alt="Company Logo" style="width: 80px; height: auto; margin-right: 15px;">
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
  `}

      <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
        <div style="width: 65%;">
         <p style="margin: 2px 0;"><span style="font-weight: bold;">${v}</span></p>
<p style="margin: 8px 0 2px 0;">To,</p>
<p style="margin: 7px 0;"><span style="font-weight: bold;">M/s</span> ${g}</p>
<p style="margin: 2px 0;"><span style="font-weight: bold;">KIND ATTN:</span> ${u}</p>
<p style="margin: 2px 0;"><span style="font-weight: bold;">Mobile:</span> ${T}</p>
<p style="margin: 2px 0;"><span style="font-weight: bold;">E-mail:</span> ${c}</p>
<p style="margin: 8px 0 2px 0;"><span style="font-weight: bold;">SUB:</span> ${s}</p>
<p style="margin: 2px 0;"><span style="font-weight: bold;">REF:</span> ${j}</p>

        </div>
        <div style="width: 30%; text-align: right;">
          <p style="2px 0; font-weight: bold;">DATE: ${S}</p>
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
  `,L=((y=i.items)==null?void 0:y.map(d=>{const U=d.description||d.productName||"N/A",W=parseFloat(d.rate||0),K=parseFloat(d.quantity||0),se=W*K;return`
      <tr>
        <td style="border: 1px solid #000; padding: 6px; text-align: left;">${U}</td>
        <td style="border: 1px solid #000; padding: 6px; text-align: right;">${G(W)}</td>
        <td style="border: 1px solid #000; padding: 6px; text-align: center;">${K}</td>
        <td style="border: 1px solid #000; padding: 6px; text-align: right;">${G(se)}</td>
      </tr>
    `}).join(""))||"",M=`
    <div style="padding: 25px; font-family: Cambria ; font-size: 11px; line-height: 1.4;">
      <div style="margin: 0 auto;padding: 10px 20px;font-family: Cambria ;">
  <div style="border-bottom: 2px solid #d35400;padding-bottom: 10px;justify-content: space-around;">
    <img src="${N}" alt="Company Logo" style="width: 80px; height: auto; margin-right: 15px;">
    
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
          ${L}
          <tr>
            <td colspan="3" style="border: 1px solid #000; padding: 6px; text-align: right; font-weight: bold;">SUB TOTAL</td>
            <td style="border: 1px solid #000; padding: 6px; text-align: right; font-weight: bold;">${G(w)}</td>
          </tr>
          <tr>
            <td colspan="3" style="border: 1px solid #000; padding: 6px; text-align: right;">TAXES - GST 18%</td>
            <td style="border: 1px solid #000; padding: 6px; text-align: right;">${G(p)}</td>
          </tr>
          <tr>
            <td colspan="3" style="border: 1px solid #000; padding: 6px; text-align: right; font-weight: bold;">GRAND TOTAL</td>
            <td style="border: 1px solid #000; padding: 6px; text-align: right; font-weight: bold;">${G(I)}</td>
          </tr>
        </tbody>
      </table>

     <div style="border: 1px solid #000; padding: 10px; margin-top: 20px; font-family: Cambria ; font-size: 12px;">
  
  <p style="margin: 0 0 8px 0; font-weight: bold; border-bottom: 1px solid #000; padding-bottom: 5px;">
    Note:
  </p>
  <p style="margin: 0 0 12px 0; line-height: 1.5;">
    ${$.split(`
`).join("<br/>")}
  </p>

  <p style="margin: 0 0 8px 0; font-weight: bold; border-bottom: 1px solid #000; padding-bottom: 5px;">
    CUSTOMER'S SCOPE:
  </p>
  <ul style="margin-left: 20px; padding-left: 15px; list-style-type: disc; line-height: 1.6;">
    ${A.split(`
`).filter(d=>d.trim()!=="").map(d=>`<li>${d}</li>`).join("")}
  </ul>

</div>


      <h3 style="text-align: center; margin-top: 30px; margin-bottom: 15px; font-size: 14px;">ANNEXURE - II - TERMS & CONDITIONS</h3>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <tbody>
          ${k}
        </tbody>
      </table>

      <p style="5px 0; font-weight: bold;">For MEGA CRANES INDIA PVT LTD.,</p>

      <div style="margin-top: 40px;">
        <p style="2px 0; font-weight: bold;">Sivaraman.P.S</p>
        <p style="2px 0;">Head – Business Development</p>
        <p style="2px 0;">+91 9944039125</p> 

      <p style="text-align: center; font-size: 10px; color: #999; margin-top: 50px;">Page 2/2</p>
    </div>
  `;return{page1Html:R,page2Html:M}},q=async i=>{const w=F.loading("Generating PDF...",{position:"top-center"});let r=null,p=null;try{const{page1Html:I,page2Html:N}=Ae(i),g=new ge({orientation:"portrait",unit:"mm",format:"a4",hotfixes:["px_scaling"]}),u=g.internal.pageSize.getWidth(),T=g.internal.pageSize.getHeight(),c=7;r=document.createElement("div"),r.style.position="fixed",r.style.top="-9999px",r.style.left="-9999px",r.style.width=`${u-2*c}mm`,r.style.padding="0",r.style.background="white",r.style.zIndex="-1",r.style.display="block",r.innerHTML=I,document.body.appendChild(r),await new Promise(D=>setTimeout(D,200));const j=(await X(r,{scale:3,useCORS:!0,logging:!1,allowTaint:!0,letterRendering:!0,backgroundColor:"#ffffff"})).toDataURL("image/jpeg",.95),S=g.getImageProperties(j),v=S.height*(u-2*c)/S.width;g.addImage(j,"JPEG",c,c,u-2*c,v),g.addPage(),p=document.createElement("div"),p.style.position="fixed",p.style.top="-9999px",p.style.left="-9999px",p.style.width=`${u-2*c}mm`,p.style.padding="0",p.style.background="white",p.style.zIndex="-1",p.style.display="block",p.innerHTML=N,document.body.appendChild(p),await new Promise(D=>setTimeout(D,200));const A=(await X(p,{scale:3,useCORS:!0,logging:!1,allowTaint:!0,letterRendering:!0,backgroundColor:"#ffffff"})).toDataURL("image/jpeg",.95),x=g.getImageProperties(A),h=x.height*(u-2*c)/x.width;g.addImage(A,"JPEG",c,c,u-2*c,h),g.save(`${i.quotationNumber||"quotation"}_${new Date().toISOString().slice(0,10)}.pdf`),F.success("PDF downloaded successfully!",{id:w})}catch(I){console.error("Failed to generate PDF:",I),F.error("Failed to generate PDF. Please try again.",{id:w})}finally{r&&document.body.contains(r)&&document.body.removeChild(r),p&&document.body.contains(p)&&document.body.removeChild(p)}},{Text:b}=ee,st=({quotations:i,onAddNew:w,onEdit:r,onDelete:p,onSearch:I,onViewNotes:N,loading:g,refreshQuotations:u})=>{var k,O,R,L,M,n,m;const[T,c]=C.useState(!1),[s,j]=C.useState(null),[S,v]=C.useState(!1),$=t=>{j(t),c(!0),F.success("Quotation details loaded.",{duration:1500,position:"top-right"})},A=t=>{j(t),v(!0)},x=t=>`₹${(parseFloat(t)||0).toLocaleString("en-IN",{minimumFractionDigits:2,maximumFractionDigits:2})}`,h=()=>[{title:"S.No",width:60,align:"center",render:(t,o,a)=>a+1},{title:"Product Name",dataIndex:"productName",ellipsis:!0,render:(t,o)=>(console.log("Item in QuotationList:",o),t||o.name||"N/A")},{title:"Description",dataIndex:"description",ellipsis:!0,render:(t,o)=>{var a;if(!t&&((a=o.specifications)==null?void 0:a.length)>0){const l=o.specifications.find(y=>y.name==="SPECIFICATION");return l?l.value:"N/A"}return t||"N/A"}},{title:"HSN/SAC",dataIndex:"hsnSac",width:100,align:"center",render:t=>t||"N/A"},{title:"Qty",dataIndex:"quantity",width:80,align:"center",render:t=>parseFloat(t)||0},{title:"Unit Price (₹)",width:140,align:"right",render:(t,o)=>x(o.rate||0)},{title:"Total (₹)",width:140,align:"right",render:(t,o)=>e.jsx(b,{strong:!0,style:{color:"#52c41a"},children:x((o.quantity||0)*(o.rate||0))})}],D=[{title:"Quotation #",dataIndex:"quotationNumber",render:t=>e.jsx(z,{color:"blue",children:t||"N/A"}),sorter:(t,o)=>(t.quotationNumber||"").localeCompare(o.quotationNumber||"")},{title:"Business",dataIndex:"businessName",sorter:(t,o)=>(t.businessName||"").localeCompare(o.businessName||"")},{title:"Customer",dataIndex:"customerName",render:(t,o)=>{var a,l,y;return e.jsxs("div",{children:[e.jsx("div",{children:((a=o.businessId)==null?void 0:a.contactName)||t||"N/A"}),(((l=o.businessId)==null?void 0:l.email)||o.customerEmail)&&e.jsx("div",{style:{fontSize:12,color:"#666"},children:((y=o.businessId)==null?void 0:y.email)||o.customerEmail})]})},sorter:(t,o)=>{var a,l;return(((a=t.businessId)==null?void 0:a.contactName)||t.customerName||"").localeCompare(((l=o.businessId)==null?void 0:l.contactName)||o.customerName||"")}},{title:"Items Count",render:(t,o)=>{var a,l;return e.jsxs(z,{color:"geekblue",children:[((a=o.items)==null?void 0:a.length)||0," item",(((l=o.items)==null?void 0:l.length)||0)!==1?"s":""]})}},{title:"Latest Note",dataIndex:"notes",render:t=>{if(t&&t.length>0){const o=t[t.length-1],a=o.text.length>30?`${o.text.substring(0,30)}...`:o.text;return e.jsx(re,{title:o.text,children:e.jsx(b,{type:"secondary",children:a})})}return e.jsx(b,{type:"secondary",italic:!0,children:"No notes"})}},{title:"Total (₹)",dataIndex:"total",render:(t,o)=>{var l;const a=parseFloat(t)||((l=o.items)==null?void 0:l.reduce((y,d)=>y+(d.quantity||0)*(d.rate||0),0))||0;return e.jsx(b,{strong:!0,style:{color:"#52c41a"},children:x(a)})},sorter:(t,o)=>{const a=parseFloat(t.total)||0,l=parseFloat(o.total)||0;return a-l}},{title:"Date",dataIndex:"date",render:t=>{if(!t)return"N/A";try{return new Date(t).toLocaleDateString("en-IN")}catch{return t}},sorter:(t,o)=>{const a=new Date(t.date).getTime()||0,l=new Date(o.date).getTime()||0;return a-l}},{title:"Actions",width:80,render:(t,o)=>e.jsx(le,{overlay:e.jsxs(E,{children:[e.jsx(E.Item,{icon:e.jsx(me,{}),onClick:()=>$(o),children:"View Details"},"view"),e.jsx(E.Item,{icon:e.jsx(Z,{}),onClick:()=>q(o),children:"Download PDF"},"download"),e.jsx(E.Item,{icon:e.jsx(oe,{}),onClick:()=>{N(o),F.success("Opening notes dialog...",{duration:1500})},children:"View/Add Notes"},"notes"),e.jsx(E.Item,{icon:e.jsx(he,{}),onClick:()=>A(o),children:"Add/View Follow-ups"},"followups"),e.jsx(E.Item,{icon:e.jsx(ye,{}),onClick:()=>{r(o),F.success("Initiating quotation edit...",{duration:1500})},children:"Edit Quotation"},"edit"),e.jsx(E.Item,{children:e.jsxs(be,{title:"Are you sure you want to delete this account?",onConfirm:()=>p(o._id),okText:"Yes",cancelText:"No",children:[e.jsx(we,{}),"Delete Quotation"]})})]}),trigger:["click"],children:e.jsx(V,{icon:e.jsx(ue,{})})})}];return e.jsxs(e.Fragment,{children:[e.jsxs(ae,{style:{marginBottom:16,justifyContent:"space-between",width:"100%"},children:[e.jsx(te.Search,{placeholder:"Search by quotation number, business, customer, or notes...",onChange:t=>{I(t.target.value)},style:{width:400},prefix:e.jsx(xe,{}),allowClear:!0}),e.jsx(V,{type:"primary",onClick:()=>{w(),F.success("Prepare to create a new quotation.",{duration:1500})},children:"+ New Quotation"})]}),e.jsx(H,{columns:D,dataSource:i,rowKey:"_id",loading:g,pagination:{pageSize:10,showSizeChanger:!0,showQuickJumper:!0,showTotal:(t,o)=>`${o[0]}-${o[1]} of ${t} quotations`},scroll:{x:1200}}),e.jsx(fe,{title:e.jsxs("div",{children:[e.jsx(b,{strong:!0,children:"Quotation Details"}),s&&e.jsx(z,{color:"blue",style:{marginLeft:8},children:s.quotationNumber})]}),open:T,onCancel:()=>c(!1),footer:[e.jsx(V,{icon:e.jsx(Z,{}),onClick:()=>q(s),children:"Download PDF"},"download"),e.jsx(V,{onClick:()=>c(!1),children:"Close"},"close")],width:1e3,children:s&&e.jsxs("div",{id:`quotation-modal-preview-${s._id}`,children:[e.jsxs(f,{column:2,bordered:!0,size:"small",children:[e.jsx(f.Item,{label:"Quotation Number",children:e.jsx(z,{color:"blue",children:s.quotationNumber||"N/A"})}),e.jsx(f.Item,{label:"Date",children:s.date?new Date(s.date).toLocaleDateString("en-IN"):"N/A"}),e.jsxs(f.Item,{label:"Status",children:[" ",e.jsx(z,{color:s.status==="Approved"?"green":s.status==="Pending"?"orange":s.status==="Rejected"?"red":"blue",className:"rounded-full px-3 py-1 text-sm font-medium",children:s.status||"N/A"})]}),e.jsx(f.Item,{label:"Business Name",children:s.businessName||"N/A"}),e.jsx(f.Item,{label:"Contact Person",children:((k=s.businessId)==null?void 0:k.contactName)||s.customerName||"N/A"}),e.jsx(f.Item,{label:"Customer Email",children:((O=s.businessId)==null?void 0:O.email)||s.customerEmail||"N/A"}),e.jsx(f.Item,{label:"Mobile Number",children:s.mobileNumber||((R=s.businessId)==null?void 0:R.mobileNumber)||((L=s.businessId)==null?void 0:L.phone)||"N/A"}),e.jsx(f.Item,{label:"GSTIN",children:e.jsx(b,{code:!0,children:s.gstin||"N/A"})}),e.jsx(f.Item,{label:"Business Info",span:2,children:e.jsx(b,{style:{whiteSpace:"pre-wrap"},children:s.businessInfo||"N/A"})}),e.jsx(f.Item,{label:"Total Amount",span:2,children:e.jsx(b,{style:{fontSize:"18px",fontWeight:"bold",color:"#52c41a"},children:x(s.total||((M=s.items)==null?void 0:M.reduce((t,o)=>t+(o.quantity||0)*(o.rate||0),0))||0)})})]}),((n=s.items)==null?void 0:n.length)>0&&e.jsxs(e.Fragment,{children:[e.jsxs(Q,{orientation:"left",children:["Items (",s.items.length,")"]}),e.jsx(H,{dataSource:s.items,columns:h(),pagination:!1,size:"small",rowKey:(t,o)=>`${s._id}-item-${o}`,bordered:!0,expandable:{expandedRowRender:t=>{var o;return e.jsx("div",{style:{margin:0,padding:0},children:((o=t.specifications)==null?void 0:o.length)>0&&e.jsx(f,{column:1,size:"small",children:t.specifications.filter(a=>a.name!=="SPECIFICATION").map((a,l)=>e.jsx(f.Item,{label:a.name,children:a.value},l))})})},rowExpandable:t=>{var o;return((o=t.specifications)==null?void 0:o.length)>0}},summary:t=>{const o=t.reduce((a,l)=>a+(l.quantity||0)*(l.rate||0),0);return e.jsx(H.Summary,{fixed:!0,children:e.jsxs(H.Summary.Row,{children:[e.jsxs(H.Summary.Cell,{index:0,colSpan:6,children:[" ",e.jsx(b,{strong:!0,children:"Grand Total:"})]}),e.jsxs(H.Summary.Cell,{index:6,children:[" ",e.jsx(b,{strong:!0,style:{color:"#52c41a"},children:x(o)})]})]})})}})]}),((m=s.notes)==null?void 0:m.length)>0&&e.jsxs(e.Fragment,{children:[e.jsxs(Q,{orientation:"left",children:["Notes (",s.notes.length,")"]}),s.notes.map((t,o)=>e.jsxs("div",{style:{marginBottom:12,padding:8,background:"#f5f5f5",borderRadius:4},children:[e.jsxs(b,{italic:!0,children:['"',t.text,'"']}),e.jsx("br",{}),e.jsxs(b,{type:"secondary",style:{fontSize:"0.8em"},children:["— ",t.author," on"," ",t.timestamp||new Date(s.createdAt).toLocaleDateString("en-IN")]})]},o))]})]})}),s&&e.jsx(Ne,{visible:S,onClose:()=>v(!1),quotation:s,refreshQuotations:u})]})};export{st as default};
