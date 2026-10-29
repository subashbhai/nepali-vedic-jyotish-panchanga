import https from 'https';

async function fetchJson(url) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const req = https.request({
      hostname: u.hostname,
      path: u.pathname + u.search,
      method: 'GET',
      headers: {
        'Cache-Control': 'no-cache, no-store, max-age=0, must-revalidate',
        'Pragma': 'no-cache',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) UncachedProbe/1.0'
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, headers: res.headers, data: json });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, raw: data });
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function run() {
  console.log('Running 5 uncached probes to https://balananda-api.onrender.com...\n');
  for (let i = 1; i <= 5; i++) {
    const bust = Date.now() + '_' + i;
    const vRes = await fetchJson(`https://balananda-api.onrender.com/api/version?_cb=${bust}`);
    const hRes = await fetchJson(`https://balananda-api.onrender.com/api/health?_cb=${bust}`);
    
    console.log(`[Probe #${i}]`);
    console.log('  /api/version -> Status:', vRes.status, 'Commit:', vRes.data?.commit, 'Time:', vRes.data?.serverTimeISO);
    console.log('                 Date Header:', vRes.headers['date'], 'CF-Ray:', vRes.headers['cf-ray']);
    console.log('  /api/health  -> Status:', hRes.status, 'Commit:', hRes.data?.commit, 'Time:', hRes.data?.serverTimeISO);
    console.log('                 Sessions:', hRes.data?.database?.tableCounts?.active_sessions, 'Users:', hRes.data?.database?.tableCounts?.users);
    console.log('                 Date Header:', hRes.headers['date'], 'CF-Ray:', hRes.headers['cf-ray']);
    console.log('--------------------------------------------------');
    await new Promise(r => setTimeout(r, 1000));
  }
}

run().catch(console.error);
