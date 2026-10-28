// Check live frontend bundle
async function checkFrontend() {
  const bundleUrl = 'https://balananda-vaidik-sewa.web.app/assets/index-D2z_AuSu.js';
  console.log('Fetching live bundle from:', bundleUrl);
  const jsRes = await fetch(bundleUrl);
  console.log('Bundle fetch status:', jsRes.status);
  const jsText = await jsRes.text();
  console.log('Bundle size:', jsText.length, 'bytes');
  console.log('Bundle contains "normal_yearly":', jsText.includes('normal_yearly'));
  console.log('Bundle contains "normal_lifetime":', jsText.includes('normal_lifetime'));
  console.log('Bundle contains "pro_yearly":', jsText.includes('pro_yearly'));
  console.log('Bundle contains "pro_lifetime":', jsText.includes('pro_lifetime'));
  console.log('Bundle contains "४८ घण्टा" / "४८ घण्टे":', jsText.includes('४८ घण्टा') || jsText.includes('४८ घण्टे'));
  console.log('Bundle contains "एकल-उपकरण" (Single-Device):', jsText.includes('एकल-उपकरण') || jsText.includes('Single-Device'));
  console.log('Bundle contains NPR 2,000 ("२,०००"):', jsText.includes('२,०००'));
  console.log('Bundle contains NPR 5,000 ("५,०००"):', jsText.includes('५,०००'));
  console.log('Bundle contains NPR 100 ("१००"):', jsText.includes('१००'));
  console.log('Bundle contains NPR 500 ("५००"):', jsText.includes('५००'));
}

checkFrontend();
