// Vercel Serverless Function để nhận webhook từ Pancake POS
// URL: https://anhuyhoadon-g3gc.vercel.app/api/pancake-webhook

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://gbyeednwkfmiajwzwdzc.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdieWVlZG53a2ZtaWFqd3p3ZHpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2OTQ0OTAsImV4cCI6MjA2NjI3MDQ5MH0.PXq121-5eVRFsb8WXecMZ1L92nSdb3oPafKB0LPJoM4';

// Initialize Supabase client với service role key để có quyền ghi
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

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
    const event = payload.event || req.headers['x-pancake-event'] || 'unknown';
    const data = payload.data || payload;
    const storeId = payload.store_id || req.headers['x-store-id'] || '';

    // Log để debug
    console.log('Pancake Webhook received:', { event, storeId, dataKeys: Object.keys(data || {}) });

    // Lưu webhook data vào Supabase để frontend có thể lấy
    // Tạo table webhook_queue nếu chưa có:
    // CREATE TABLE webhook_queue (
    //   id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    //   event TEXT NOT NULL,
    //   store_id TEXT,
    //   payload JSONB NOT NULL,
    //   processed BOOLEAN DEFAULT FALSE,
    //   created_at TIMESTAMP DEFAULT NOW()
    // );
    
    try {
      const { error: dbError } = await supabase
        .from('webhook_queue')
        .insert({
          event,
          store_id: storeId,
          payload: data,
          processed: false,
        });

      if (dbError) {
        console.error('Database error:', dbError);
        // Nếu table chưa tồn tại, vẫn trả về success nhưng log error
        // Frontend có thể xử lý bằng cách khác
      }
    } catch (dbErr) {
      console.error('Failed to save to database:', dbErr);
      // Continue anyway - webhook đã nhận được
    }

    // Set CORS headers
    Object.entries(corsHeaders).forEach(([key, value]) => {
      res.setHeader(key, value);
    });

    // Trả về success
    return res.status(200).json({ 
      success: true, 
      message: 'Webhook received successfully',
      event,
      storeId,
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

