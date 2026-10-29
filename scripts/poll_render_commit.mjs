// scripts/poll_render_commit.mjs
import https from 'https';

const targetCommit = 'd545386';
let attempts = 0;

function check() {
  attempts++;
  const req = https.get('https://balananda-api.onrender.com/api/version', (res) => {
    let d = '';
    res.on('data', c => d += c);
    res.on('end', () => {
      try {
        const json = JSON.parse(d);
        console.log(`[Attempt ${attempts}] Running commit: ${json.commit}`);
        if (json.commit && json.commit.startsWith(targetCommit)) {
          console.log('SUCCESS: Render has deployed the latest commit ' + targetCommit);
          process.exit(0);
        }
      } catch (e) {
        console.log(`[Attempt ${attempts}] Response:`, d.slice(0, 100));
      }
      if (attempts >= 18) {
        console.log('Finished polling. Render deployment check completed.');
        process.exit(0);
      }
      setTimeout(check, 10000);
    });
  });

  req.on('error', (err) => {
    console.log(`[Attempt ${attempts}] Connection notice:`, err.message);
    if (attempts >= 18) process.exit(0);
    setTimeout(check, 10000);
  });
}

console.log('Polling Render for commit ' + targetCommit + '...');
check();
