"use client";

import { FormEvent, ReactNode, useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import {
  Armchair, CalendarDays, Camera, Check, ChevronLeft, Crown, Download,
  LayoutDashboard, LayoutGrid, MapPin, Menu, PackagePlus, PartyPopper,
  Phone, Plus, Search, Sparkles, TableProperties, TentTree, Trash2, X
} from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";

type Party = {id:number;eventType:string;customerName:string;phone1:string;phone2:string;area:string;eventDate:string;notes:string};
type Category = {id:number;name:string;icon:string};
type Product = {id:number;categoryId:number;name:string;description:string;price:number|null;imageUrl?:string;isPremium:boolean};
type Pick = {id:number;eventId:number;itemId:number;quantity:number};
type Modal = "party"|"product"|"category"|null;

const defaultCategories:Category[]=[
  {id:1,name:"الكراسي",icon:"chair"},{id:2,name:"الطاولات",icon:"table"},
  {id:3,name:"كوشة العرسان",icon:"arch"},{id:4,name:"الديكور",icon:"sparkles"}
];
const defaultProducts:Product[]=[
  {id:11,categoryId:1,name:"كرسي Ghost",description:"شفاف، عصري، ومثالي للأعراس",price:18,isPremium:false},
  {id:12,categoryId:1,name:"كرسي Chiavari",description:"أبيض كلاسيكي بوسادة مريحة",price:14,isPremium:false},
  {id:13,categoryId:1,name:"Throne Duo",description:"طقم فاخر خاص بمنصة العرسان",price:240,isPremium:true}
];

export default function Home(){
  const app=useRef<HTMLDivElement>(null);
  const [parties,setParties]=useState<Party[]>([]);
  const [categories,setCategories]=useState<Category[]>(defaultCategories);
  const [products,setProducts]=useState<Product[]>(defaultProducts);
  const [picks,setPicks]=useState<Pick[]>([]);
  const [activeParty,setActiveParty]=useState<Party|null>(null);
  const [activeCategory,setActiveCategory]=useState(1);
  const [search,setSearch]=useState("");
  const [modal,setModal]=useState<Modal>(null);
  const [mobileOrder,setMobileOrder]=useState(false);
  const [ready,setReady]=useState(false);
  const [partyForm,setPartyForm]=useState({eventType:"عرس",customerName:"",phone1:"",phone2:"",area:"",eventDate:"",notes:""});
  const [productForm,setProductForm]=useState({name:"",description:"",price:"",isPremium:false});
  const [categoryName,setCategoryName]=useState("");
  const [file,setFile]=useState<File|null>(null);

  useEffect(()=>{
    try{
      const data=JSON.parse(localStorage.getItem("beit-alfarah-data")||"{}");
      if(data.events)setParties(data.events);
      if(data.categories?.length){setCategories(data.categories.map((c:Category,i:number)=>({...c,id:c.id<0?i+1:c.id})));setActiveCategory(data.categories[0].id<0?1:data.categories[0].id)}
      if(data.items?.length)setProducts(data.items.map((p:Product,i:number)=>({...p,id:p.id<0?i+11:p.id,categoryId:p.categoryId<0?Math.abs(p.categoryId):p.categoryId})));
      if(data.selections)setPicks(data.selections);
    }catch{}
    setReady(true);
  },[]);
  useEffect(()=>{if(ready)localStorage.setItem("beit-alfarah-data",JSON.stringify({events:parties,categories,items:products,selections:picks}))},[ready,parties,categories,products,picks]);
  useEffect(()=>{
    if(!app.current)return;
    const ctx=gsap.context(()=>{
      gsap.from(".js-nav",{x:35,opacity:0,duration:.7,ease:"power3.out"});
      gsap.from(".js-enter",{y:24,opacity:0,duration:.75,stagger:.1,ease:"power3.out"});
      gsap.from(".js-order",{x:-30,opacity:0,duration:.75,delay:.25,ease:"power3.out"});
    },app);
    return()=>ctx.revert();
  },[]);
  useEffect(()=>{
    gsap.fromTo(".product-card",{opacity:0,y:16,scale:.985},{opacity:1,y:0,scale:1,duration:.4,stagger:.05,ease:"power2.out",overwrite:true});
  },[activeCategory,search]);

  const partyPicks=useMemo(()=>activeParty?picks.filter(p=>p.eventId===activeParty.id):[],[activeParty,picks]);
  const selected=useMemo(()=>partyPicks.map(pick=>({pick,product:products.find(p=>p.id===pick.itemId)})).filter(x=>x.product) as {pick:Pick;product:Product}[],[partyPicks,products]);
  const total=selected.reduce((n,x)=>n+(x.product.price||0)*x.pick.quantity,0);
  const filtered=products.filter(p=>p.categoryId===activeCategory&&p.name.toLowerCase().includes(search.toLowerCase()));

  function saveParty(e:FormEvent){
    e.preventDefault();
    const party={...partyForm,id:Date.now()};
    setParties(v=>[party,...v]);setActiveParty(party);setModal(null);
    setPartyForm({eventType:"عرس",customerName:"",phone1:"",phone2:"",area:"",eventDate:"",notes:""});
    toast.success("تم إنشاء كرت الحفلة");
  }
  function saveCategory(e:FormEvent){
    e.preventDefault();if(!categoryName.trim())return;
    const category={id:Date.now(),name:categoryName.trim(),icon:"sparkles"};
    setCategories(v=>[...v,category]);setActiveCategory(category.id);setCategoryName("");setModal(null);
  }
  function saveProduct(e:FormEvent){
    e.preventDefault();
    const commit=(imageUrl?:string)=>{
      const product={id:Date.now(),categoryId:activeCategory,name:productForm.name.trim(),description:productForm.description.trim(),price:productForm.price?Number(productForm.price):null,isPremium:productForm.isPremium,imageUrl};
      setProducts(v=>[product,...v]);setProductForm({name:"",description:"",price:"",isPremium:false});setFile(null);setModal(null);toast.success("تمت إضافة القطعة");
    };
    if(file){const reader=new FileReader();reader.onload=()=>commit(String(reader.result));reader.readAsDataURL(file)}else commit();
  }
  function toggleProduct(product:Product){
    if(!activeParty){toast.info("اختر حفلة أو أنشئ كرتًا جديدًا أولاً");return}
    const found=partyPicks.find(p=>p.itemId===product.id);
    if(found)setPicks(v=>v.filter(p=>p.id!==found.id));
    else{setPicks(v=>[...v,{id:Date.now(),eventId:activeParty.id,itemId:product.id,quantity:1}]);toast.success("أضيفت إلى الطلب")}
  }

  return <div ref={app} className="app-shell" dir="rtl">
    <Toaster position="top-center" richColors/>
    <aside className="nav-rail js-nav">
      <div className="logo"><span><PartyPopper/></span><div><b>بيت الفرح</b><small>EVENT STUDIO</small></div></div>
      <nav>
        <button className="active"><LayoutDashboard/><span>الرئيسية</span></button>
        <button><CalendarDays/><span>الحفلات</span><em>{parties.length}</em></button>
        <button><LayoutGrid/><span>الكتالوج</span></button>
      </nav>
      <div className="rail-parties">
        <div className="rail-label"><span>آخر الحفلات</span><button onClick={()=>setModal("party")}><Plus/></button></div>
        {parties.slice(0,5).map(p=><button key={p.id} onClick={()=>setActiveParty(p)} className={activeParty?.id===p.id?"active":""}>
          <i>{p.customerName.charAt(0)}</i><span><b>{p.customerName}</b><small>{p.eventType} · {p.area}</small></span>
        </button>)}
        {!parties.length&&<p>ابدأ بإنشاء أول كرت حفلة</p>}
      </div>
      <div className="rail-bottom"><Crown/><div><small>بيت الفرح</small><b>نصنع لحظات لا تُنسى</b></div></div>
    </aside>

    <div className="main-area">
      <header className="mobile-header">
        <button><Menu/></button><div className="logo compact"><span><PartyPopper/></span><b>بيت الفرح</b></div>
        <button className="mobile-add" onClick={()=>setModal("party")}><Plus/></button>
      </header>
      <main>
        <section className="page-head js-enter">
          <div><span className="overline">DASHBOARD / كتالوج المناسبات</span><h1>صباح الفرح <Sparkles/></h1><p>جهّز مناسبتك، رتّب اختياراتك، وشارك العرض مع الزبون.</p></div>
          <button className="new-party" onClick={()=>setModal("party")}><span><Plus/></span><div><small>إضافة جديدة</small><b>فتح كرت حفلة</b></div><ChevronLeft/></button>
        </section>

        <section className="spotlight js-enter">
          <div className="spot-copy"><span>BEIT ALFARAH COLLECTION</span><h2>تفاصيل صغيرة.<br/><em>فرحة كبيرة.</em></h2><p>كتالوج واحد يجمع كل ما تحتاجه حفلتك من أول كرسي لآخر لمسة.</p></div>
          <div className="metrics"><Metric value={parties.length} label="حفلة"/><Metric value={products.length} label="قطعة"/><Metric value={selected.length} label="مختارة"/></div>
          <div className="spot-art"><div className="ring one"/><div className="ring two"/><Sparkles/></div>
        </section>

        <section className="catalog js-enter">
          <div className="catalog-toolbar">
            <div><span className="overline">CATALOG</span><h3>اختر التجهيزات</h3></div>
            <div className="tools">
              <label className="search-box"><Search/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="ابحث في الكتالوج"/></label>
              <button onClick={()=>setModal("category")}><LayoutGrid/><span>قسم</span></button>
              <button className="add-product" onClick={()=>setModal("product")}><Camera/><span>قطعة جديدة</span></button>
            </div>
          </div>
          <div className="category-tabs">{categories.map(c=><button key={c.id} onClick={()=>setActiveCategory(c.id)} className={activeCategory===c.id?"active":""}><CategoryIcon name={c.icon}/><span>{c.name}</span></button>)}</div>
          <ProductRow products={filtered.filter(p=>!p.isPremium)} picks={partyPicks} toggle={toggleProduct}/>
          <div className="premium-block">
            <div className="premium-title"><div><Crown/><span><small>EXCLUSIVE</small><b>Premium Collection</b></span></div><p>تفاصيل مختارة للمناسبات الاستثنائية</p></div>
            <ProductRow products={filtered.filter(p=>p.isPremium)} picks={partyPicks} toggle={toggleProduct} premium/>
          </div>
        </section>
      </main>
    </div>

    <aside className="order-panel js-order"><Order party={activeParty} selected={selected} total={total} remove={toggleProduct}/></aside>
    <button className="order-fab" onClick={()=>setMobileOrder(true)}><span><small>ملخص الحفلة</small><b>{activeParty?.customerName||"اختر حفلة"}</b></span><em>{selected.length}</em></button>
    {mobileOrder&&<div className="sheet-layer" onMouseDown={()=>setMobileOrder(false)}><div className="mobile-sheet" onMouseDown={e=>e.stopPropagation()}><button className="close" onClick={()=>setMobileOrder(false)}><X/></button><Order party={activeParty} selected={selected} total={total} remove={toggleProduct}/></div></div>}
    {modal&&<EditorModal modal={modal} close={()=>setModal(null)} partyForm={partyForm} setPartyForm={setPartyForm} saveParty={saveParty} categoryName={categoryName} setCategoryName={setCategoryName} saveCategory={saveCategory} productForm={productForm} setProductForm={setProductForm} file={file} setFile={setFile} saveProduct={saveProduct}/>}
  </div>
}

function Metric({value,label}:{value:number;label:string}){return <div><b>{String(value).padStart(2,"0")}</b><span>{label}</span></div>}
function CategoryIcon({name}:{name:string}){return name==="chair"?<Armchair/>:name==="table"?<TableProperties/>:name==="arch"?<TentTree/>:<Sparkles/>}
function ProductRow({products,picks,toggle,premium=false}:{products:Product[];picks:Pick[];toggle:(p:Product)=>void;premium?:boolean}){
  if(!products.length)return <div className="empty-row"><PackagePlus/><span>{premium?"أضف أول قطعة Premium":"لا توجد قطع في هذا القسم بعد"}</span></div>;
  return <div className="product-row">{products.map(p=>{const picked=picks.some(x=>x.itemId===p.id);return <article key={p.id} className={"product-card "+(premium?"premium ":"")+(picked?"selected":"")} onClick={()=>toggle(p)}>
    <div className="product-image">{p.imageUrl?<img src={p.imageUrl} alt={p.name}/>:<div className="placeholder"><Sparkles/><small>BEIT ALFARAH</small></div>}{premium&&<span className="tag premium-tag"><Crown/> PREMIUM</span>}{picked&&<span className="tag picked-tag"><Check/> تمت الإضافة</span>}</div>
    <div className="product-info"><h4>{p.name}</h4><p>{p.description||"تفاصيل مميزة تناسب حفلتك"}</p><div><strong>{p.price!==null?p.price+" ₪":"حسب الطلب"}</strong><span><Plus/></span></div></div>
  </article>})}</div>
}
function Order({party,selected,total,remove}:{party:Party|null;selected:{pick:Pick;product:Product}[];total:number;remove:(p:Product)=>void}){
  if(!party)return <div className="order-empty"><div><PartyPopper/></div><span>ORDER SUMMARY</span><h3>الحفلة تبدأ من هنا</h3><p>اختر حفلة من القائمة، ثم أضف القطع التي أعجبت الزبون.</p></div>;
  return <div id="print-order" className="order-content">
    <div className="order-top"><span>ORDER SUMMARY</span><Sparkles/></div>
    <div className="client"><i>{party.customerName.charAt(0)}</i><div><small>{party.eventType}</small><h3>{party.customerName}</h3></div></div>
    <div className="client-data"><Data icon={<Phone/>} label="الهاتف" value={[party.phone1,party.phone2].filter(Boolean).join(" · ")}/><Data icon={<MapPin/>} label="الموقع" value={party.area}/><Data icon={<CalendarDays/>} label="الموعد" value={party.eventDate||"غير محدد"}/></div>
    <div className="line-title"><b>التجهيزات</b><span>{selected.length}</span></div>
    <div className="order-items">{selected.map(({pick,product})=><div className="order-item" key={pick.id}><div className="thumb">{product.imageUrl?<img src={product.imageUrl} alt=""/>:<Sparkles/>}</div><div><b>{product.name}</b><small>{product.description||"بدون ملاحظات"}</small></div><strong>{product.price!==null?product.price+" ₪":"—"}</strong><button className="no-print" onClick={()=>remove(product)}><Trash2/></button></div>)}{!selected.length&&<div className="no-items">لم تُضف تجهيزات بعد</div>}</div>
    {party.notes&&<div className="note"><Sparkles/><span><small>ملاحظات</small><b>{party.notes}</b></span></div>}
    <div className="order-total"><span>المجموع التقريبي</span><b>{total} ₪</b></div>
    <button className="pdf no-print" onClick={()=>window.print()}><Download/>تنزيل العرض PDF</button>
  </div>
}
function Data({icon,label,value}:{icon:ReactNode;label:string;value:string}){return <div><span>{icon}</span><p><small>{label}</small><b>{value}</b></p></div>}
function Field({label,children}:{label:string;children:ReactNode}){return <label className="field"><span>{label}</span>{children}</label>}
function EditorModal(p:any){return <div className="modal-layer" onMouseDown={p.close}><div className="editor" onMouseDown={e=>e.stopPropagation()}><button className="close" onClick={p.close}><X/></button>
  {p.modal==="party"&&<><ModalHead icon={<CalendarDays/>} kicker="NEW EVENT" title="فتح كرت حفلة"/><form className="form-grid" onSubmit={p.saveParty}><Field label="نوع الحفلة"><select value={p.partyForm.eventType} onChange={(e:any)=>p.setPartyForm({...p.partyForm,eventType:e.target.value})}>{["عرس","حنّة","حفلة توجيهي","عيد ميلاد","حفلة أخرى"].map(x=><option key={x}>{x}</option>)}</select></Field>{[["اسم الزبون","customerName"],["رقم الهاتف الأول","phone1"],["رقم الهاتف الثاني","phone2"],["منطقة الحفلة","area"]].map(([label,key],i)=><Field key={key} label={label}><input required={i===0||i===1||i===3} value={p.partyForm[key]} onChange={(e:any)=>p.setPartyForm({...p.partyForm,[key]:e.target.value})}/></Field>)}<Field label="تاريخ الحفلة"><input type="date" value={p.partyForm.eventDate} onChange={(e:any)=>p.setPartyForm({...p.partyForm,eventDate:e.target.value})}/></Field><Field label="ملاحظات"><textarea value={p.partyForm.notes} onChange={(e:any)=>p.setPartyForm({...p.partyForm,notes:e.target.value})}/></Field><button className="submit">حفظ وفتح الكتالوج <ChevronLeft/></button></form></>}
  {p.modal==="category"&&<><ModalHead icon={<LayoutGrid/>} kicker="NEW CATEGORY" title="إضافة قسم"/><form onSubmit={p.saveCategory}><Field label="اسم القسم"><input required value={p.categoryName} onChange={(e:any)=>p.setCategoryName(e.target.value)} placeholder="مثال: إضاءة"/></Field><button className="submit">إضافة القسم <ChevronLeft/></button></form></>}
  {p.modal==="product"&&<><ModalHead icon={<Camera/>} kicker="NEW ITEM" title="قطعة جديدة"/><form onSubmit={p.saveProduct}><label className="upload"><Camera/><b>{p.file?p.file.name:"اضغط لإضافة صورة"}</b><small>JPG أو PNG</small><input hidden type="file" accept="image/*" onChange={(e:any)=>p.setFile(e.target.files?.[0]||null)}/></label><Field label="اسم القطعة"><input required value={p.productForm.name} onChange={(e:any)=>p.setProductForm({...p.productForm,name:e.target.value})}/></Field><Field label="وصف مختصر"><textarea value={p.productForm.description} onChange={(e:any)=>p.setProductForm({...p.productForm,description:e.target.value})}/></Field><Field label="السعر"><input type="number" min="0" value={p.productForm.price} onChange={(e:any)=>p.setProductForm({...p.productForm,price:e.target.value})}/></Field><label className="premium-switch"><span><Crown/> إضافة إلى Premium</span><input type="checkbox" checked={p.productForm.isPremium} onChange={(e:any)=>p.setProductForm({...p.productForm,isPremium:e.target.checked})}/></label><button className="submit">حفظ القطعة <ChevronLeft/></button></form></>}
  </div></div>}
function ModalHead({icon,kicker,title}:{icon:ReactNode;kicker:string;title:string}){return <div className="modal-head"><span>{icon}</span><div><small>{kicker}</small><h2>{title}</h2></div></div>}
