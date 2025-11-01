// Vercel Serverless Function để nhận webhook từ Pancake POS
// URL: https://anhuyhoadon-g3gc.vercel.app/api/pancake-webhook

import type { VercelRequest, VercelResponse } from '@vercel/node';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key, X-Store-ID',
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).json({});
  }

  // Chỉ nhận POST requests
  if (req.method !== 'POST') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const payload = req.body;
    
    // Verify webhook signature nếu có
    // const signature = req.headers['x-pancake-signature'];
    // if (!verifySignature(payload, signature)) {
    //   return res.status(401).json({ error: 'Invalid signature' });
    // }

    // Xử lý webhook payload
    const event = payload.event || req.headers['x-pancake-event'];
    const data = payload.data || payload;

    // Log để debug
    console.log('Pancake Webhook received:', { event, data });

    // Lưu vào database hoặc xử lý
    // Ở đây bạn có thể:
    // 1. Lưu vào database (Supabase, MongoDB, etc.)
    // 2. Gửi đến frontend qua WebSocket hoặc polling
    // 3. Xử lý trực tiếp

    // Set CORS headers
    Object.entries(corsHeaders).forEach(([key, value]) => {
      res.setHeader(key, value);
    });

    // Trả về success
    return res.status(200).json({ 
      success: true, 
      message: 'Webhook received successfully',
      event,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Webhook error:', error);
    
    // Set CORS headers even on error
    Object.entries(corsHeaders).forEach(([key, value]) => {
      res.setHeader(key, value);
    });
    
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

// Function để verify webhook signature (nếu Pancake POS cung cấp)
function verifySignature(payload: any, signature: string | undefined): boolean {
  if (!signature) return false;
  // Implement signature verification logic here
  // Thường dùng HMAC SHA256 với API Secret
  return true;
}

