const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');

const INBOX = path.resolve(__dirname, 'inbox.json');
const PENDING = path.resolve(__dirname, 'pending.patch');
const LAST = path.resolve(__dirname, 'last_command.json');
const AUTOENABLED = path.resolve(__dirname, 'autoapply.enabled');
const AUTOAPPLY = path.resolve(__dirname, 'autoapply.js');

function parseForPatch(text){
  // Look for fenced patch blocks or lines starting with PATCH:
  const fenced = text.match(/```patch\n([\s\S]*?)```/i);
  if(fenced) return fenced[1].trim();
  const marker = text.indexOf('PATCH:');
  if(marker>=0) return text.slice(marker + 'PATCH:'.length).trim();
  return null;
}

function processInbox(){
  if(!fs.existsSync(INBOX)) return;
  let arr = [];
  try{ arr = JSON.parse(fs.readFileSync(INBOX,'utf8')) || []; }catch(e){ arr = []; }
  if(!arr.length) return;
  const last = arr[arr.length-1];
  const content = last.content || '';
  const patch = parseForPatch(content);
  if(patch){
    fs.writeFileSync(PENDING, patch);
    fs.writeFileSync(LAST, JSON.stringify({ id: last.id, receivedAt: last.receivedAt, summary: content.slice(0,200) }, null, 2));
    console.log('Found patch in inbox; wrote pending.patch');
    // If autoapply enabled, run autoapply script
    try{
      if(fs.existsSync(AUTOENABLED) && fs.existsSync(AUTOAPPLY)){
        console.log('Autoapply enabled — applying patch automatically.');
        const { execSync } = require('child_process');
        execSync(`node "${AUTOAPPLY}"`, { stdio: 'inherit' });
      }
    }catch(e){ console.error('Autoapply failed:', e.message); }
  }else{
    console.log('No patch found in latest inbox message.');
  }
}

console.log('Watcher started. Monitoring', INBOX);
chokidar.watch(INBOX, { persistent: true }).on('change', (p) => {
  try{ processInbox(); }catch(e){ console.error(e); }
});

// also process existing file on start
processInbox();
