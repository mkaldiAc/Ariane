import objectCatalogue from '../referentiel/objets-patrimoniaux.json';
import attributionRules from '../referentiel/regles-rattachement.json';
import type {PatrimonialObject} from '../services/captureDataService';

/**
 * Dépendances dérivées du référentiel IA, embarquées lors d'une livraison contrôlée.
 * Tout refus est fail-closed : un type absent du référentiel n'est jamais autorisé.
 */
export type StructureChangeOperation='AJOUT'|'RETRAIT'|'MODIFIER_PARENT'|'REINTEGRATION';
export type StructureChange={
  operation:StructureChangeOperation;
  object_id:string;
  from_parent_object_id?:string|null;
  to_parent_object_id?:string|null;
  justification?:string;
  source_proposal_ids?:string[];
};

export type StructureIssue={objectId:string;message:string};
type ObjectRules={label:string;allowed_parents:string[]};
const types:Record<string,ObjectRules>=objectCatalogue.objects as Record<string,ObjectRules>;

export const allowedParentTypes=(childType:string):string[]=>types[childType]?.allowed_parents||[];
export const normativeObjectTypes=Object.keys(types);

export const validateParent=(child:PatrimonialObject,parent:PatrimonialObject|null):string|null=>{
  const rule=types[child.object_type];
  if(!rule)return `Type d'objet interdit ou inconnu : ${child.object_type}`;
  if(!parent){
    return rule.allowed_parents.length===0&&child.object_type==='PRG'
      ?null
      :`Parent obligatoire pour ${child.object_type}`;
  }
  if(!types[parent.object_type])return `Type de parent inconnu : ${parent.object_type}`;
  if(!rule.allowed_parents.includes(parent.object_type))
    return `Rattachement interdit : ${child.object_type} ne peut pas dépendre de ${parent.object_type} (autorisés : ${rule.allowed_parents.join(', ')||'aucun'})`;
  return null;
};

export const validateStructure=(objects:PatrimonialObject[]):StructureIssue[]=>{
  const issues:StructureIssue[]=[];
  const byId=new Map<string,PatrimonialObject>();
  for(const object of objects){
    if(byId.has(object.object_id))issues.push({objectId:object.object_id,message:'Identifiant d’objet dupliqué'});
    byId.set(object.object_id,object);
  }
  const roots=objects.filter(object=>!object.parent_object_id);
  if(roots.length!==1||roots[0]?.object_type!=='PRG')
    issues.push({objectId:'PRG',message:'La structure doit posséder exactement une racine de type PRG'});
  for(const object of objects){
    const parent=object.parent_object_id?byId.get(object.parent_object_id)||null:null;
    if(object.parent_object_id&&!parent)
      issues.push({objectId:object.object_id,message:`Parent absent : ${object.parent_object_id}`});
    const error=validateParent(object,parent);
    if(error)issues.push({objectId:object.object_id,message:error});
    if(object.parent_object_id===object.object_id)
      issues.push({objectId:object.object_id,message:'Un objet ne peut pas être son propre parent'});
    const visited=new Set<string>([object.object_id]);
    let cursor=object;
    while(cursor.parent_object_id){
      if(visited.has(cursor.parent_object_id)){
        issues.push({objectId:object.object_id,message:'Cycle de dépendances détecté'});
        break;
      }
      visited.add(cursor.parent_object_id);
      const next=byId.get(cursor.parent_object_id);
      if(!next)break;
      cursor=next;
    }
  }
  return issues;
};

export const canReparent=(objects:PatrimonialObject[],objectId:string,parentId:string):StructureIssue[]=>{
  const object=objects.find(item=>item.object_id===objectId);
  const parent=objects.find(item=>item.object_id===parentId);
  if(!object)return [{objectId,message:'Objet inconnu'}];
  if(!parent)return [{objectId,message:'Nouveau parent absent de la structure cible'}];
  if(object.object_type==='PRG')return [{objectId,message:'La racine PRG ne peut pas changer de parent'}];
  const previous=new Set(validateStructure(objects).map(issue=>issue.objectId+'|'+issue.message));
  const proposed=objects.map(item=>item.object_id===objectId?{...item,parent_object_id:parentId}:item);
  return validateStructure(proposed).filter(issue=>!previous.has(issue.objectId+'|'+issue.message));
};

export const parentNeedsPhysicalVerification=(objectType:string,parentType:string)=>
  attributionRules.circulation_physique_prioritaire.applies_to.includes(objectType)
  &&parentType!=='CIR';

/** Interdit d'exécuter une opération sans validation humaine explicite courante. */
export const buildValidatedChanges=(humanApproved:boolean,changes:StructureChange[])=>{
  if(!humanApproved)throw new Error('Validation humaine explicite obligatoire');
  if(changes.length===0)throw new Error('Aucun changement de structure approuvé');
  return changes;
};
