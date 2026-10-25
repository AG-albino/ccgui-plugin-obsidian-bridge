import {mkdirSync,readFileSync,writeFileSync,copyFileSync,cpSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {createZip} from './zip.mjs';
const root=new URL('../',import.meta.url);
const dist=new URL('dist/',root);
mkdirSync(dist,{recursive:true});
cpSync(new URL('docs/',root),new URL('docs/',dist),{recursive:true});
const files=['main.js','manifest.json','styles.css','README.md','LICENSE',
  ...readdirSync(new URL('docs/',root)).map(name=>'docs/'+name)].sort();
const sums=[];
for(const name of files){
  const source=new URL(name,root);
  if(!name.startsWith('docs/'))copyFileSync(source,new URL(name,dist));
  sums.push(`${createHash('sha256').update(readFileSync(source)).digest('hex')}  ${name}`);
}
writeFileSync(new URL('checksums.txt',dist),sums.join('\n')+'\n');
const version=JSON.parse(readFileSync(new URL('manifest.json',root),'utf8')).version;
const zipName=`obsidian-bridge-${version}.zip`;
const zip=createZip([...files,'checksums.txt'].map(name=>({name,data:readFileSync(new URL(name,dist))})));
writeFileSync(new URL(zipName,dist),zip);
writeFileSync(new URL('checksums.txt',dist),sums.join('\n')+'\n'+createHash('sha256').update(zip).digest('hex')+'  '+zipName+'\n');
console.log('Built installable folder, deterministic ZIP, runtime assets and SHA-256 checksums.');
