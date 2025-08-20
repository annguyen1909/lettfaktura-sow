import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    if (req.method === 'GET') {
      // Get all products with optional search
      const { articleNo, product, page = 1, limit = 50 } = req.query;
      
      let query = supabase
        .from('products')
        .select('*')
        .order('id', { ascending: true });
      
      // Add search filters
      if (articleNo) {
        query = query.ilike('articleNo', `%${articleNo}%`);
      }
      
      if (product) {
        query = query.ilike('product', `%${product}%`);
      }
      
      // Add pagination
      const offset = (page - 1) * limit;
      query = query.range(offset, offset + limit - 1);
      
      const { data, error, count } = await query;
      
      if (error) {
        console.error('Database error:', error);
        return res.status(500).json({
          success: false,
          error: 'Database error',
          message: error.message
        });
      }
      
      res.status(200).json({
        success: true,
        products: data || [],
        pagination: {
          total: count || data?.length || 0,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil((count || data?.length || 0) / limit)
        }
      });
      
    } else if (req.method === 'POST') {
      // Create new product
      const { articleNo, product, price, inStock, unit, inPrice, description } = req.body;
      
      if (!articleNo || !product) {
        return res.status(400).json({
          success: false,
          error: 'Article number and product name are required'
        });
      }
      
      const { data, error } = await supabase
        .from('products')
        .insert([{
          articleNo,
          product,
          price: price || 0,
          inStock: inStock || 0,
          unit: unit || 'pcs',
          inPrice: inPrice || 0,
          description: description || null
        }])
        .select()
        .single();
      
      if (error) {
        console.error('Database error:', error);
        return res.status(500).json({
          success: false,
          error: 'Database error',
          message: error.message
        });
      }
      
      res.status(201).json({
        success: true,
        product: data
      });
      
    } else if (req.method === 'PUT' || req.method === 'PATCH') {
      // Update product
      const urlParts = req.url.split('/');
      const id = parseInt(urlParts[urlParts.length - 1]);
      
      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid product ID'
        });
      }
      
      const updateData = req.body;
      
      const { data, error } = await supabase
        .from('products')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          return res.status(404).json({
            success: false,
            error: 'Product not found'
          });
        }
        
        console.error('Database error:', error);
        return res.status(500).json({
          success: false,
          error: 'Database error',
          message: error.message
        });
      }
      
      res.status(200).json({
        success: true,
        product: data
      });
      
    } else if (req.method === 'DELETE') {
      // Delete product
      const urlParts = req.url.split('/');
      const id = parseInt(urlParts[urlParts.length - 1]);
      
      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid product ID'
        });
      }
      
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Database error:', error);
        return res.status(500).json({
          success: false,
          error: 'Database error',
          message: error.message
        });
      }
      
      res.status(204).end();
      
    } else {
      res.status(405).json({
        success: false,
        error: `Method ${req.method} not allowed`
      });
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
}
