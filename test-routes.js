const http = require('http');

const urls = [
  '/en',
  '/ar',
  '/fr',
  '/en/quote',
  '/ar/quote',
  '/fr/quote',
  '/en/visa',
  '/ar/visa',
  '/fr/visa',
  '/en/hotels',
  '/ar/hotels',
  '/fr/hotels',
  '/en/flights',
  '/ar/flights',
  '/fr/flights',
  '/en/cars',
  '/ar/cars',
  '/fr/cars',
  '/en/real-estate',
  '/ar/real-estate',
  '/fr/real-estate',
  '/en/reviews',
  '/ar/reviews',
  '/fr/reviews',
  '/en/contact',
  '/ar/contact',
  '/fr/contact',
  '/en/admin',
  '/en/admin/login',
  '/en/admin/quotes',
  '/en/admin/reviews',
  '/en/admin/properties',
  '/robots.txt',
  '/sitemap.xml',
];

async function checkUrl(path) {
  return new Promise((resolve) => {
    http.get({ host: 'localhost', port: 3000, path }, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        resolve({
          path,
          status: res.statusCode,
          dir: body.includes('dir="rtl"') ? 'RTL' : (body.includes('dir="ltr"') ? 'LTR' : 'N/A'),
          hasLogo: body.includes('logo.jpeg'),
          length: body.length,
        });
      });
    }).on('error', (err) => {
      resolve({ path, status: err.message });
    });
  });
}

async function testApiPost(path, data) {
  return new Promise((resolve) => {
    const postData = JSON.stringify(data);
    const req = http.request({
      host: 'localhost',
      port: 3000,
      path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
      },
    }, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        resolve({ path, status: res.statusCode, response: body });
      });
    });
    req.on('error', (err) => resolve({ path, status: err.message }));
    req.write(postData);
    req.end();
  });
}

async function run() {
  console.log('--- Testing Page Routes ---');
  for (const u of urls) {
    const res = await checkUrl(u);
    console.log(`${res.path.padEnd(25)} => Status: ${res.status} | Direction: ${res.dir} | Logo: ${res.hasLogo} | Bytes: ${res.length}`);
  }

  console.log('\n--- Testing API Endpoints ---');
  const quoteRes = await testApiPost('/api/quotes', {
    fullName: 'Test Customer',
    country: 'United Arab Emirates',
    phone: '+971543770253',
    email: 'test@aymendubaitourisme.com',
    service: 'visa',
    subService: '1-month',
  });
  console.log('/api/quotes => Status:', quoteRes.status, quoteRes.response);

  const reviewRes = await testApiPost('/api/reviews', {
    name: 'Sarah Connor',
    country: 'United Kingdom',
    rating: 5,
    review: 'Outstanding VIP tourism experience in Dubai!',
  });
  console.log('/api/reviews => Status:', reviewRes.status, reviewRes.response);

  const contactRes = await testApiPost('/api/contact', {
    name: 'David Miller',
    email: 'david@example.com',
    message: 'Hello, looking for a luxury villa rental in Palm Jumeirah.',
  });
  console.log('/api/contact => Status:', contactRes.status, contactRes.response);
}

run();
