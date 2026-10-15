/** Un único registro visual para todas las entidades. Para agregar imágenes, editar SOLO este archivo. */
import { GOBERNADORES_INFO } from './governors';
export type Universe = 'gobernadores' | 'dirigentes' | 'medios' | 'organismos';
export const UNIVERSES: {id:Universe; label:string; detail:string}[] = [
  {id:'gobernadores',label:'Gobernadores',detail:'Provinciales'},
  {id:'dirigentes',label:'Dirigentes',detail:'Personas públicas'},
  {id:'medios',label:'Medios',detail:'Cuentas digitales'},
  {id:'organismos',label:'Organismos',detail:'Cuentas institucionales'},
];
/** Map explícito, no se eliminan categorías ni se mezclan de forma irreversible. */
export const CATEGORY_UNIVERSE: Record<string, Universe> = {
  'Gobernador':'gobernadores', 'Gobierno':'gobernadores',
  'Intendente':'dirigentes', 'Ministro provincial':'dirigentes', 'Figuras nacionales':'dirigentes',
  'Detractor':'medios',
  'Municipio':'organismos', 'Ministerio provincial':'organismos',
};
/** Agregar rutas públicas, sin importar componentes ni modificar gráficos. */
export const ENTITY_IMAGES: Record<string,string> = {
  // 'Intendente|Armando Molina': 'imagenes/armando-molina.png',
  // 'Detractor|Cuenta de ejemplo': 'imagenes/cuenta-ejemplo.png',
};
export function imageFor(category:string, name:string):string | undefined {
  if(category === 'Gobernador' || category === 'Gobierno') return GOBERNADORES_INFO[name]?.image;
  const image = ENTITY_IMAGES[`${category}|${name}`];
  return image ? `${import.meta.env.BASE_URL}${image.replace(/^\//,'')}` : undefined;
}
export function electorateFor(category:string,name:string):number | undefined {
  if(category !== 'Gobernador' && category !== 'Gobierno') return undefined;
  return GOBERNADORES_INFO[name]?.padron;
}
export function initials(name:string){return name.trim().split(/\s+/).filter(Boolean).slice(0,2).map(x=>x[0].toLocaleUpperCase('es')).join('');}
