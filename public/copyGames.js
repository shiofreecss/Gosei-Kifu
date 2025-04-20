// Simple script to copy games directory to public folder
const fs = require('fs-extra');
const path = require('path');

// The games are inside the ai-kifu directory in our case
const sourceDir = path.join(__dirname, '..', 'games');
const targetDir = path.join(__dirname, 'games');

console.log(`Checking games directory...`);

// Check if source directory exists
if (!fs.existsSync(sourceDir)) {
  console.error(`Source directory ${sourceDir} does not exist!`);
  // Create a sample data structure for testing
  console.log('Creating sample games directory structure...');
  
  fs.mkdirSync(targetDir, { recursive: true });
  
  // Create a simple structure for testing
  const honinboDir = path.join(targetDir, 'Honinbo');
  const titleDir = path.join(honinboDir, 'Title');
  fs.mkdirSync(titleDir, { recursive: true });
  
  // Create a sample index.html
  const indexContent = `<!DOCTYPE HTML>
<html>
<head>
<title>Honinbo title games</title>
</head>
<body>
<H1>Honinbo title games</H1>
<table>
<tr>
<TH>Nr</TH><TH>Year</TH><TH>Winner</TH><TH>Opponent</TH>
<TH>Score</TH><TH>Games</TH>
</tr>
<tr>
<td>1</td><td>1941</td>
<td>Sekiyama Riichi</td>
<td>Kato Shin</td>
<td>3-3</td><td>
<a href="Title/Hon-1941-1.sgf">1</a>
</td></tr>
</table>
</body>
</html>`;
  fs.writeFileSync(path.join(honinboDir, 'index.html'), indexContent);
  
  // Create a sample SGF file
  const sgfContent = `(;
EV[1st Honinbo Title]
RO[1]
PB[Kato Shin]
BR[7p]
PW[Sekiyama Riichi]
WR[6p]
TM[13h]
KM[0]
RE[B+R]
DT[1941-02-04]

;B[pd];W[dc];B[pp];W[fp];B[de];W[ee];B[ef];W[ed];B[dg];W[co]
;B[cc];W[cd];B[dd];W[ce];B[df];W[bc];B[ec];W[cb];B[db];W[cc]
;B[fd];W[po];B[op];W[qp];B[qq];W[qo];B[fe];W[rq];B[pr];W[qr]
;B[pq];W[rr];B[lq];W[nd];B[ld];W[pg];B[oe];W[le];B[ke];W[me]
;B[kd];W[ng];B[qe];W[oc];B[pc];W[lg];B[rg];W[jq];B[nn];W[eq]
;B[kh];W[kg];B[jg];W[lh];B[ki];W[dk];B[li];W[fk];B[kf];W[nh]
;B[jp];W[ip];B[jo];W[kq];B[lp];W[qh];B[rh];W[qj];B[cn];W[bo]
;B[fm];W[en];B[dl];W[cl];B[ck];W[el];B[dm];W[em];B[dj];W[ek]
;B[bl];W[cj];B[bk];W[bj];B[bn];W[di];B[an];W[dn];B[cm];W[lr]
;B[mr];W[gi];B[iq];W[hq];B[ir];W[hr];B[io];W[hp];B[hh];W[ob]
;B[qb];W[mb];B[kb];W[gh];B[hg];W[ao];B[pm];W[ok];B[ol];W[nk]
;B[rn];W[ro];B[ri];W[mi];B[qi];W[pi];B[qk];W[pk];B[rj];W[ql]
;B[pj];W[qm];B[rl];W[oj];B[eb];W[bg];B[hm];W[qj];B[rk];W[mm]
;B[nm];W[ml];B[ks];W[kr];B[ls];W[is];B[kp];W[jr];B[pl];W[qn]
;B[rm];W[sn];B[ij];W[mn];B[mo];W[ps];B[os];W[qs];B[nq];W[lb]
;B[ka];W[lj];B[kj];W[lk];B[pf];W[kk];B[lc])`;
  fs.writeFileSync(path.join(titleDir, 'Hon-1941-1.sgf'), sgfContent);
  
  console.log('Sample games structure created successfully!');
  return;
}

// Function to check if we need to copy files
async function shouldCopyFiles() {
  // If target directory doesn't exist, we need to copy
  if (!await fs.pathExists(targetDir)) {
    return true;
  }

  // Get timestamp of source and destination directory
  try {
    const sourceStats = await fs.stat(sourceDir);
    const targetStats = await fs.stat(targetDir);
    
    // If source directory was modified after target directory, copy is needed
    if (sourceStats.mtime > targetStats.mtime) {
      return true;
    }
    
    // Check if there's a marker file with a timestamp
    const markerFile = path.join(targetDir, '.last-copy');
    if (!await fs.pathExists(markerFile)) {
      return true;
    }
    
    const markerContent = await fs.readFile(markerFile, 'utf8');
    const lastCopyTime = new Date(markerContent.trim());
    
    // If marker file timestamp is older than source directory, copy is needed
    if (isNaN(lastCopyTime.getTime()) || sourceStats.mtime > lastCopyTime) {
      return true;
    }
    
    return false;
  } catch (error) {
    // In case of any error, be safe and copy files
    console.warn('Error checking directory stats:', error);
    return true;
  }
}

async function copyGamesIfNeeded() {
  const needsCopy = await shouldCopyFiles();
  
  if (!needsCopy) {
    console.log('Games folder is up to date, skipping copy.');
    return;
  }
  
  console.log(`Copying games from ${sourceDir} to ${targetDir}`);
  
  // Ensure target directory exists
  await fs.ensureDir(targetDir);

  try {
    // Copy the games directory
    await fs.copy(sourceDir, targetDir, { 
      overwrite: true,
      errorOnExist: false,
      dereference: true,
      preserveTimestamps: true 
    });
    
    // Create or update the marker file with current timestamp
    await fs.writeFile(path.join(targetDir, '.last-copy'), new Date().toISOString());
    
    console.log('Games folder copied successfully!');
  } catch (err) {
    console.error('Error copying games folder:', err);
  }
}

// Execute the copy function
copyGamesIfNeeded(); 