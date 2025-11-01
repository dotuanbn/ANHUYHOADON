// API endpoint để frontend lấy pending webhook data
// GET /api/webhook-queue?processed=false

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://gbyeednwkfmiajwzwdzc.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdieWVlZG53a2ZtaWFqd3p3ZHpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2OTQ0OTAsImV4cCI6MjA2NjI3MDQ5MH0.PXq121-5eVRFsb8WXecMZ1L92nSdb3oPafKB0LPJoM4';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    return res.status(200).json({});
  }

  try {
    const processed = req.query.processed === 'true';
    const limit = parseInt(req.query.limit as string) || 10;

    // Lấy webhook data chưa xử lý
    const { data, error } = await supabase
      .from('webhook_queue')
      .select('*')
      .eq('processed', processed)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Database error:', error);
      // Nếu table chưa tồn tại, trả về empty array
      Object.entries(corsHeaders).forEach(([key, value]) => {
        res.setHeader(key, value);
      });
      return res.status(200).json({ data: [], message: 'Table not found or empty' });
    }

    Object.entries(corsHeaders).forEach(([key, value]) => {
      res.setHeader(key, value);
    });

    return res.status(200).json({ 
      success: true,
      data: data || [],
      count: data?.length || 0,
    });
  } catch (error) {
    console.error('Error:', error);
    
    Object.entries(corsHeaders).forEach(([key, value]) => {
      res.setHeader(key, value);
    });
    
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

