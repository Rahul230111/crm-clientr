import{r as T,an as R,x as e,B as W,S as ne,K as ae,V as E,ao as Z,H as le,T as de,ap as pe,aq as z}from"./index-CZgQqLfI.js";import{i as G}from"./axios-YBtE4rUB.js";import{h as Y}from"./moment-C5S46NFB.js";import{D as ce}from"./index-B6TlI61K.js";import{T as oe}from"./index-CB9xQmd4.js";import{D as ge,d as xe}from"./index-DIRm6ece.js";import{I as ie,R as me}from"./index-DWX3x5ai.js";import{D as J}from"./index-rg2p_jxb.js";import{L as X}from"./index-CJ0CWZlj.js";import{R as re}from"./MessageOutlined-cVTrQxTs.js";import{E as ue,h as q,R as fe}from"./html2canvas.esm-B8CbTv1H.js";import{c as he}from"./TextArea-CTv69aKC.js";import{F as _}from"./Table-CnepTkjr.js";import{M as ye}from"./index-9utniKb1.js";import{D as v}from"./index-BdZZMniz.js";import{T as B}from"./index-DXLMTLf9.js";import{R as ee}from"./PrinterOutlined-BQoo_g11.js";import{R as be}from"./ScheduleOutlined-B4hJas5O.js";import{R as we}from"./EditOutlined-DJ3ogbdu.js";import{P as ve}from"./index-DDn0nfjQ.js";import{R as Ne}from"./DeleteOutlined-WMzUbiB-.js";import"./context-B2CzmVss.js";import"./useClosable-Cts7cbVj.js";import"./index-B1Sb9fqV.js";import"./dayjs.min-Dvo63gQe.js";import"./addEventListener-DCmjTk4f.js";import"./index-C4Sy3oYk.js";import"./InfoCircleFilled-xOWyfpeL.js";import"./ActionButton-E9ix_odB.js";import"./index-B-Qum5uf.js";const{TextArea:Ie}=ie,{Text:H}=oe,je=({visible:s,onClose:g,quotation:n,refreshQuotations:p})=>{const[f,N]=T.useState(""),[m,x]=T.useState(null),[y,c]=T.useState(!1),[i,h]=T.useState([]),[d,b]=T.useState(null),[U,$]=T.useState([]),[I,C]=T.useState(!1),j=()=>{try{const r=JSON.parse(localStorage.getItem("user"));return(r==null?void 0:r.email)||"Unknown"}catch{return"Unknown"}};T.useEffect(()=>{s&&(n!=null&&n._id)?(k(),L()):(h([]),b(null),N(""),x(null),$([]))},[s,n]);const L=async()=>{C(!0);try{const r=await G.get("/api/users");Array.isArray(r.data)?$(r.data):(console.warn("API for users did not return an array:",r.data),$([]))}catch(r){console.error("Failed to fetch users:",r),R.error("Could not load user details for display."),$([])}finally{C(!1)}},M=r=>{if(!r)return"Unknown User";if(typeof r=="object"&&r!==null)return r.name||r.email||"Unknown User";const u=U.find(w=>w._id===r||w.id===r);return u?u.name||u.email||`User ID: ${r}`:`Unknown User (ID: ${r})`},k=async()=>{if(n!=null&&n._id){c(!0);try{const r=await G.get(`/api/quotations/${n._id}/followups`);h(r.data.sort((u,w)=>Y(w.createdAt).diff(Y(u.createdAt))))}catch(r){console.error("Error fetching follow-ups:",r),R.error("Failed to fetch follow-ups.")}finally{c(!1)}}},F=async()=>{if(!m||!f.trim()){R.error("Please select a date and enter a note for the follow-up.");return}c(!0);try{let r;const u=JSON.parse(localStorage.getItem("user")),w=(u==null?void 0:u._id)||(u==null?void 0:u.id);if(!w){R.error("User information not found. Please log in."),c(!1);return}const D={date:Y(m).toISOString(),note:f.trim(),addedBy:w};d===null?r=G.post(`/api/quotations/${n._id}/followups`,D):r=G.put(`/api/quotations/${n._id}/followups/${d._id}`,D),r.then(()=>{R.success(d===null?"Follow-up added successfully!":"Follow-up updated successfully!"),N(""),x(null),b(null),k(),typeof p=="function"&&p()}).catch(t=>{var o,a;console.error("Error saving follow-up:",t),R.error(`Error saving follow-up: ${((a=(o=t.response)==null?void 0:o.data)==null?void 0:a.message)||t.message}`)}).finally(()=>{c(!1)})}catch(r){console.error("Error preparing follow-up data:",r),R.error("An unexpected error occurred."),c(!1)}},P=r=>e.jsx(X.Item,{children:e.jsxs("div",{style:{backgroundColor:"#f0f2f5",borderRadius:"12px",padding:"10px 15px",maxWidth:"calc(100% - 80px)",flexGrow:1},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",marginBottom:"5px"},children:[e.jsx(ae,{style:{marginRight:"5px",color:"#888"}}),e.jsx(H,{strong:!0,style:{marginRight:"10px",color:"#333"},children:M(r.addedBy)}),e.jsx(xe,{style:{marginRight:"5px",color:"#888"}}),e.jsx(H,{type:"secondary",style:{fontSize:"0.8em"},children:Y(r.createdAt).format("DD/MM/YYYY, h:mm:ss A")})]}),e.jsxs("div",{style:{display:"flex",alignItems:"flex-start"},children:[e.jsx(re,{style:{marginRight:"8px",marginTop:"3px",color:"#555"}}),e.jsx(H,{style:{flexGrow:1},children:r.note})]})]})});return e.jsxs(ce,{title:`Follow-ups for Quotation: ${(n==null?void 0:n.quotationNumber)||"N/A"}`,open:s,onClose:()=>{b(null),N(""),x(null),g()},width:720,children:[e.jsxs("div",{style:{marginBottom:20},children:[e.jsxs(H,{type:"secondary",style:{marginBottom:8,display:"block",fontSize:"0.9em"},children:["Adding follow-up as: ",e.jsx(H,{strong:!0,children:j()})]}),e.jsx(ge,{style:{width:"100%",marginBottom:8},format:"DD-MM-YYYY",value:m,onChange:r=>x(r),placeholder:"Select follow-up date"}),e.jsx(Ie,{rows:4,placeholder:"Enter follow-up note",value:f,onChange:r=>N(r.target.value)}),e.jsx(W,{type:"primary",style:{marginTop:10,backgroundColor:"#ef7a1b",borderColor:"#ef7a1b",color:"white"},block:!0,onClick:F,loading:y,children:d===null?"Add Follow-up":"Update Follow-up"})]}),e.jsxs(J,{children:["All Follow-ups (",i.length,")"]}),y||I?e.jsx("div",{style:{textAlign:"center",padding:"20px"},children:e.jsx(ne,{size:"large",tip:"Loading Follow-ups..."})}):e.jsx(X,{dataSource:i,renderItem:P,locale:{emptyText:"No follow-ups found for this quotation."},style:{marginTop:16}})]})},V=s=>`₹${(parseFloat(s)||0).toLocaleString("en-IN",{minimumFractionDigits:2,maximumFractionDigits:2})}`,Se=s=>{if(typeof s!="number"||isNaN(s))return"N/A";let g=Math.floor(s),n=Math.round((s-g)*100);const p=["","One","Two","Three","Four","Five","Six","Seven","Eight","Nine"],f=["Ten","Eleven","Twelve","Thirteen","Fourteen","Fifteen","Sixteen","Seventeen","Eighteen","Nineteen"],N=["","","Twenty","Thirty","Forty","Fifty","Sixty","Seventy","Eighty","Ninety"],m=["","Thousand","Lakh","Crore"],x=d=>d<10?p[d]:d>=10&&d<20?f[d-10]:N[Math.floor(d/10)]+(d%10!==0?" "+p[d%10]:"");let y=[],c=0;if(g===0)y.push("Zero");else{let d=g%1e3;for(d>0&&(d<100?y.push(x(d)):y.push(p[Math.floor(d/100)]+" Hundred"+(d%100!==0?" "+x(d%100):""))),g=Math.floor(g/1e3);g>0;){let b=g%100;b>0?y.push(x(b)+" "+m[++c]):c++,g=Math.floor(g/100)}}const i=y.reverse().filter(Boolean).join(" ").trim();let h=i?i+" Rupees":"Zero Rupees";return n>0&&(h+=` and ${x(n)} Paisa`),h+=" Only",h.replace(/\s+/g," ")},Ae=s=>{var C,j,L,M,k,F,P,r,u,w,D;const g=((C=s.items)==null?void 0:C.reduce((t,o)=>t+(o.quantity||0)*(o.rate||0),0))||0,p=g*.18,f=g+p,N=Z,m=Z,x=((j=s.businessId)==null?void 0:j.contactName)||s.contactName||"N/A",y=s.mobileNumber||((L=s.businessId)==null?void 0:L.mobileNumber)||((M=s.businessId)==null?void 0:M.phone)||"N/A",c=((k=s.businessId)==null?void 0:k.email)||s.email||"N/A",i=((F=s.businessId)==null?void 0:F.gstin)||s.gstin||"N/A",h=((r=(P=s.businessId)==null?void 0:P.address)==null?void 0:r.replace(/\n/g,"<br>"))||((u=s.businessInfo)==null?void 0:u.replace(/\n/g,"<br>"))||"N/A",d=`
    <div style="margin-bottom: 20px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
        <div style="display: flex; align-items: center;">
         <img src="${N}" alt="Company Logo" style="width: 200px; height: 70px; margin-right: 15px;">
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
  `,b=`
    <div style="padding: 15px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 800px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); background: white;">
      ${d}

      <div style="margin-bottom: 20px; background: #f9fafb; border-radius: 6px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
        <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
          <tr>
            <td style="border: 1px solid #e0e0e0; padding: 8px; font-weight: 600; width: 25%; background: #f0f2f5;">Company Name</td>
            <td style="border: 1px solid #e0e0e0; padding: 8px; width: 25%;">
              ${s.businessName||"N/A"}
            </td>
            <td style="border: 1px solid #e0e0e0; padding: 8px; font-weight: 600; width: 25%; background: #f0f2f5;">Date</td>
            <td style="border: 1px solid #e0e0e0; padding: 8px; width: 25%;">
              ${s.date?new Date(s.date).toLocaleDateString("en-IN"):new Date().toLocaleDateString("en-IN")}
            </td>
          </tr>
          <tr>
            <td style="border: 1px solid #e0e0e0; padding: 8px; font-weight: 600; background: #f0f2f5;">Contact Person</td>
            <td style="border: 1px solid #e0e0e0; padding: 8px;">
              ${x}
            </td>
            <td style="border: 1px solid #e0e0e0; padding: 8px; font-weight: 600; background: #f0f2f5;">Quotation No</td>
            <td style="border: 1px solid #e0e0e0; padding: 8px;">
              ${s.quotationNumber||"N/A"}
            </td>
          </tr>
          <tr>
            <td style="border: 1px solid #e0e0e0; padding: 8px; font-weight: 600; background: #f0f2f5;">Contact Number</td>
            <td style="border: 1px solid #e0e0e0; padding: 8px;">
              ${y} </td>
            <td style="border: 1px solid #e0e0e0; padding: 8px; font-weight: 600; background: #f0f2f5;">Customer GST No.</td>
            <td style="border: 1px solid #e0e0e0; padding: 8px;">
              ${i}
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

      ${((w=s.items)==null?void 0:w.length)>0?`
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
                ${s.items.map((t,o)=>{var O;const a=(t==null?void 0:t.productName)||"N/A";let l=(t==null?void 0:t.description)||"";!l&&((O=t.specifications)==null?void 0:O.length)>0&&(l=t.specifications.map(K=>`${K.name}: ${K.value}`).join(", ")),l=l||"N/A";const S=parseFloat(t.quantity)||0,Q=parseFloat(t.rate)||0,se=(S*Q).toFixed(2);return`
                      <tr style="${o%2===0?"background: #fff;":"background: #f9fafb;"}">
                        <td style="border: 1px solid #e0e0e0; padding: 8px; text-align: center; vertical-align: top;">${o+1}</td>
                        <td style="border: 1px solid #e0e0e0; padding: 8px; text-align: left; vertical-align: top;">
                          ${a}
                        </td>
                        <td style="border: 1px solid #e0e0e0; padding: 8px; text-align: left; vertical-align: top;">
                          ${l}
                        </td>
                        <td style="border: 1px solid #e0e0e0; padding: 8px; text-align: center; vertical-align: top;">
                          ${S}
                        </td>
                        <td style="border: 1px solid #e0e0e0; padding: 8px; text-align: right; vertical-align: top;">${V(Q)}</td>
                        <td style="border: 1px solid #e0e0e0; padding: 8px; text-align: right; font-weight: 600; vertical-align: top;">
                          ${V(parseFloat(se))}
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
                <td style="border: 1px solid #e0e0e0; padding: 10px; text-align: right; font-weight: 600; width: 15%;">${V(g)}</td>
              </tr>
              <tr>
                <td style="width: 70%;"></td>
                <td style="border: 1px solid #e0e0e0; padding: 10px; text-align: right; width: 15%; background: #f0f2f5;">GST (18%)</td>
                <td style="border: 1px solid #e0e0e0; padding: 10px; text-align: right; width: 15%;">${V(p)}</td>
              </tr>
              <tr style="background: #e8f5e9;">
                <td style="width: 70%;"></td>
                <td style="border: 1px solid #e0e0e0; padding: 10px; text-align: right; font-weight: 600; font-size: 13px; width: 15%;">Total Amount</td>
                <td style="border: 1px solid #e0e0e0; padding: 10px; text-align: right; font-weight: 600; font-size: 13px; width: 15%;">${V(f)}</td>
              </tr>
            </table>
          </div>

          <div style="margin-top: 15px; background: #f5f5f5; border: 1px solid #e0e0e0; border-radius: 6px; padding: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
            <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
              <tr>
                <td style="font-weight: 600; padding: 4px; width: 25%; color: #555;">Amount In Words</td>
                <td style="padding: 4px; font-style: italic; width: 75%;">${Se(f)}</td>
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
  `,U=(D=s.items)==null?void 0:D.filter(t=>t.specifications&&t.specifications.length>0).map(t=>{const a=`- ${t.productName||t.description||"Product"}`,l=t.specifications.map(S=>`
          <tr>
            <td style="border: 1px solid #e0e0e0; padding: 8px; font-weight: 600; width: 40%; background: #f9f9f9; vertical-align: top;">${S.name||""}</td>
            <td style="border: 1px solid #e0e0e0; padding: 8px; vertical-align: top;">${S.value||""}</td>
          </tr>
        `).join("");return`
        <div style="margin-bottom: 20px; background: #f9fafb; border-radius: 6px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
          <div style="background: linear-gradient(135deg, #2c3e50, #34495e); color: white; padding: 8px 12px; font-weight: 600; font-size: 13px;">
            PRODUCT SPECIFICATIONS ${a}
          </div>
          <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
            <tbody>
              ${l}
            </tbody>
          </table>
        </div>
      `}).join(""),$=`
    <div style="margin-top: 20px; background: #f9fafb; border-radius: 6px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
      <div style="background: linear-gradient(135deg, #2c3e50, #34495e); color: white; padding: 8px 12px; font-weight: 600; font-size: 13px;">
        GENERAL TERMS & CONDITIONS
      </div>
      <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
        <tbody>
          <tr>
            <td style="border: 1px solid #e0e0e0; padding: 8px; font-weight: 600; width: 30%; background: #f0f2f5; vertical-align: top;">Payment Terms</td>
            <td style="border: 1px solid #e0e0e0; padding: 8px; vertical-align: top;">${s.Payment||"50% advance, 50% on delivery"}</td>
          </tr>
          <tr>
            <td style="border: 1px solid #e0e0e0; padding: 8px; font-weight: 600; width: 30%; background: #f0f2f5; vertical-align: top;">Delivery Period</td>
            <td style="border: 1px solid #e0e0e0; padding: 8px; vertical-align: top;">${s.Delivery?`${s.Delivery} days`:"Within 15 working days after advance"}</td>
          </tr>
          <tr>
            <td style="border: 1px solid #e0e0e0; padding: 8px; font-weight: 600; width: 30%; background: #f0f2f5; vertical-align: top;">Warranty</td>
            <td style="border: 1px solid #e0e0e0; padding: 8px; vertical-align: top;">${s.Warranty?`${s.Warranty} year(s)`:"1 year from the date of invoice"}</td>
          </tr>
          <tr>
            <td style="border: 1px solid #e0e0e0; padding: 8px; font-weight: 600; width: 30%; background: #f0f2f5; vertical-align: top;">Freight</td>
            <td style="border: 1px solid #e0e0e0; padding: 8px; vertical-align: top;">${s.Freight||"Extra as per actual"}</td>
          </tr>
          <tr>
            <td style="border: 1px solid #e0e0e0; padding: 8px; font-weight: 600; width: 30%; background: #f0f2f5; vertical-align: top;">Validity</td>
            <td style="border: 1px solid #e0e0e0; padding: 8px; vertical-align: top;">${s.Validity||"30 days from the date of quotation"}</td>
          </tr>
        </tbody>
      </table>
    </div>
  `,I=`
    <div style="padding: 15px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 800px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); background: white;">
      ${d}

      ${U}

      ${$}

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
  `;return{page1Html:b,page2Html:I}},te=async s=>{const g=E.loading("Generating PDF...",{position:"top-center"});let n=null,p=null;try{const{page1Html:f,page2Html:N}=Ae(s),m=new ue({orientation:"portrait",unit:"mm",format:"a4",hotfixes:["px_scaling"]}),x=m.internal.pageSize.getWidth(),y=m.internal.pageSize.getHeight(),c=7;n=document.createElement("div"),n.style.position="fixed",n.style.top="-9999px",n.style.left="-9999px",n.style.width=`${x-2*c}mm`,n.style.padding="0",n.style.background="white",n.style.zIndex="-1",n.style.display="block",n.innerHTML=f,document.body.appendChild(n),await new Promise(j=>setTimeout(j,200));const h=(await q(n,{scale:2,useCORS:!0,logging:!1,allowTaint:!0,letterRendering:!0,backgroundColor:"#ffffff"})).toDataURL("image/jpeg",.8),d=m.getImageProperties(h),b=d.height*(x-2*c)/d.width;m.addImage(h,"JPEG",c,c,x-2*c,b),m.addPage(),p=document.createElement("div"),p.style.position="fixed",p.style.top="-9999px",p.style.left="-9999px",p.style.width=`${x-2*c}mm`,p.style.padding="0",p.style.background="white",p.style.zIndex="-1",p.style.display="block",p.innerHTML=N,document.body.appendChild(p),await new Promise(j=>setTimeout(j,200));const $=(await q(p,{scale:2,useCORS:!0,logging:!1,allowTaint:!0,letterRendering:!0,backgroundColor:"#ffffff"})).toDataURL("image/jpeg",.8),I=m.getImageProperties($),C=I.height*(x-2*c)/I.width;m.addImage($,"JPEG",c,c,x-2*c,C),m.save(`${s.quotationNumber||"quotation"}_${new Date().toISOString().slice(0,10)}.pdf`),E.success("PDF downloaded successfully!",{id:g})}catch(f){console.error("Failed to generate PDF:",f),E.error("Failed to generate PDF. Please try again.",{id:g})}finally{n&&document.body.contains(n)&&document.body.removeChild(n),p&&document.body.contains(p)&&document.body.removeChild(p)}},{Text:A}=oe,it=({quotations:s,onAddNew:g,onEdit:n,onDelete:p,onSearch:f,onViewNotes:N,loading:m,refreshQuotations:x})=>{var k,F,P,r,u,w,D;const[y,c]=T.useState(!1),[i,h]=T.useState(null),[d,b]=T.useState(!1),U=t=>{h(t),c(!0),E.success("Quotation details loaded.",{duration:1500,position:"top-right"})},$=t=>{h(t),b(!0)},I=t=>`₹${(parseFloat(t)||0).toLocaleString("en-IN",{minimumFractionDigits:2,maximumFractionDigits:2})}`,C=()=>[{title:"S.No",width:60,align:"center",render:(t,o,a)=>a+1},{title:"Product Name",dataIndex:"productName",ellipsis:!0,render:(t,o)=>(console.log("Item in QuotationList:",o),t||o.name||"N/A")},{title:"Description",dataIndex:"description",ellipsis:!0,render:(t,o)=>{var a;if(!t&&((a=o.specifications)==null?void 0:a.length)>0){const l=o.specifications.find(S=>S.name==="SPECIFICATION");return l?l.value:"N/A"}return t||"N/A"}},{title:"HSN/SAC",dataIndex:"hsnSac",width:100,align:"center",render:t=>t||"N/A"},{title:"Qty",dataIndex:"quantity",width:80,align:"center",render:t=>parseFloat(t)||0},{title:"Unit Price (₹)",width:140,align:"right",render:(t,o)=>I(o.rate||0)},{title:"Total (₹)",width:140,align:"right",render:(t,o)=>e.jsx(A,{strong:!0,style:{color:"#52c41a"},children:I((o.quantity||0)*(o.rate||0))})}],j=JSON.parse(localStorage.getItem("user")),L=j==null?void 0:j.role,M=[{title:"Quotation #",dataIndex:"quotationNumber",render:t=>e.jsx(B,{color:"blue",children:t||"N/A"}),sorter:(t,o)=>(t.quotationNumber||"").localeCompare(o.quotationNumber||"")},{title:"Business",dataIndex:"businessName",sorter:(t,o)=>(t.businessName||"").localeCompare(o.businessName||"")},{title:"Customer",dataIndex:"customerName",render:(t,o)=>{var a,l,S;return e.jsxs("div",{children:[e.jsx("div",{children:((a=o.businessId)==null?void 0:a.contactName)||t||"N/A"}),(((l=o.businessId)==null?void 0:l.email)||o.customerEmail)&&e.jsx("div",{style:{fontSize:12,color:"#666"},children:((S=o.businessId)==null?void 0:S.email)||o.customerEmail})]})},sorter:(t,o)=>{var a,l;return(((a=t.businessId)==null?void 0:a.contactName)||t.customerName||"").localeCompare(((l=o.businessId)==null?void 0:l.contactName)||o.customerName||"")}},{title:"Status",dataIndex:"status",render:t=>{let o="default";return t==="Approved"?o="green":t==="Pending"?o="orange":t==="Rejected"?o="red":t==="Draft"&&(o="blue"),e.jsx(B,{color:o,children:t||"N/A"})},sorter:(t,o)=>(t.status||"").localeCompare(o.status||"")},{title:"Items Count",render:(t,o)=>{var a,l;return e.jsxs(B,{color:"geekblue",children:[((a=o.items)==null?void 0:a.length)||0," item",(((l=o.items)==null?void 0:l.length)||0)!==1?"s":""]})}},{title:"Latest Note",dataIndex:"notes",render:t=>{if(t&&t.length>0){const o=t[t.length-1],a=o.text.length>30?`${o.text.substring(0,30)}...`:o.text;return e.jsx(de,{title:o.text,children:e.jsx(A,{type:"secondary",children:a})})}return e.jsx(A,{type:"secondary",italic:!0,children:"No notes"})}},{title:"Total (₹)",dataIndex:"total",render:(t,o)=>{var l;const a=parseFloat(t)||((l=o.items)==null?void 0:l.reduce((S,Q)=>S+(Q.quantity||0)*(Q.rate||0),0))||0;return e.jsx(A,{strong:!0,style:{color:"#52c41a"},children:I(a)})},sorter:(t,o)=>{const a=parseFloat(t.total)||0,l=parseFloat(o.total)||0;return a-l}},{title:"Date",dataIndex:"date",render:t=>{if(!t)return"N/A";try{return new Date(t).toLocaleDateString("en-IN")}catch{return t}},sorter:(t,o)=>{const a=new Date(t.date).getTime()||0,l=new Date(o.date).getTime()||0;return a-l}},{title:"Actions",width:80,render:(t,o)=>e.jsx(pe,{overlay:e.jsxs(z,{children:[e.jsx(z.Item,{icon:e.jsx(me,{}),onClick:()=>U(o),children:"View Details"},"view"),e.jsx(z.Item,{icon:e.jsx(ee,{}),onClick:()=>te(o),children:"Download PDF"},"download"),e.jsx(z.Item,{icon:e.jsx(re,{}),onClick:()=>{N(o),E.success("Opening notes dialog...",{duration:1500})},children:"View/Add Notes"},"notes"),e.jsx(z.Item,{icon:e.jsx(be,{}),onClick:()=>$(o),children:"Add/View Follow-ups"},"followups"),e.jsx(z.Item,{icon:e.jsx(we,{}),onClick:()=>{n(o),E.success("Initiating quotation edit...",{duration:1500})},children:"Edit Quotation"},"edit"),L==="Superadmin"&&e.jsx(z.Item,{children:e.jsxs(ve,{title:"Are you sure you want to close this account? This will set its status to 'Closed'.",onConfirm:()=>handleDeleteAccount(o._id),okText:"Yes",cancelText:"No",children:[e.jsx(Ne,{}),"Close Account"]})},"close-account")]}),trigger:["click"],children:e.jsx(W,{icon:e.jsx(fe,{})})})}];return e.jsxs(e.Fragment,{children:[e.jsxs(le,{style:{marginBottom:16,justifyContent:"space-between",width:"100%"},children:[e.jsx(ie.Search,{placeholder:"Search by quotation number, business, customer, or notes...",onChange:t=>{f(t.target.value)},style:{width:200},prefix:e.jsx(he,{}),allowClear:!0}),e.jsx(W,{type:"primary",style:{backgroundColor:"#ef7a1b",borderColor:"#orange",color:"white"},onClick:()=>{g(),E.success("Prepare to create a new quotation.",{duration:1500})},children:"+ Add"})]}),e.jsx(_,{columns:M,dataSource:s,rowKey:"_id",loading:m,pagination:{pageSize:10,showSizeChanger:!0,showQuickJumper:!0,showTotal:(t,o)=>`${o[0]}-${o[1]} of ${t} quotations`},scroll:{x:1200}}),e.jsx(ye,{title:e.jsxs("div",{children:[e.jsx(A,{strong:!0,children:"Quotation Details"}),i&&e.jsx(B,{color:"blue",style:{marginLeft:8},children:i.quotationNumber})]}),open:y,onCancel:()=>c(!1),footer:[e.jsx(W,{icon:e.jsx(ee,{}),onClick:()=>te(i),children:"Download PDF"},"download"),e.jsx(W,{onClick:()=>c(!1),children:"Close"},"close")],width:1e3,children:i&&e.jsxs("div",{id:`quotation-modal-preview-${i._id}`,children:[e.jsxs(v,{column:2,bordered:!0,size:"small",children:[e.jsx(v.Item,{label:"Quotation Number",children:e.jsx(B,{color:"blue",children:i.quotationNumber||"N/A"})}),e.jsx(v.Item,{label:"Date",children:i.date?new Date(i.date).toLocaleDateString("en-IN"):"N/A"}),e.jsxs(v.Item,{label:"Status",children:[" ",e.jsx(B,{color:i.status==="Approved"?"green":i.status==="Pending"?"orange":i.status==="Rejected"?"red":"blue",className:"rounded-full px-3 py-1 text-sm font-medium",children:i.status||"N/A"})]}),e.jsx(v.Item,{label:"Business Name",children:i.businessName||"N/A"}),e.jsx(v.Item,{label:"Contact Person",children:((k=i.businessId)==null?void 0:k.contactName)||i.customerName||"N/A"}),e.jsx(v.Item,{label:"Customer Email",children:((F=i.businessId)==null?void 0:F.email)||i.customerEmail||"N/A"}),e.jsx(v.Item,{label:"Mobile Number",children:i.mobileNumber||((P=i.businessId)==null?void 0:P.mobileNumber)||((r=i.businessId)==null?void 0:r.phone)||"N/A"}),e.jsx(v.Item,{label:"GSTIN",children:e.jsx(A,{code:!0,children:i.gstin||"N/A"})}),e.jsx(v.Item,{label:"Business Info",span:2,children:e.jsx(A,{style:{whiteSpace:"pre-wrap"},children:i.businessInfo||"N/A"})}),e.jsx(v.Item,{label:"Total Amount",span:2,children:e.jsx(A,{style:{fontSize:"18px",fontWeight:"bold",color:"#52c41a"},children:I(i.total||((u=i.items)==null?void 0:u.reduce((t,o)=>t+(o.quantity||0)*(o.rate||0),0))||0)})})]}),((w=i.items)==null?void 0:w.length)>0&&e.jsxs(e.Fragment,{children:[e.jsxs(J,{orientation:"left",children:["Items (",i.items.length,")"]}),e.jsx(_,{dataSource:i.items,columns:C(),pagination:!1,size:"small",rowKey:(t,o)=>`${i._id}-item-${o}`,bordered:!0,expandable:{expandedRowRender:t=>{var o;return e.jsx("div",{style:{margin:0,padding:0},children:((o=t.specifications)==null?void 0:o.length)>0&&e.jsx(v,{column:1,size:"small",children:t.specifications.filter(a=>a.name!=="SPECIFICATION").map((a,l)=>e.jsx(v.Item,{label:a.name,children:a.value},l))})})},rowExpandable:t=>{var o;return((o=t.specifications)==null?void 0:o.length)>0}},summary:t=>{const o=t.reduce((a,l)=>a+(l.quantity||0)*(l.rate||0),0);return e.jsx(_.Summary,{fixed:!0,children:e.jsxs(_.Summary.Row,{children:[e.jsxs(_.Summary.Cell,{index:0,colSpan:6,children:[" ",e.jsx(A,{strong:!0,children:"Grand Total:"})]}),e.jsxs(_.Summary.Cell,{index:6,children:[" ",e.jsx(A,{strong:!0,style:{color:"#52c41a"},children:I(o)})]})]})})}})]}),((D=i.notes)==null?void 0:D.length)>0&&e.jsxs(e.Fragment,{children:[e.jsxs(J,{orientation:"left",children:["Notes (",i.notes.length,")"]}),i.notes.map((t,o)=>e.jsxs("div",{style:{marginBottom:12,padding:8,background:"#f5f5f5",borderRadius:4},children:[e.jsxs(A,{italic:!0,children:['"',t.text,'"']}),e.jsx("br",{}),e.jsxs(A,{type:"secondary",style:{fontSize:"0.8em"},children:["— ",t.author," on"," ",t.timestamp||new Date(i.createdAt).toLocaleDateString("en-IN")]})]},o))]})]})}),i&&e.jsx(je,{visible:d,onClose:()=>b(!1),quotation:i,refreshQuotations:x})]})};export{it as default};
