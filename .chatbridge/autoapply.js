const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const PENDING = path.resolve(__dirname, 'pending.patch');
const LAST = path.resolve(__dirname, 'last_command.json');
const LOG = path.resolve(__dirname, 'autoapply.log');

function log(msg){
  const line = `[${new Date().toISOString()}] ${msg}\n`;
  fs.appendFileSync(LOG, line);
  console.log(msg);
}

function containsSecrets(text){
  const patterns = [/API[_-]?KEY/i, /SECRET/i, /PASSWORD/i, /PRIVATE[_-]?KEY/i, /-----BEGIN PRIVATE KEY-----/i, /TOKEN/i];
  return patterns.some(r => r.test(text));
}

try{
  if(!fs.existsSync(PENDING)){
    log('No pending.patch found; aborting autoapply.');
    process.exit(0);
  }
  const patch = fs.readFileSync(PENDING,'utf8');
  if(!patch.trim()){
    log('Empty patch; aborting.');
    process.exit(1);
  }
  if(containsSecrets(patch)){
    log('Patch appears to contain secrets — aborting autoapply.');
    process.exit(2);
  }
  const lines = patch.split(/\r?\n/).length;
  if(lines > 5000){
    log('Patch too large (>5000 lines) — aborting.');
    process.exit(3);
  }

  // Determine current branch
  let branch = execSync('git rev-parse --abbrev-ref HEAD', { cwd: ROOT }).toString().trim();
  if(branch === 'main' || branch === 'master'){
    const dt = new Date();
    const name = `autoapply/${dt.toISOString().replace(/[:.]/g,'-')}`;
    execSync(`git checkout -b ${name}`, { cwd: ROOT });
    branch = name;
    log(`Created branch ${branch}`);
  }

  // Try to apply patch
  try{
    fs.writeFileSync(path.resolve(ROOT, 'pending.apply.patch'), patch);
    execSync(`git apply --index pending.apply.patch`, { cwd: ROOT });
  }catch(e){
    log('git apply failed: ' + e.message);
    process.exit(4);
  }

  // Commit with message
  let summary = 'Aplicar parche automático';
  if(fs.existsSync(LAST)){
    try{ const last = JSON.parse(fs.readFileSync(LAST,'utf8')); if(last && last.summary) summary += ': ' + last.summary.slice(0,80); }catch(e){}
  }
  try{
    execSync(`git add -A`, { cwd: ROOT });
    execSync(`git commit -m "${summary.replace(/\"/g,'') }"`, { cwd: ROOT });
    execSync(`git push origin ${branch}`, { cwd: ROOT });
    log(`Patch applied, committed and pushed to ${branch}`);
    // Try to create a PR using gh CLI if available
    try{
      execSync('gh --version', { stdio: 'ignore' });
      const safeTitle = summary.replace(/\"/g, "'").slice(0,240);
      const prOutput = execSync(`gh pr create --title "${safeTitle}" --body "Parche autoaplicado y commit generado automáticamente." --base main --head ${branch} --draft`, { cwd: ROOT });
      const prUrl = prOutput.toString().trim();
      log(`PR created: ${prUrl}`);
    }catch(e){
      // gh not available or failed — provide manual URL
      try{
        const remote = execSync('git remote get-url origin', { cwd: ROOT }).toString().trim();
        let repoPath = remote;
        if(remote.startsWith('git@')) repoPath = remote.split(':')[1].replace(/\.git$/,'');
        else repoPath = repoPath.replace(/https:\/\/github.com\//,'').replace(/\.git$/,'');
        log('gh CLI not available or PR creation failed: ' + e.message);
        log(`To create PR manually: https://github.com/${repoPath}/pull/new/${branch}`);
      }catch(err){
        log('Unable to construct manual PR URL: ' + err.message);
      }
    }
    // cleanup
    fs.unlinkSync(path.resolve(ROOT, 'pending.apply.patch'));
    fs.unlinkSync(PENDING);
  }catch(e){
    log('Commit or push failed: ' + e.message);
    process.exit(5);
  }

  process.exit(0);
}catch(e){ log('Unhandled error: ' + e.message); process.exit(99); }
