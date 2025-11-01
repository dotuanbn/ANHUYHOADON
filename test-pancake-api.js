// Test script để tìm Base URL và authentication method đúng cho Pancake POS API
// Chạy trong browser console hoặc Node.js với fetch

const API_KEY = 'c35fe62e0ea24b3580d9910a1a6c3525';
const STORE_ID = '100053861';

// Các Base URL có thể có
const BASE_URLS = [
  'https://api.pancake.vn/v1',
  'https://api.pancake.vn',
  'https://pos.pancake.vn/api/v1',
  'https://pos.pancake.vn/api',
  'https://pos.pancake.vn/v1',
  'https://api.pancake.vn/api/v1',
  'https://api.pancake.vn/api',
  'https://openapi.pancake.vn/v1',
  'https://openapi.pancake.vn',
];

// Các endpoint có thể có
const ENDPOINTS = [
  '/products',
  '/orders',
  '/stores',
  '/auth/test',
  '/auth/verify',
  '/ping',
  '/health',
  '/api/products',
  '/api/orders',
];

// Các phương thức authentication
const AUTH_METHODS = [
  {
    name: 'Bearer Token',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    }
  },
  {
    name: 'API Key Header',
    headers: {
      'X-API-Key': API_KEY,
      'Content-Type': 'application/json',
    }
  },
  {
    name: 'API Key + Secret',
    headers: {
      'X-API-Key': API_KEY,
      'X-API-Secret': API_KEY,
      'Content-Type': 'application/json',
    }
  },
  {
    name: 'API Key + Store ID',
    headers: {
      'X-API-Key': API_KEY,
      'X-Store-ID': STORE_ID,
      'Content-Type': 'application/json',
    }
  },
  {
    name: 'Bearer + Store ID',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'X-Store-ID': STORE_ID,
      'Content-Type': 'application/json',
    }
  },
  {
    name: 'API Key Query',
    headers: {
      'Content-Type': 'application/json',
    },
    query: `?api_key=${API_KEY}`
  },
  {
    name: 'API Key Query + Store ID',
    headers: {
      'Content-Type': 'application/json',
    },
    query: `?api_key=${API_KEY}&store_id=${STORE_ID}`
  },
];

async function testConnection(baseUrl, endpoint, authMethod) {
  const url = baseUrl + endpoint + (authMethod.query || '');
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: authMethod.headers,
      mode: 'cors',
    });

    const status = response.status;
    const statusText = response.statusText;
    
    let data = null;
    try {
      data = await response.json();
    } catch {
      data = await response.text();
    }

    return {
      success: status >= 200 && status < 300,
      status,
      statusText,
      data,
      error: null,
    };
  } catch (error) {
    return {
      success: false,
      status: null,
      statusText: null,
      data: null,
      error: error.message,
    };
  }
}

async function runAllTests() {
  console.log('🧪 Bắt đầu test Pancake POS API...\n');
  console.log(`API Key: ${API_KEY.substring(0, 10)}...`);
  console.log(`Store ID: ${STORE_ID}\n`);

  const results = [];

  for (const baseUrl of BASE_URLS) {
    for (const endpoint of ENDPOINTS) {
      for (const authMethod of AUTH_METHODS) {
        console.log(`Testing: ${baseUrl}${endpoint} - ${authMethod.name}`);
        
        const result = await testConnection(baseUrl, endpoint, authMethod);
        
        if (result.success || (result.status && result.status !== 404)) {
          results.push({
            baseUrl,
            endpoint,
            authMethod: authMethod.name,
            ...result,
          });
          
          if (result.success) {
            console.log(`✅ THÀNH CÔNG!`);
            console.log(`   Status: ${result.status}`);
            console.log(`   Data:`, result.data);
          } else {
            console.log(`   Status: ${result.status} - ${result.statusText}`);
          }
        }
        
        // Delay để tránh rate limit
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
  }

  console.log('\n📊 KẾT QUẢ:\n');
  
  const successful = results.filter(r => r.success);
  if (successful.length > 0) {
    console.log('✅ CÁC KẾT NỐI THÀNH CÔNG:');
    successful.forEach(r => {
      console.log(`\n   Base URL: ${r.baseUrl}`);
      console.log(`   Endpoint: ${r.endpoint}`);
      console.log(`   Auth Method: ${r.authMethod}`);
      console.log(`   Status: ${r.status}`);
    });
  } else {
    console.log('⚠️ Không tìm thấy kết nối thành công.');
    console.log('\n📋 CÁC KẾT QUẢ KHÁC (có response từ server):');
    results.slice(0, 10).forEach(r => {
      console.log(`\n   ${r.baseUrl}${r.endpoint}`);
      console.log(`   Auth: ${r.authMethod}`);
      console.log(`   Status: ${r.status} - ${r.error || r.statusText}`);
    });
  }

  return results;
}

// Chạy test nếu đang ở browser
if (typeof window !== 'undefined') {
  runAllTests().then(results => {
    window.pancakeTestResults = results;
    console.log('\n✅ Kết quả đã được lưu vào window.pancakeTestResults');
  });
}

// Export cho Node.js
if (typeof module !== 'undefined') {
  module.exports = { runAllTests, BASE_URLS, ENDPOINTS, AUTH_METHODS };
}

