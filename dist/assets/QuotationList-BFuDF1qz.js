import{r as A,P as E,n as e,B as U,V as L,Q as X,D as le,T as de,U as pe,W as M}from"./index-DFkeGJve.js";import{i as _,c as ce}from"./axios-CXM2YcLm.js";import{h as O}from"./moment-C5S46NFB.js";import{D as ge}from"./index-BLLH8eYJ.js";import{D as xe}from"./index-B5qbg8CL.js";import{I as ie,b as ue}from"./index-Dna1ZuSU.js";import{D as G}from"./index-83aYk6oH.js";import{T as ne}from"./index-aFscFpMp.js";import{L as H}from"./index-2VGcZWEN.js";import{T as re,a as V}from"./index-CuiCWRnG.js";import{M as ae}from"./index-ISEoUsk9.js";import{E as me,h as q,R as fe}from"./html2canvas.esm-q3sVWcd6.js";import{F as Y}from"./Table-KvRATXsL.js";import{D as I}from"./index-fnliRwNJ.js";import{R as ee}from"./PrinterOutlined-CuehxlWX.js";import{R as he}from"./MessageOutlined-CT12yonJ.js";import{R as ye}from"./ScheduleOutlined-CBj-i2N2.js";import{R as be}from"./EditOutlined-uiPjFWnN.js";import{P as we}from"./index-BYTsHZqg.js";import{R as ve}from"./DeleteOutlined-BH5Qblkw.js";import"./context-D8nqyQHu.js";import"./index-BXtwvscy.js";import"./InfoCircleFilled-BriGrGii.js";import"./index-B4ypW-mK.js";const{TextArea:Ne}=ie,{TabPane:W}=ne,{Text:te}=re,je=({visible:r,onClose:g,quotation:s,refreshQuotations:p})=>{const[f,w]=A.useState(""),[m,u]=A.useState(null),[v,c]=A.useState(!1),[a,h]=A.useState([]),[d,y]=A.useState(null);A.useEffect(()=>{r&&(s!=null&&s._id)&&k()},[r,s]);const k=async()=>{try{const n=await _.get(`/api/quotations/${s._id}/followups`);h(n.data||[])}catch(n){console.error("Failed to fetch follow-ups for quotation:",n),E.error("Failed to fetch follow-ups for this quotation.")}},C=()=>{if(!f||!m){E.error("Please fill in both date and note fields.");return}const n=JSON.parse(localStorage.getItem("user")),x=n==null?void 0:n._id;if(!x){E.error("User information not found. Please log in.");return}c(!0);const t={date:m.format("YYYY-MM-DD"),note:f,addedBy:x};(d===null?_.post(`/api/quotations/${s._id}/followups`,t):_.put(`/api/quotations/${s._id}/followups/${d}`,t)).then(()=>{E.success(d===null?"Follow-up added successfully!":"Follow-up updated successfully!"),w(""),u(null),y(null),k(),p()}).catch(i=>{var l,b;console.error("Error saving follow-up:",i),E.error(((b=(l=i==null?void 0:i.response)==null?void 0:l.data)==null?void 0:b.message)||"Failed to save follow-up.")}).finally(()=>c(!1))},N=n=>{const x=a[n];w(x.note),u(O(x.date)),y(n)},F=n=>{ae.confirm({title:"Delete Follow-up",content:"Are you sure you want to delete this follow-up? This action cannot be undone.",okText:"Yes, Delete",cancelText:"No",okButtonProps:{danger:!0},onOk:()=>{_.delete(`/api/quotations/${s._id}/followups/${n}`).then(()=>{E.success("Follow-up deleted successfully!"),k(),p()}).catch(x=>{var t,o;console.error("Error deleting follow-up:",x),E.error(((o=(t=x==null?void 0:x.response)==null?void 0:t.data)==null?void 0:o.message)||"Failed to delete follow-up.")})}})},j=O().format("YYYY-MM-DD"),T=[...a].sort((n,x)=>new Date(x.date)-new Date(n.date)),P=T.filter(n=>O(n.date).format("YYYY-MM-DD")===j),z=T.filter(n=>O(n.date).isAfter(j,"day")),R=T.filter(n=>O(n.date).isBefore(j,"day")),$=(n,x)=>{var t,o;return e.jsx(H.Item,{actions:[e.jsx(U,{type:"link",onClick:()=>N(x),children:"Edit"},"edit"),e.jsx(U,{type:"link",danger:!0,onClick:()=>F(x),children:"Delete"},"delete")],children:e.jsxs("div",{children:[e.jsx(te,{strong:!0,children:O(n.date).format("DD-MM-YYYY")}),e.jsx("br",{}),n.note,e.jsx("br",{}),e.jsxs(te,{type:"secondary",children:["By ",((t=n.addedBy)==null?void 0:t.name)||((o=n.addedBy)==null?void 0:o.email)||"Unknown User"]})]})})};return e.jsxs(ge,{title:`Follow-ups for Quotation: ${(s==null?void 0:s.quotationNumber)||"N/A"}`,open:r,onClose:()=>{y(null),w(""),u(null),g()},width:720,children:[e.jsxs("div",{style:{marginBottom:20},children:[e.jsx(xe,{style:{width:"100%",marginBottom:8},format:"DD-MM-YYYY",value:m,onChange:n=>u(n),placeholder:"Select follow-up date"}),e.jsx(Ne,{rows:4,placeholder:"Enter follow-up note",value:f,onChange:n=>w(n.target.value)}),e.jsx(U,{type:"primary",block:!0,onClick:C,loading:v,style:{marginTop:10},children:d===null?"Add Follow-up":"Update Follow-up"})]}),e.jsx(G,{children:"Existing Follow-ups"}),e.jsxs(ne,{defaultActiveKey:"today",children:[e.jsx(W,{tab:`Today's (${P.length})`,children:e.jsx(H,{dataSource:P,renderItem:n=>$(n,a.indexOf(n)),locale:{emptyText:"No follow-ups scheduled for today."}})},"today"),e.jsx(W,{tab:`Upcoming (${z.length})`,children:e.jsx(H,{dataSource:z,renderItem:n=>$(n,a.indexOf(n)),locale:{emptyText:"No upcoming follow-ups."}})},"upcoming"),e.jsx(W,{tab:`Past (${R.length})`,children:e.jsx(H,{dataSource:R,renderItem:n=>$(n,a.indexOf(n)),locale:{emptyText:"No past follow-ups."}})},"past")]})]})},Q=r=>`₹${(parseFloat(r)||0).toLocaleString("en-IN",{minimumFractionDigits:2,maximumFractionDigits:2})}`,Ie=r=>{if(typeof r!="number"||isNaN(r))return"N/A";let g=Math.floor(r),s=Math.round((r-g)*100);const p=["","One","Two","Three","Four","Five","Six","Seven","Eight","Nine"],f=["Ten","Eleven","Twelve","Thirteen","Fourteen","Fifteen","Sixteen","Seventeen","Eighteen","Nineteen"],w=["","","Twenty","Thirty","Forty","Fifty","Sixty","Seventy","Eighty","Ninety"],m=["","Thousand","Lakh","Crore"],u=d=>d<10?p[d]:d>=10&&d<20?f[d-10]:w[Math.floor(d/10)]+(d%10!==0?" "+p[d%10]:"");let v=[],c=0;if(g===0)v.push("Zero");else{let d=g%1e3;for(d>0&&(d<100?v.push(u(d)):v.push(p[Math.floor(d/100)]+" Hundred"+(d%100!==0?" "+u(d%100):""))),g=Math.floor(g/1e3);g>0;){let y=g%100;y>0?v.push(u(y)+" "+m[++c]):c++,g=Math.floor(g/100)}}const a=v.reverse().filter(Boolean).join(" ").trim();let h=a?a+" Rupees":"Zero Rupees";return s>0&&(h+=` and ${u(s)} Paisa`),h+=" Only",h.replace(/\s+/g," ")},Se=r=>{var F,j,T,P,z,R,$,n,x,t,o;const g=((F=r.items)==null?void 0:F.reduce((i,l)=>i+(l.quantity||0)*(l.rate||0),0))||0,p=g*.18,f=g+p,w=X,m=X,u=((j=r.businessId)==null?void 0:j.contactName)||r.contactName||"N/A",v=r.mobileNumber||((T=r.businessId)==null?void 0:T.mobileNumber)||((P=r.businessId)==null?void 0:P.phone)||"N/A",c=((z=r.businessId)==null?void 0:z.email)||r.email||"N/A",a=((R=r.businessId)==null?void 0:R.gstin)||r.gstin||"N/A",h=((n=($=r.businessId)==null?void 0:$.address)==null?void 0:n.replace(/\n/g,"<br>"))||((x=r.businessInfo)==null?void 0:x.replace(/\n/g,"<br>"))||"N/A",d=`
    <div style="margin-bottom: 20px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
        <div style="display: flex; align-items: center;">
          <img src="${w}" alt="Company Logo" style="height: 70px; margin-right: 15px;">
          <div>
            <h2 style="margin: 0; font-size: 20px; font-weight: 600; color: #2c3e50; margin-bottom: 5px;">ACE AUTOMATION</h2>
            <p style="margin: 2px 0; font-size: 10px; color: #555;">S.F. No. 91, 14B, Padiveedu Thottam,</p>
            <p style="2px 0; font-size: 10px; color: #555;">Kalapatty road, Saravanampatti (PO),</p>
            <p style="margin: 2px 0; font-size: 10px; color: #555;">Coimbatore - 641 035. TN, INDIA.</p>
            <p style="margin: 2px 0; font-size: 10px; color: #555;">+91 98422 53389 | aceautomation.cbe@gmail.com</p>
            <p style="2px 0; font-size: 10px; color: #555;">www.aceautomation.in | GST No. : 33AVDPD3093Q1ZD</p>
          </div>
        </div>

        <div style="background: linear-gradient(135deg, #ff6600, #ff8c00); color: white; padding: 15px 25px; font-weight: 600; font-size: 20px; text-align: center; border-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          QUOTATION
        </div>
      </div>
      <div style="border-bottom: 2px solid #eee; margin-bottom: 15px;"></div>
    </div>
  `,y=`
    <div style="padding: 15px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 800px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); background: white;">
      ${d}

      <div style="margin-bottom: 20px; background: #f9fafb; border-radius: 6px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
        <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
          <tr>
            <td style="border: 1px solid #e0e0e0; padding: 8px; font-weight: 600; width: 25%; background: #f0f2f5;">Company Name</td>
            <td style="border: 1px solid #e0e0e0; padding: 8px; width: 25%;">
              ${r.businessName||"N/A"}
            </td>
            <td style="border: 1px solid #e0e0e0; padding: 8px; font-weight: 600; width: 25%; background: #f0f2f5;">Date</td>
            <td style="border: 1px solid #e0e0e0; padding: 8px; width: 25%;">
              ${r.date?new Date(r.date).toLocaleDateString("en-IN"):new Date().toLocaleDateString("en-IN")}
            </td>
          </tr>
          <tr>
            <td style="border: 1px solid #e0e0e0; padding: 8px; font-weight: 600; background: #f0f2f5;">Contact Person</td>
            <td style="border: 1px solid #e0e0e0; padding: 8px;">
              ${u}
            </td>
            <td style="border: 1px solid #e0e0e0; padding: 8px; font-weight: 600; background: #f0f2f5;">Quotation No</td>
            <td style="border: 1px solid #e0e0e0; padding: 8px;">
              ${r.quotationNumber||"N/A"}
            </td>
          </tr>
          <tr>
            <td style="border: 1px solid #e0e0e0; padding: 8px; font-weight: 600; background: #f0f2f5;">Contact Number</td>
            <td style="border: 1px solid #e0e0e0; padding: 8px;">
              ${v} </td>
            <td style="border: 1px solid #e0e0e0; padding: 8px; font-weight: 600; background: #f0f2f5;">Customer GST No.</td>
            <td style="border: 1px solid #e0e0e0; padding: 8px;">
              ${a}
            </td>
          </tr>
          <tr>
            <td style="border: 1px solid #e0e0e0; padding: 8px; font-weight: 600; background: #f0f2f5;">Contact Email</td>
            <td style="border: 1px solid #e0e0e0; padding: 8px;" colspan="3">
              ${c}
            </td>
          </tr>
          <tr>
            <td style="border: 1px solid #e0e0e0; padding: 8px; font-weight: 600; background: #f0f2f5;">Address</td>
            <td style="border: 1px solid #e0e0e0; padding: 8px;" colspan="3">
              ${h}
            </td>
          </tr>
        </table>
      </div>

      ${((t=r.items)==null?void 0:t.length)>0?`
          <div style="margin-top: 20px; overflow: hidden; border-radius: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px; table-layout: fixed; font-size: 12px;">
              <colgroup>
                <col style="width: 5%;"> <col style="width: 20%;"> <col style="width: 25%;"> <col style="width: 10%;"> <col style="width: 17.5%;"> <col style="width: 17.5%;"> </colgroup>
              <thead>
                <tr style="background: linear-gradient(135deg, #2c3e50, #34495e); color: white;">
                  <th style="border: 1px solid #2c3e50; padding: 8px; text-align: center;">S.No</th>
                  <th style="border: 1px solid #2c3e50; padding: 8px; text-align: left;">Product Name</th>
                  <th style="border: 1px solid #2c3e50; padding: 8px; text-align: left;">Specification</th>
                  <th style="border: 1px solid #2c3e50; padding: 8px; text-align: center;">Quantity</th>
                  <th style="border: 1px solid #2c3e50; padding: 8px; text-align: right;">Unit Price (₹)</th>
                  <th style="border: 1px solid #2c3e50; padding: 8px; text-align: right;">Total (₹)</th>
                </tr>
              </thead>
              <tbody>
                ${r.items.map((i,l)=>{var Z;const b=(i==null?void 0:i.productName)||"N/A";let D=(i==null?void 0:i.description)||"";!D&&((Z=i.specifications)==null?void 0:Z.length)>0&&(D=i.specifications.map(J=>`${J.name}: ${J.value}`).join(", ")),D=D||"N/A";const B=parseFloat(i.quantity)||0,K=parseFloat(i.rate)||0,se=(B*K).toFixed(2);return`
                      <tr style="${l%2===0?"background: #fff;":"background: #f9fafb;"}">
                        <td style="border: 1px solid #e0e0e0; padding: 8px; text-align: center; vertical-align: top;">${l+1}</td>
                        <td style="border: 1px solid #e0e0e0; padding: 8px; text-align: left; vertical-align: top;">
                          ${b}
                        </td>
                        <td style="border: 1px solid #e0e0e0; padding: 8px; text-align: left; vertical-align: top;">
                          ${D}
                        </td>
                        <td style="border: 1px solid #e0e0e0; padding: 8px; text-align: center; vertical-align: top;">
                          ${B}
                        </td>
                        <td style="border: 1px solid #e0e0e0; padding: 8px; text-align: right; vertical-align: top;">${Q(K)}</td>
                        <td style="border: 1px solid #e0e0e0; padding: 8px; text-align: right; font-weight: 600; vertical-align: top;">
                          ${Q(parseFloat(se))}
                        </td>
                      </tr>
                    `}).join("")}
              </tbody>
            </table>
          </div>

          <div style="margin-top: 15px; background: #f9fafb; border-radius: 6px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
            <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
              <tr>
                <td style="width: 70%;"></td>
                <td style="border: 1px solid #e0e0e0; padding: 10px; text-align: right; font-weight: 600; width: 15%; background: #f0f2f5;">Sub Total</td>
                <td style="border: 1px solid #e0e0e0; padding: 10px; text-align: right; font-weight: 600; width: 15%;">${Q(g)}</td>
              </tr>
              <tr>
                <td style="width: 70%;"></td>
                <td style="border: 1px solid #e0e0e0; padding: 10px; text-align: right; width: 15%; background: #f0f2f5;">GST (18%)</td>
                <td style="border: 1px solid #e0e0e0; padding: 10px; text-align: right; width: 15%;">${Q(p)}</td>
              </tr>
              <tr style="background: #e8f5e9;">
                <td style="width: 70%;"></td>
                <td style="border: 1px solid #e0e0e0; padding: 10px; text-align: right; font-weight: 600; font-size: 13px; width: 15%;">Total Amount</td>
                <td style="border: 1px solid #e0e0e0; padding: 10px; text-align: right; font-weight: 600; font-size: 13px; width: 15%;">${Q(f)}</td>
              </tr>
            </table>
          </div>

          <div style="margin-top: 15px; background: #f5f5f5; border: 1px solid #e0e0e0; border-radius: 6px; padding: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
            <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
              <tr>
                <td style="font-weight: 600; padding: 4px; width: 25%; color: #555;">Amount In Words</td>
                <td style="padding: 4px; font-style: italic; width: 75%;">${Ie(f)}</td>
              </tr>
            </table>
          </div>
        `:""}

      <div style="margin-top: 20px; font-size: 12px; color: #555;">
        <p style="margin: 5px 0; font-style: italic; color: #666;">"We appreciate your business inquiry and look forward to serving you with our quality products and services."</p>

        <div style="margin: 15px 0;">
          <p style="margin: 5px 0; font-weight: 600; color: #2c3e50;">With Best Regards</p>
          <p style="5px 0; color: #555;">For Ace Automation</p>
        </div>
      </div>

      <div style="margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
        <div style="text-align: right;">
          <img src="${m}" alt="Authorized Signature" style="height: 60px; display: block; margin-left: auto; margin-bottom: 5px;">
          <p style="margin: 5px 0; font-size: 12px; font-weight: 600; color: #2c3e50;">Authorized Signatory</p>
        </div>
      </div>
      <p style="text-align: center; font-size: 10px; color: #999; margin-top: 20px;">Page 1/2</p>
    </div>
  `,k=(o=r.items)==null?void 0:o.filter(i=>i.specifications&&i.specifications.length>0).map(i=>{const b=`- ${i.productName||i.description||"Product"}`,D=i.specifications.map(B=>`
          <tr>
            <td style="border: 1px solid #e0e0e0; padding: 8px; font-weight: 600; width: 40%; background: #f9f9f9; vertical-align: top;">${B.name||""}</td>
            <td style="border: 1px solid #e0e0e0; padding: 8px; vertical-align: top;">${B.value||""}</td>
          </tr>
        `).join("");return`
        <div style="margin-bottom: 20px; background: #f9fafb; border-radius: 6px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
          <div style="background: linear-gradient(135deg, #2c3e50, #34495e); color: white; padding: 8px 12px; font-weight: 600; font-size: 13px;">
            PRODUCT SPECIFICATIONS ${b}
          </div>
          <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
            <tbody>
              ${D}
            </tbody>
          </table>
        </div>
      `}).join(""),C=`
    <div style="margin-top: 20px; background: #f9fafb; border-radius: 6px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
      <div style="background: linear-gradient(135deg, #2c3e50, #34495e); color: white; padding: 8px 12px; font-weight: 600; font-size: 13px;">
        GENERAL TERMS & CONDITIONS
      </div>
      <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
        <tbody>
          <tr>
            <td style="border: 1px solid #e0e0e0; padding: 8px; font-weight: 600; width: 30%; background: #f0f2f5; vertical-align: top;">Payment Terms</td>
            <td style="border: 1px solid #e0e0e0; padding: 8px; vertical-align: top;">${r.Payment||"50% advance, 50% on delivery"}</td>
          </tr>
          <tr>
            <td style="border: 1px solid #e0e0e0; padding: 8px; font-weight: 600; width: 30%; background: #f0f2f5; vertical-align: top;">Delivery Period</td>
            <td style="border: 1px solid #e0e0e0; padding: 8px; vertical-align: top;">${r.Delivery?`${r.Delivery} days`:"Within 15 working days after advance"}</td>
          </tr>
          <tr>
            <td style="border: 1px solid #e0e0e0; padding: 8px; font-weight: 600; width: 30%; background: #f0f2f5; vertical-align: top;">Warranty</td>
            <td style="border: 1px solid #e0e0e0; padding: 8px; vertical-align: top;">${r.Warranty?`${r.Warranty} year(s)`:"1 year from the date of invoice"}</td>
          </tr>
          <tr>
            <td style="border: 1px solid #e0e0e0; padding: 8px; font-weight: 600; width: 30%; background: #f0f2f5; vertical-align: top;">Freight</td>
            <td style="border: 1px solid #e0e0e0; padding: 8px; vertical-align: top;">${r.Freight||"Extra as per actual"}</td>
          </tr>
          <tr>
            <td style="border: 1px solid #e0e0e0; padding: 8px; font-weight: 600; width: 30%; background: #f0f2f5; vertical-align: top;">Validity</td>
            <td style="border: 1px solid #e0e0e0; padding: 8px; vertical-align: top;">${r.Validity||"30 days from the date of quotation"}</td>
          </tr>
        </tbody>
      </table>
    </div>
  `,N=`
    <div style="padding: 15px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 800px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); background: white;">
      ${d}

      ${k}

      ${C}

      <div style="margin-top: 20px; font-size: 12px; color: #555;">
        <p style="margin: 5px 0; font-style: italic; color: #666;">"Thank you for considering our proposal. We assure you of our best services and support at all times."</p>

        <div style="margin: 15px 0;">
          <p style="margin: 5px 0; font-weight: 600; color: #2c3e50;">With Best Regards</p>
          <p style="5px 0; color: #555;">For Ace Automation</p>
        </div>
      </div>

      <div style="margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
        <div style="text-align: right;">
          <img src="${m}" alt="Authorized Signature" style="height: 60px; display: block; margin-left: auto; margin-bottom: 5px;">
          <p style="margin: 5px 0; font-size: 12px; font-weight: 600; color: #2c3e50;">Authorized Signatory</p>
        </div>
      </div>
      <p style="text-align: center; font-size: 10px; color: #999; margin-top: 20px;">Page 2/2</p>
    </div>
  `;return{page1Html:y,page2Html:N}},oe=async r=>{const g=L.loading("Generating PDF...",{position:"top-center"});let s=null,p=null;try{const{page1Html:f,page2Html:w}=Se(r),m=new me({orientation:"portrait",unit:"mm",format:"a4",hotfixes:["px_scaling"]}),u=m.internal.pageSize.getWidth(),v=m.internal.pageSize.getHeight(),c=7;s=document.createElement("div"),s.style.position="fixed",s.style.top="-9999px",s.style.left="-9999px",s.style.width=`${u-2*c}mm`,s.style.padding="0",s.style.background="white",s.style.zIndex="-1",s.style.display="block",s.innerHTML=f,document.body.appendChild(s),await new Promise(j=>setTimeout(j,200));const h=(await q(s,{scale:3,useCORS:!0,logging:!1,allowTaint:!0,letterRendering:!0,backgroundColor:"#ffffff"})).toDataURL("image/png",1),d=m.getImageProperties(h),y=d.height*(u-2*c)/d.width;m.addImage(h,"PNG",c,c,u-2*c,y),m.addPage(),p=document.createElement("div"),p.style.position="fixed",p.style.top="-9999px",p.style.left="-9999px",p.style.width=`${u-2*c}mm`,p.style.padding="0",p.style.background="white",p.style.zIndex="-1",p.style.display="block",p.innerHTML=w,document.body.appendChild(p),await new Promise(j=>setTimeout(j,200));const C=(await q(p,{scale:3,useCORS:!0,logging:!1,allowTaint:!0,letterRendering:!0,backgroundColor:"#ffffff"})).toDataURL("image/png",1),N=m.getImageProperties(C),F=N.height*(u-2*c)/N.width;m.addImage(C,"PNG",c,c,u-2*c,F),m.save(`${r.quotationNumber||"quotation"}_${new Date().toISOString().slice(0,10)}.pdf`),L.success("PDF downloaded successfully!",{id:g})}catch(f){console.error("Failed to generate PDF:",f),L.error("Failed to generate PDF. Please try again.",{id:g})}finally{s&&document.body.contains(s)&&document.body.removeChild(s),p&&document.body.contains(p)&&document.body.removeChild(p)}},{Text:S}=re,Ze=({quotations:r,onAddNew:g,onEdit:s,onDelete:p,onSearch:f,onViewNotes:w,loading:m,refreshQuotations:u})=>{var T,P,z,R,$,n,x;const[v,c]=A.useState(!1),[a,h]=A.useState(null),[d,y]=A.useState(!1),k=t=>{h(t),c(!0),L.success("Quotation details loaded.",{duration:1500,position:"top-right"})},C=t=>{h(t),y(!0)},N=t=>`₹${(parseFloat(t)||0).toLocaleString("en-IN",{minimumFractionDigits:2,maximumFractionDigits:2})}`,F=()=>[{title:"S.No",width:60,align:"center",render:(t,o,i)=>i+1},{title:"Product Name",dataIndex:"productName",ellipsis:!0,render:(t,o)=>(console.log("Item in QuotationList:",o),t||o.name||"N/A")},{title:"Description",dataIndex:"description",ellipsis:!0,render:(t,o)=>{var i;if(!t&&((i=o.specifications)==null?void 0:i.length)>0){const l=o.specifications.find(b=>b.name==="SPECIFICATION");return l?l.value:"N/A"}return t||"N/A"}},{title:"HSN/SAC",dataIndex:"hsnSac",width:100,align:"center",render:t=>t||"N/A"},{title:"Qty",dataIndex:"quantity",width:80,align:"center",render:t=>parseFloat(t)||0},{title:"Unit Price (₹)",width:140,align:"right",render:(t,o)=>N(o.rate||0)},{title:"Total (₹)",width:140,align:"right",render:(t,o)=>e.jsx(S,{strong:!0,style:{color:"#52c41a"},children:N((o.quantity||0)*(o.rate||0))})}],j=[{title:"Quotation #",dataIndex:"quotationNumber",render:t=>e.jsx(V,{color:"blue",children:t||"N/A"}),sorter:(t,o)=>(t.quotationNumber||"").localeCompare(o.quotationNumber||"")},{title:"Business",dataIndex:"businessName",sorter:(t,o)=>(t.businessName||"").localeCompare(o.businessName||"")},{title:"Customer",dataIndex:"customerName",render:(t,o)=>{var i,l,b;return e.jsxs("div",{children:[e.jsx("div",{children:((i=o.businessId)==null?void 0:i.contactName)||t||"N/A"}),(((l=o.businessId)==null?void 0:l.email)||o.customerEmail)&&e.jsx("div",{style:{fontSize:12,color:"#666"},children:((b=o.businessId)==null?void 0:b.email)||o.customerEmail})]})},sorter:(t,o)=>{var i,l;return(((i=t.businessId)==null?void 0:i.contactName)||t.customerName||"").localeCompare(((l=o.businessId)==null?void 0:l.contactName)||o.customerName||"")}},{title:"Items Count",render:(t,o)=>{var i,l;return e.jsxs(V,{color:"geekblue",children:[((i=o.items)==null?void 0:i.length)||0," item",(((l=o.items)==null?void 0:l.length)||0)!==1?"s":""]})}},{title:"Latest Note",dataIndex:"notes",render:t=>{if(t&&t.length>0){const o=t[t.length-1],i=o.text.length>30?`${o.text.substring(0,30)}...`:o.text;return e.jsx(de,{title:o.text,children:e.jsx(S,{type:"secondary",children:i})})}return e.jsx(S,{type:"secondary",italic:!0,children:"No notes"})}},{title:"Total (₹)",dataIndex:"total",render:(t,o)=>{var l;const i=parseFloat(t)||((l=o.items)==null?void 0:l.reduce((b,D)=>b+(D.quantity||0)*(D.rate||0),0))||0;return e.jsx(S,{strong:!0,style:{color:"#52c41a"},children:N(i)})},sorter:(t,o)=>{const i=parseFloat(t.total)||0,l=parseFloat(o.total)||0;return i-l}},{title:"Date",dataIndex:"date",render:t=>{if(!t)return"N/A";try{return new Date(t).toLocaleDateString("en-IN")}catch{return t}},sorter:(t,o)=>{const i=new Date(t.date).getTime()||0,l=new Date(o.date).getTime()||0;return i-l}},{title:"Actions",width:80,render:(t,o)=>e.jsx(pe,{overlay:e.jsxs(M,{children:[e.jsx(M.Item,{icon:e.jsx(ue,{}),onClick:()=>k(o),children:"View Details"},"view"),e.jsx(M.Item,{icon:e.jsx(ee,{}),onClick:()=>oe(o),children:"Download PDF"},"download"),e.jsx(M.Item,{icon:e.jsx(he,{}),onClick:()=>{w(o),L.success("Opening notes dialog...",{duration:1500})},children:"View/Add Notes"},"notes"),e.jsx(M.Item,{icon:e.jsx(ye,{}),onClick:()=>C(o),children:"Add/View Follow-ups"},"followups"),e.jsx(M.Item,{icon:e.jsx(be,{}),onClick:()=>{s(o),L.success("Initiating quotation edit...",{duration:1500})},children:"Edit Quotation"},"edit"),e.jsx(M.Item,{children:e.jsxs(we,{title:"Are you sure you want to delete this account?",onConfirm:()=>p(o._id),okText:"Yes",cancelText:"No",children:[e.jsx(ve,{}),"Delete Quotation"]})})]}),trigger:["click"],children:e.jsx(U,{icon:e.jsx(fe,{})})})}];return e.jsxs(e.Fragment,{children:[e.jsxs(le,{style:{marginBottom:16,justifyContent:"space-between",width:"100%"},children:[e.jsx(ie.Search,{placeholder:"Search by quotation number, business, customer, or notes...",onChange:t=>{f(t.target.value)},style:{width:400},prefix:e.jsx(ce,{}),allowClear:!0}),e.jsx(U,{type:"primary",onClick:()=>{g(),L.success("Prepare to create a new quotation.",{duration:1500})},children:"+ New Quotation"})]}),e.jsx(Y,{columns:j,dataSource:r,rowKey:"_id",loading:m,pagination:{pageSize:10,showSizeChanger:!0,showQuickJumper:!0,showTotal:(t,o)=>`${o[0]}-${o[1]} of ${t} quotations`},scroll:{x:1200}}),e.jsx(ae,{title:e.jsxs("div",{children:[e.jsx(S,{strong:!0,children:"Quotation Details"}),a&&e.jsx(V,{color:"blue",style:{marginLeft:8},children:a.quotationNumber})]}),open:v,onCancel:()=>c(!1),footer:[e.jsx(U,{icon:e.jsx(ee,{}),onClick:()=>oe(a),children:"Download PDF"},"download"),e.jsx(U,{onClick:()=>c(!1),children:"Close"},"close")],width:1e3,children:a&&e.jsxs("div",{id:`quotation-modal-preview-${a._id}`,children:[e.jsxs(I,{column:2,bordered:!0,size:"small",children:[e.jsx(I.Item,{label:"Quotation Number",children:e.jsx(V,{color:"blue",children:a.quotationNumber||"N/A"})}),e.jsx(I.Item,{label:"Date",children:a.date?new Date(a.date).toLocaleDateString("en-IN"):"N/A"}),e.jsx(I.Item,{label:"Business Name",children:a.businessName||"N/A"}),e.jsx(I.Item,{label:"Contact Person",children:((T=a.businessId)==null?void 0:T.contactName)||a.customerName||"N/A"}),e.jsx(I.Item,{label:"Customer Email",children:((P=a.businessId)==null?void 0:P.email)||a.customerEmail||"N/A"}),e.jsx(I.Item,{label:"Mobile Number",children:a.mobileNumber||((z=a.businessId)==null?void 0:z.mobileNumber)||((R=a.businessId)==null?void 0:R.phone)||"N/A"}),e.jsx(I.Item,{label:"GSTIN",children:e.jsx(S,{code:!0,children:a.gstin||"N/A"})}),e.jsx(I.Item,{label:"Business Info",span:2,children:e.jsx(S,{style:{whiteSpace:"pre-wrap"},children:a.businessInfo||"N/A"})}),e.jsx(I.Item,{label:"Total Amount",span:2,children:e.jsx(S,{style:{fontSize:"18px",fontWeight:"bold",color:"#52c41a"},children:N(a.total||(($=a.items)==null?void 0:$.reduce((t,o)=>t+(o.quantity||0)*(o.rate||0),0))||0)})})]}),((n=a.items)==null?void 0:n.length)>0&&e.jsxs(e.Fragment,{children:[e.jsxs(G,{orientation:"left",children:["Items (",a.items.length,")"]}),e.jsx(Y,{dataSource:a.items,columns:F(),pagination:!1,size:"small",rowKey:(t,o)=>`${a._id}-item-${o}`,bordered:!0,expandable:{expandedRowRender:t=>{var o;return e.jsx("div",{style:{margin:0,padding:0},children:((o=t.specifications)==null?void 0:o.length)>0&&e.jsx(I,{column:1,size:"small",children:t.specifications.filter(i=>i.name!=="SPECIFICATION").map((i,l)=>e.jsx(I.Item,{label:i.name,children:i.value},l))})})},rowExpandable:t=>{var o;return((o=t.specifications)==null?void 0:o.length)>0}},summary:t=>{const o=t.reduce((i,l)=>i+(l.quantity||0)*(l.rate||0),0);return e.jsx(Y.Summary,{fixed:!0,children:e.jsxs(Y.Summary.Row,{children:[e.jsxs(Y.Summary.Cell,{index:0,colSpan:6,children:[" ",e.jsx(S,{strong:!0,children:"Grand Total:"})]}),e.jsxs(Y.Summary.Cell,{index:6,children:[" ",e.jsx(S,{strong:!0,style:{color:"#52c41a"},children:N(o)})]})]})})}})]}),((x=a.notes)==null?void 0:x.length)>0&&e.jsxs(e.Fragment,{children:[e.jsxs(G,{orientation:"left",children:["Notes (",a.notes.length,")"]}),a.notes.map((t,o)=>e.jsxs("div",{style:{marginBottom:12,padding:8,background:"#f5f5f5",borderRadius:4},children:[e.jsxs(S,{italic:!0,children:['"',t.text,'"']}),e.jsx("br",{}),e.jsxs(S,{type:"secondary",style:{fontSize:"0.8em"},children:["— ",t.author," on"," ",t.timestamp||new Date(a.createdAt).toLocaleDateString("en-IN")]})]},o))]})]})}),a&&e.jsx(je,{visible:d,onClose:()=>y(!1),quotation:a,refreshQuotations:u})]})};export{Ze as default};
