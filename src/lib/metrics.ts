import Papa from 'papaparse';
import {CATEGORY_UNIVERSE, type Universe} from './catalog';
export type Metric = 'Fans'|'Publicaciones'|'Reacciones'|'Interacciones'|'Comentarios'|'Visualizaciones'|'Crecimiento seguidores';
export type Observation = {year:number; month:number; network:string; category:string; entity:string; metric:Metric; value:number; province:string; universe:Universe};
export type Identity = {category:string; entity:string; province:string; id:string};
export const METRICS:Metric[]=['Fans','Publicaciones','Reacciones','Interacciones','Comentarios','Visualizaciones','Crecimiento seguidores'];
export const FLOWS = new Set<Metric>(['Publicaciones','Reacciones','Interacciones','Comentarios','Visualizaciones','Crecimiento seguidores']);
export const NETWORKS = ['FB','IG','TW','TIK TOK','TT','TK','X','YT'];
export const metricLabels:Record<Metric,string>={Fans:'Seguidores',Publicaciones:'Publicaciones',Reacciones:'Reacciones',Interacciones:'Interacciones',Comentarios:'Comentarios',Visualizaciones:'Visualizaciones','Crecimiento seguidores':'Crecimiento seguidores'};
export const key=(category:string, entity:string)=>`${category}\u001f${entity}`;
export const period=(r:Pick<Observation,'year'|'month'>)=>r.year*100+r.month;
const asNumber=(s:string)=>Number((s||'').trim().replace(/\./g,'').replace(',','.'));
const parseRows=(source:string, required:string[])=>{
  const p=Papa.parse<Record<string,string>>(source.replace(/^\uFEFF/,''), {header:true,delimiter:';',skipEmptyLines:true});
  if(p.errors.length)throw new Error(`CSV: ${p.errors[0].message}`);
  if(required.some(col=>!p.meta.fields?.includes(col)))throw new Error(`Columnas requeridas ausentes: ${required.filter(x=>!p.meta.fields?.includes(x)).join(', ')}`);
  return p.data;
};
function normalizedMetric(name:string):Metric|null {
  const m=name.trim();
  if(m==='Crecimiento de seguidores')return 'Crecimiento seguidores';
  return (METRICS as string[]).includes(m) ? m as Metric : null;
}
/** Preserva TT y TK separados hasta confirmar equivalencia metodológica. */
export function parseNew(csv:string):Observation[] {
  const rows=parseRows(csv,['Año','Mes_num','Red','Entidad','Métrica','Valor','Provincia','Categoría']);
  return rows.flatMap(r=>{
    const category=r['Categoría']?.trim(), entity=r.Entidad?.trim(),metric=normalizedMetric(r['Métrica']||'');
    const year=Number(r['Año']),month=Number(r.Mes_num),value=asNumber(r.Valor||'');
    if(!category||!entity||!metric||!CATEGORY_UNIVERSE[category]||!r.Red||!Number.isInteger(year)||!Number.isInteger(month)||month<1||month>12||!Number.isFinite(value))return [];
    return [{year,month,network:r.Red.trim(),entity,category,metric,value,province:(r.Provincia||'').trim(),universe:CATEGORY_UNIVERSE[category]}];
  });
}
export function parseGovernors(csv:string):Observation[] {
  const rows=parseRows(csv,['año','mes_n','RRSS','Gobernador','Atributo','Valor','Provincia','tipo']);
  return rows.flatMap(r=>{
    const category=r.tipo?.trim(), entity=r.Gobernador?.trim(), metric=normalizedMetric(r.Atributo||'');
    const year=Number(r.año),month=Number(r.mes_n),value=asNumber(r.Valor||'');
    if(!category||!entity||!metric||!r.RRSS||!Number.isInteger(year)||!Number.isInteger(month)||month<1||month>12||!Number.isFinite(value))return [];
    return [{year,month,network:r.RRSS.trim(),entity,category,metric,value,province:(r.Provincia||'').trim(),universe:'gobernadores' as Universe}];
  });
}
export async function loadData():Promise<Observation[]> {
  const [a,b]=await Promise.all(['data.csv','mega_metricas.csv'].map(async name=>{
    const response=await fetch(`${import.meta.env.BASE_URL}${name}`);
    if(!response.ok)throw new Error(`No se pudo leer ${name}: ${response.status}`);
    return response.text();
  }));
  return [...parseGovernors(a),...parseNew(b)];
}
export function identities(rows:Observation[]):Identity[] {
  const byId=new Map<string,Identity>();
  for(const r of rows){const id=key(r.category,r.entity);if(!byId.has(id))byId.set(id,{id,category:r.category,entity:r.entity,province:r.province});}
  return [...byId.values()].sort((a,b)=>a.entity.localeCompare(b.entity,'es'));
}
/** El valor mensual es explícito. No se imputan faltantes ni se convierten ausencias en cero. */
export function monthValue(rows:Observation[],metric:Metric):number|undefined {
  const matches=rows.filter(x=>x.metric===metric);
  if(!matches.length)return undefined;
  // Un único punto por entidad/red/mes/métrica es el contrato. Duplicados se reportan en las pruebas.
  return matches.reduce((sum,row)=>sum+row.value,0);
}
export function intervalValue(rows:Observation[],metric:Metric):number|undefined {
  const relevant=rows.filter(x=>x.metric===metric).sort((a,b)=>period(a)-period(b));
  if(!relevant.length)return undefined;
  if(metric==='Fans')return relevant[relevant.length-1].value;
  return relevant.reduce((s,x)=>s+x.value,0);
}
export function pairRatio(n?:number,d?:number):number|undefined{return n===undefined||d===undefined||d===0?undefined:n/d;}
export const formatValue=(n?:number,decimals=0)=>n===undefined?'s/d':new Intl.NumberFormat('es-AR',{maximumFractionDigits:decimals}).format(n);
export const monthLabel=(id:number)=>new Intl.DateTimeFormat('es-AR',{month:'short',year:'numeric'}).format(new Date(Math.floor(id/100),id%100-1,1));
