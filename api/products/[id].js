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
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Extract ID from the URL path
  const { id } = req.query;
  const productId = parseInt(id);

  if (!productId || isNaN(productId)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid product ID'
    });
  }

  try {
    if (req.method === 'GET') {
      // Get single product
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
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

    } else if (req.method === 'PUT' || req.method === 'PATCH') {
      // Update product
      const updateData = req.body;

      const { data, error } = await supabase
        .from('products')
        .update(updateData)
        .eq('id', productId)
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
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

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
