#!/usr/bin/env node
// Contrôle hors exécution navigateur : référence normative unique ia/ sur main.
// Lancez ce test depuis le dépôt Ariane complet avec npm run check:referentiel.
import {readFileSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';

const app=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const root=resolve(app,'../..');
const norm=path=>readFileSync(resolve(root,path),'utf8');
const snapshot=path=>JSON.parse(readFileSync(resolve(app,'src/referentiel',path),'utf8'));
const gitBlob=content=>{
  const buf=Buffer.from(content,'utf8');
  return createHash('sha1').update(Buffer.from('blob '+buf.length+'\\0')).update(buf).digest('hex');
};
const verifyHash=(path,expected)=>{
  const actual=gitBlob(norm(path));
  assert.equal(actual,expected,'Empreinte différente : '+path);
};
const metadata=snapshot('metadata.json');
const manifest=norm('ia/manifest.yaml');
const version=/^version:\s*"([^"]+)"/m.exec(manifest)?.[1];
assert.equal(metadata.ariane_version,version,'Version de manifeste incorrecte');
assert.equal(norm('VERSION').trim(),version,'Version racine différente du manifeste');
assert.equal(metadata.source_branch,'main','La source normative doit rester main');
verifyHash('ia/manifest.yaml',metadata.source_manifest_blob_sha);
verifyHash('ia/referentiel/objets-patrimoniaux.yaml',metadata.source_objects_blob_sha);
verifyHash('ia/referentiel/attributs/index.yaml',metadata.source_attribute_index_blob_sha);
for(const [path,sha] of Object.entries(metadata.source_attribute_catalog_blob_shas))verifyHash(path,sha);

const objectsYaml=norm('ia/referentiel/objets-patrimoniaux.yaml');
const objects={};
let inObjects=false,last=null;
for(const line of objectsYaml.split(/\r?\n/)){
  if(line==='objects:'){inObjects=true;continue}
  if(inObjects&&/^[a-z_]+:/.test(line))break;
  if(!inObjects)continue;
  const match=/^  ([A-Z]{3}):\s*$/.exec(line);
  if(match){last=match[1];objects[last]={label:last,allowed_parents:[]};continue}
  if(!last)continue;
  const label=/^    label:\s*"(.*)"\s*$/.exec(line);
  if(label)objects[last].label=label[1];
  const parents=/^    allowed_parents:\s*\[([^\]]*)\]/.exec(line);
  if(parents)objects[last].allowed_parents=parents[1].split(',').map(x=>x.trim()).filter(Boolean);
}
assert.deepEqual(snapshot('objets-patrimoniaux.json').objects,objects,'Divergence des types ou parents autorisés');

const attrSnapshot=snapshot('attributs-patrimoniaux.json');
const index=norm('ia/referentiel/attributs/index.yaml');
const declared=Number(/^canonical_attribute_count:\s*(\d+)/m.exec(index)?.[1]);
const files=[...index.matchAll(/^\s*-\s+path:\s*"([^"]+)"/gm)].map(m=>m[1]);
const attributes=[];
for(const path of files){
  const text=norm(path);
  const group=/^group:\s*"([^"]+)"/m.exec(text)?.[1]||null;
  let current=null;
  const push=()=>{if(current)attributes.push(current)};
  for(const line of text.split(/\r?\n/)){
    const head=/^  ([a-z0-9_]+):\s*$/.exec(line);
    if(head){push();current={attributeId:head[1],label:head[1],objects:[],dataType:null,unit:null,family:null,catalogGroup:group};continue}
    if(!current)continue;
    const field=/^    ([a-z_]+):\s*(.*)$/.exec(line);
    if(!field)continue;
    const clean=field[2].trim().replace(/^"(.*)"$/,'$1');
    if(field[1]==='label')current.label=clean;
    if(field[1]==='objects')current.objects=[...clean.matchAll(/[A-Z][A-Z0-9_]*/g)].map(x=>x[0]);
    if(field[1]==='data_type')current.dataType=clean||null;
    if(field[1]==='unit')current.unit=clean||null;
    if(field[1]==='family'||field[1]==='famille')current.family=clean||null;
  }
  push();
}
const canonical=[...new Map(attributes.map(x=>[x.attributeId,x])).values()].sort((a,b)=>a.attributeId.localeCompare(b.attributeId,'fr'));
assert.equal(canonical.length,declared,'Nombre d’attributs canoniques incohérent');
assert.deepEqual(attrSnapshot.attributes,canonical,'Divergence du catalogue d’attributs embarqué');
assert.equal(attrSnapshot.declaredCount,declared);
const relations=snapshot('regles-rattachement.json');
assert.ok(relations.structure_changes_require_explicit_human_approval,'La validation humaine ne peut pas être désactivée');
assert.ok(relations.forbid_implicit_cascading_removal,'La suppression implicite en cascade est interdite');
for(const type of relations.circulation_physique_prioritaire.applies_to){
  assert.ok(objects[type]?.allowed_parents.includes('CIR'),'Règle CIR incohérente : '+type);
}
console.info('Conformité IA/application V2 : OK — version '+version+', '+Object.keys(objects).length+' types, '+canonical.length+' attributs. Aucune requête réseau.');
