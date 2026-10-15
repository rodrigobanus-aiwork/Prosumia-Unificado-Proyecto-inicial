import React,{useEffect,useMemo,useState} from 'react';
import {Activity,BarChart3,CalendarDays,ChartNoAxesCombined,FileText,Facebook,Instagram,LayoutDashboard,MessageCircle,Search,Users,X as XIcon} from 'lucide-react';
import {CartesianGrid,Line,LineChart,ResponsiveContainer,Tooltip,XAxis,YAxis,Legend} from 'recharts';
import {UNIVERSES,imageFor,initials,type Universe} from '../lib/catalog';
import {loadData,identities,monthValue,intervalValue,pairRatio,metricLabels,formatValue,monthLabel,key,period, type Metric,type Observation,type Identity} from '../lib/metrics';
import './unified.css';
type Tab='ranking'|'lectura'|'evolutivo'|'comparacion';
const tabs:{id:Tab;label:string;icon:React.ElementType}[]=[{id:'ranking',label:'Ranking',icon:LayoutDashboard},{id:'lectura',label:'Lectura',icon:FileText},{id:'evolutivo',label:'Evolutivo',icon:ChartNoAxesCombined},{id:'comparacion',label:'Comparación',icon:BarChart3}];
const METRICS:Metric[]=['Fans','Publicaciones','Reacciones','Interacciones','Comentarios','Visualizaciones','Crecimiento seguidores'];
const networks=['FB','IG','TW','TIK TOK','TT','TK','X','YT'];
const palette=['#087e46','#e7a000','#dc343e','#2b67c7','#9b55aa','#088b99','#8f4e19','#555'];
const formatPeriod=(p:number)=>monthLabel(p);
function BadgeImage({item,size=42}:{item:Identity;size?:number}){
 const src=imageFor(item.category,item.entity);const [broken,setBroken]=useState(false);
 useEffect(()=>setBroken(false),[src]);
 return <span className="entity-avatar" style={{width:size,height:size,fontSize:size<30?9:12}} title={`${item.entity} (${item.category})`}>
   {src&&!broken?<img src={src} alt={item.entity} onError={()=>setBroken(true)}/>:<span>{initials(item.entity)}</span>}
 </span>;
}
function Select({label,value,onChange,options}:{label?:string;value:string;onChange:(s:string)=>void;options:{value:string;label:string}[]}){
 return <label className="field">{label&&<span>{label}</span>}<select value={value} onChange={e=>onChange(e.target.value)}>{options.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}</select></label>;
}
const all=(items:string[],label:string)=>[{value:'*',label},...items.map(item=>({value:item,label:item}))];
const metricOptions=METRICS.map(m=>({value:m,label:metricLabels[m]}));
const networkOptions=networks.map(n=>({value:n,label:n}));
const RANK_METRICS:Metric[]=['Fans','Publicaciones','Reacciones','Interacciones','Comentarios'];
function metricFor(rows:Observation[],metric:Metric){return intervalValue(rows,metric);}
function Rankings({items,rows,selected,month,network,category}:{items:Identity[];rows:Observation[];selected:string[];month:number;network:string;category:string}){
 const thisMonth=rows.filter(r=>period(r)===month&&r.network===network&&(category==='*'||r.category===category));
 return <div className="ranking-grid">{RANK_METRICS.map((metric,index)=>{
  const values=items.map(item=>({item,value:monthValue(thisMonth.filter(r=>key(r.category,r.entity)===item.id),metric)})).filter((x):x is {item:Identity;value:number}=>x.value!==undefined).sort((a,b)=>b.value-a.value);
  const max=Math.max(1,...values.map(x=>x.value));
  return <section className="ranking-card" key={metric}><div className="ranking-head"><div className="head-icon">{[<Users size={17}/>,<FileText size={17}/>,<Activity size={17}/>,<BarChart3 size={17}/>,<MessageCircle size={17}/>][index]}</div><strong>{metricLabels[metric]}</strong><small>{metric==='Fans'?'Valores absolutos':'Volumen mensual'}</small></div><div className="ranking-rows">{!values.length&&<p className="empty">Sin datos disponibles para esta combinación.</p>}{values.map((x,i)=><div className={`ranking-entry ${selected.length&&!selected.includes(x.item.id)?'dim':''}`} key={x.item.id} title={`${x.item.entity} · ${metricLabels[metric]}: ${formatValue(x.value)}`}><span className="rank-number">{i+1}</span><BadgeImage item={x.item} size={22}/><div className="rank-main"><div className="rank-label"><b>{x.item.entity}</b><span>{formatValue(x.value)}</span></div><div className="rank-track"><span style={{width:`${Math.max(1,100*x.value/max)}%`,background:i<6?'#0ea75d':i<12?'#faaa00':'#e9121c'}}/></div></div></div>)}</div></section>;
 })}</div>;
}
function Reading({items,rows,selected,network,range}:{items:Identity[];rows:Observation[];selected:string[];network:string;range:[number,number]}){
 const shown=selected.length?items.filter(x=>selected.includes(x.id)):items.slice(0,8);
 return <div className="panel"><h2>Lectura de cuentas</h2><p className="muted">{selected.length?'Resumen de las cuentas seleccionadas.':'Seleccioná círculos para analizar cuentas específicas. Se muestran las primeras ocho como referencia.'} Los faltantes se indican como s/d.</p><div className="reading-grid">{shown.map(item=>{
  const points=rows.filter(r=>key(r.category,r.entity)===item.id&&r.network===network&&period(r)>=range[0]&&period(r)<=range[1]);
  const fans=metricFor(points,'Fans'),pub=metricFor(points,'Publicaciones'),reac=metricFor(points,'Reacciones'),eng=pairRatio(reac,pub);
  return <article className="reading-card" key={item.id}><div className="reading-title"><BadgeImage item={item} size={48}/><div><strong>{item.entity}</strong><small>{item.category} · {item.province||'Sin provincia'}</small></div></div><div className="reading-stats"><div><small>Seguidores</small><b>{formatValue(fans)}</b></div><div><small>Publicaciones</small><b>{formatValue(pub)}</b></div><div><small>Reacciones</small><b>{formatValue(reac)}</b></div><div><small>Reacciones / post</small><b>{formatValue(eng,1)}</b></div></div><p className="muted">{pub===undefined?'No hay publicaciones registradas en el período.':`Registra ${formatValue(pub)} publicaciones en el período seleccionado.`} {eng===undefined?'No se puede calcular una tasa comparable.':`Promedio de ${formatValue(eng,1)} reacciones por publicación.`}</p></article>;
 })}</div></div>;
}
function Evolution({items,rows,selected,network,range}:{items:Identity[];rows:Observation[];selected:string[];network:string;range:[number,number]}){
 const [metric,setMetric]=useState<Metric>('Fans');const [granularity,setGranularity]=useState('mensual');
 const candidates=selected.length?items.filter(x=>selected.includes(x.id)):items.slice(0,8);
 const series=candidates.slice(0,16);
 const chart=useMemo(()=>{
  const group=(r:Observation)=>granularity==='anual'?r.year:granularity==='semestral'?r.year*10+Math.ceil(r.month/6):granularity==='trimestral'?r.year*10+Math.ceil(r.month/3):period(r);
  const groupLabel=(groupId:number)=>granularity==='anual'?String(groupId):granularity==='semestral'?`${Math.floor(groupId/10)} S${groupId%10}`:granularity==='trimestral'?`${Math.floor(groupId/10)} T${groupId%10}`:formatPeriod(groupId);
  const buckets=new Map<number,Record<string,number|string>>();
  rows.filter(r=>r.network===network&&period(r)>=range[0]&&period(r)<=range[1]&&r.metric===metric).forEach(r=>{const id=key(r.category,r.entity);if(!series.some(s=>s.id===id))return;const t=group(r);if(!buckets.has(t))buckets.set(t,{period:groupLabel(t)});});
  for(const item of series){const observations=rows.filter(r=>key(r.category,r.entity)===item.id&&r.network===network&&r.metric===metric&&period(r)>=range[0]&&period(r)<=range[1]);const byTime=new Map<number,Observation[]>();for(const obs of observations){const t=group(obs);byTime.set(t,[...(byTime.get(t)||[]),obs]);}for(const [t,bucket] of byTime){const value=intervalValue(bucket,metric);if(value!==undefined)buckets.get(t)![item.id]=value;}}
  return [...buckets.entries()].sort(([a],[b])=>a-b).map(([,row])=>row);
 },[series.map(s=>s.id).join('|'),rows,metric,network,range[0],range[1],granularity]);
 return <div className="panel"><div className="panel-top"><div><h2>Evolutivo</h2><p className="muted">Una línea por cuenta seleccionada; sin imputar períodos sin datos.</p></div><div className="control-row"><Select value={metric} onChange={v=>setMetric(v as Metric)} options={metricOptions}/><Select value={granularity} onChange={setGranularity} options={['mensual','trimestral','semestral','anual'].map(v=>({value:v,label:v[0].toUpperCase()+v.slice(1)}))}/></div></div>{series.length>0&&chart.length>0?<div className="chart-wrap"><ResponsiveContainer width="100%" height={450}><LineChart data={chart} margin={{left:12,right:26,top:18,bottom:20}}><CartesianGrid strokeDasharray="3 3"/><XAxis dataKey="period" tick={{fontSize:11}}/><YAxis tick={{fontSize:11}} tickFormatter={v=>formatValue(v)}/><Tooltip formatter={v=>formatValue(Number(v))}/><Legend/>{series.map((item,i)=><Line key={item.id} name={item.entity} dataKey={item.id} stroke={palette[i%palette.length]} strokeWidth={2.6} dot={{r:2}} connectNulls={false} type="monotone"/>)}</LineChart></ResponsiveContainer></div>:<p className="empty">No hay series disponibles para esta selección.</p>}<p className="muted footnote">Se muestran hasta 16 series; elegí cuentas mediante los círculos. Seguidores: último valor del período. Los flujos se suman.</p></div>;
}
function Comparison({items,rows,selected,range,network}:{items:Identity[];rows:Observation[];selected:string[];range:[number,number];network:string}){
 const [columns,setColumns]=useState<{network:string;metric:Metric}[]>([{network:'FB',metric:'Fans'},{network:'IG',metric:'Fans'},{network:'FB',metric:'Publicaciones'},{network:'IG',metric:'Reacciones'},{network:'FB',metric:'Comentarios'}]);
 const patch=(i:number,keyName:'network'|'metric',value:string)=>setColumns(prev=>prev.map((c,j)=>i===j?{...c,[keyName]:value}:c));
 return <div className="compare-grid">{columns.map((col,i)=>{
  const values=items.map(item=>({item,value:intervalValue(rows.filter(r=>key(r.category,r.entity)===item.id&&r.network===col.network&&period(r)>=range[0]&&period(r)<=range[1]),col.metric)})).filter((x):x is {item:Identity;value:number}=>x.value!==undefined).sort((a,b)=>b.value-a.value);
  const max=Math.max(1,...values.map(x=>x.value));
  return <div className="ranking-card" key={i}><div className="compare-controls"><Select value={col.network} onChange={v=>patch(i,'network',v)} options={networkOptions}/><Select value={col.metric} onChange={v=>patch(i,'metric',v)} options={metricOptions}/></div><div className="ranking-rows">{!values.length&&<p className="empty">Sin datos.</p>}{values.map((x,j)=><div className={`ranking-entry ${selected.length&&!selected.includes(x.item.id)?'dim':''}`} key={x.item.id}><span className="rank-number">{j+1}</span><BadgeImage item={x.item} size={22}/><div className="rank-main"><div className="rank-label"><b>{x.item.entity}</b><span>{formatValue(x.value)}</span></div><div className="rank-track"><span style={{width:`${Math.max(1,100*x.value/max)}%`,background:j<6?'#0ea75d':j<12?'#faaa00':'#e9121c'}}/></div></div></div>)}</div></div>;
 })}</div>;
}
export default function UnifiedDashboard(){
 const [rows,setRows]=useState<Observation[]>([]),[loadError,setLoadError]=useState(''),[loading,setLoading]=useState(true);
 const [universe,setUniverse]=useState<Universe>('gobernadores'),[tab,setTab]=useState<Tab>('ranking');
 const [category,setCategory]=useState('*'),[network,setNetwork]=useState('FB'),[province,setProvince]=useState('*'),[periodChosen,setPeriodChosen]=useState(''),[search,setSearch]=useState('');
 const [selected,setSelected]=useState<string[]>([]),[rangeFrom,setRangeFrom]=useState(''),[rangeTo,setRangeTo]=useState('');
 useEffect(()=>{loadData().then(setRows).catch(e=>setLoadError(String(e))).finally(()=>setLoading(false));},[]);
 const scope=useMemo(()=>rows.filter(r=>r.universe===universe),[rows,universe]);
 const categories=useMemo(()=>[...new Set(scope.map(r=>r.category))].sort((a,b)=>a.localeCompare(b,'es')),[scope]);
 const byCategory=useMemo(()=>scope.filter(r=>category==='*'||r.category===category),[scope,category]);
 const provinces=useMemo(()=>[...new Set(byCategory.map(r=>r.province).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'es')),[byCategory]);
 const filtered=useMemo(()=>byCategory.filter(r=>province==='*'||r.province===province),[byCategory,province]);
 const profiles=useMemo(()=>identities(filtered).filter(x=>x.entity.toLowerCase().includes(search.toLowerCase())),[filtered,search]);
 const filteredIds=new Set(profiles.map(x=>x.id));
 const visibleRows=useMemo(()=>filtered.filter(r=>filteredIds.has(key(r.category,r.entity))),[filtered,profiles]);
 const availableNetworks=useMemo(()=>[...new Set(filtered.map(r=>r.network))].sort((a,b)=>networks.indexOf(a)-networks.indexOf(b)),[filtered]);
 const periods=useMemo(()=>[...new Set(filtered.filter(r=>r.network===network).map(period))].sort((a,b)=>a-b),[filtered,network]);
 const currentPeriod=periods.includes(Number(periodChosen))?Number(periodChosen):periods[periods.length-1]||0;
 const from=periods.includes(Number(rangeFrom))?Number(rangeFrom):periods[0]||0;
 const to=periods.includes(Number(rangeTo))?Number(rangeTo):periods[periods.length-1]||0;
 const toggle=(id:string)=>setSelected(prev=>prev.includes(id)?prev.filter(x=>x!==id):[...prev,id]);
 const switchUniverse=(u:Universe)=>{setUniverse(u);setCategory('*');setProvince('*');setNetwork('FB');setPeriodChosen('');setRangeFrom('');setRangeTo('');setSearch('');setSelected([]);setTab('ranking');};
 if(loading)return <div className="loading">Cargando métricas de Prosumia…</div>;
 if(loadError)return <div className="loading">Error leyendo los datos: {loadError}</div>;
 return <div className="app-root"><header className="app-header"><div className="header-inner"><div className="identity"><div className="logo">✳</div><div><h1>Ranking de<br/> {universe==='gobernadores'?'Gobernadores':UNIVERSES.find(u=>u.id===universe)?.label}</h1><small>POWERED BY ANALYTICS</small><div className="subhead">📍 Argentina &nbsp; ↗ Ranking Mensual</div></div></div><nav className="tabs">{tabs.map(x=><button className={tab===x.id?'active':''} onClick={()=>setTab(x.id)} key={x.id}><x.icon size={14}/>{x.label}</button>)}</nav><div className="header-filters"><div className="social-buttons">{availableNetworks.map(n=><button key={n} onClick={()=>setNetwork(n)} className={network===n?'active':''}>{n==='FB'?<Facebook size={13}/>:n==='IG'?<Instagram size={13}/>:null}{n}</button>)}</div><Select label="Mes" value={String(currentPeriod)} onChange={setPeriodChosen} options={periods.slice().reverse().map(v=>({value:String(v),label:formatPeriod(v)}))}/></div></div></header>
 <main className="content"><nav className="universes">{UNIVERSES.map(u=><button key={u.id} onClick={()=>switchUniverse(u.id)} className={universe===u.id?'selected':''}><span className="little-dot"/><span><b>{u.label}</b><small>{u.detail}</small></span></button>)}</nav>
 <section className="filters"><Select label="Categoría" value={category} onChange={v=>{setCategory(v);setProvince('*');setSelected([]);setPeriodChosen('')}} options={all(categories,'Todas las categorías')}/><Select label="Provincia" value={province} onChange={v=>{setProvince(v);setSelected([])}} options={all(provinces,'Todas las provincias')}/><label className="field"><span>Buscar cuenta</span><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Nombre…"/></label>{tab!=='ranking'&&<><Select label="Desde" value={String(from)} onChange={setRangeFrom} options={periods.map(v=>({value:String(v),label:formatPeriod(v)}))}/><Select label="Hasta" value={String(to)} onChange={setRangeTo} options={periods.map(v=>({value:String(v),label:formatPeriod(v)}))}/></>}<span className="result-count">{profiles.length} cuentas · {categories.length} categorías</span></section>
 <section className="accounts"><div className="account-title"><strong>Seleccionar cuentas</strong><small>{selected.length} seleccionadas</small></div><div className="account-scroll"><button className={`account-button ${selected.length?'':'chosen'}`} onClick={()=>setSelected([])}><span className="entity-avatar" style={{width:56,height:56}}>Todos</span><small>Todos</small></button>{profiles.map(item=><button className={`account-button ${selected.includes(item.id)?'chosen':''}`} key={item.id} title={`${item.entity} · ${item.category}`} onClick={()=>toggle(item.id)}><BadgeImage item={item} size={56}/><small>{item.entity}</small></button>)}</div></section>
 <div className="view-title"><div><h2>{tabs.find(t=>t.id===tab)?.label} · {UNIVERSES.find(u=>u.id===universe)?.label}</h2><p>Un único sistema de visualización para todas las categorías.</p></div></div>
 {tab==='ranking'&&<Rankings items={profiles} rows={visibleRows} selected={selected} month={currentPeriod} network={network} category={category}/>}
 {tab==='lectura'&&<Reading items={profiles} rows={visibleRows} selected={selected} network={network} range={[Math.min(from,to),Math.max(from,to)]}/>}
 {tab==='evolutivo'&&<Evolution items={profiles} rows={visibleRows} selected={selected} network={network} range={[Math.min(from,to),Math.max(from,to)]}/>}
 {tab==='comparacion'&&<Comparison items={profiles} rows={visibleRows} selected={selected} network={network} range={[Math.min(from,to),Math.max(from,to)]}/>}
 <footer className="footer">Fuente: CSV históricos de Gobernadores y consolidado de nuevas entidades. Los valores no disponibles se muestran como s/d. TT y TK se mantienen separados hasta validación.</footer>
 </main></div>;
}
