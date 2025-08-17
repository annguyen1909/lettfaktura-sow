import { Product } from '../models/index.js';
import { Op } from 'sequelize';

async function productRoutes(fastify, options) {
  // Get all products with optional search
  fastify.get('/products', async (request, reply) => {
    try {
      const { articleNo, product, page = 1, limit = 50 } = request.query;
      
      const whereClause = {};
      
      if (articleNo) {
        whereClause.articleNo = {
          [Op.iLike]: `%${articleNo}%`
        };
      }
      
      if (product) {
        whereClause.product = {
          [Op.iLike]: `%${product}%`
        };
      }
      
      const offset = (page - 1) * limit;
      
      const { count, rows } = await Product.findAndCountAll({
        where: whereClause,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['id', 'ASC']]
      });
      
      return {
        products: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / limit)
        }
      };
    } catch (error) {
      fastify.log.error(error);
      reply.status(500).send({ error: 'Internal server error' });
    }
  });

  // Get single product
  fastify.get('/products/:id', async (request, reply) => {
    try {
      const { id } = request.params;
      
      const product = await Product.findByPk(id);
      
      if (!product) {
        return reply.status(404).send({ error: 'Product not found' });
      }
      
      return { product };
    } catch (error) {
      fastify.log.error(error);
      reply.status(500).send({ error: 'Internal server error' });
    }
  });

  // Create new product
  fastify.post('/products', async (request, reply) => {
    try {
      const { articleNo, product, price, inStock, unit, inPrice, description } = request.body;
      
      if (!articleNo || !product) {
        return reply.status(400).send({ error: 'Article number and product name are required' });
      }
      
      const newProduct = await Product.create({
        articleNo,
        product,
        price: price || 0,
        inStock: inStock || 0,
        unit: unit || 'pieces',
        inPrice: inPrice || 0,
        description: description || null
      });
      
      reply.status(201).send({ product: newProduct });
    } catch (error) {
      fastify.log.error(error);
      reply.status(500).send({ error: 'Internal server error' });
    }
  });

  // Update product
  fastify.put('/products/:id', async (request, reply) => {
    try {
      const { id } = request.params;
      const { articleNo, product, price, inStock, unit, inPrice, description } = request.body;
      
      const existingProduct = await Product.findByPk(id);
      
      if (!existingProduct) {
        return reply.status(404).send({ error: 'Product not found' });
      }
      
      const updatedProduct = await existingProduct.update({
        articleNo: articleNo !== undefined ? articleNo : existingProduct.articleNo,
        product: product !== undefined ? product : existingProduct.product,
        price: price !== undefined ? price : existingProduct.price,
        inStock: inStock !== undefined ? inStock : existingProduct.inStock,
        unit: unit !== undefined ? unit : existingProduct.unit,
        inPrice: inPrice !== undefined ? inPrice : existingProduct.inPrice,
        description: description !== undefined ? description : existingProduct.description
      });
      
      return { product: updatedProduct };
    } catch (error) {
      fastify.log.error(error);
      reply.status(500).send({ error: 'Internal server error' });
    }
  });

  // Update single field of a product
  fastify.patch('/products/:id', async (request, reply) => {
    try {
      const { id } = request.params;
      const updateData = request.body;
      
      const existingProduct = await Product.findByPk(id);
      
      if (!existingProduct) {
        return reply.status(404).send({ error: 'Product not found' });
      }
      
      const updatedProduct = await existingProduct.update(updateData);
      
      return { product: updatedProduct };
    } catch (error) {
      fastify.log.error(error);
      reply.status(500).send({ error: 'Internal server error' });
    }
  });

  // Delete product
  fastify.delete('/products/:id', async (request, reply) => {
    try {
      const { id } = request.params;
      
      const product = await Product.findByPk(id);
      
      if (!product) {
        return reply.status(404).send({ error: 'Product not found' });
      }
      
      await product.destroy();
      
      reply.status(204).send();
    } catch (error) {
      fastify.log.error(error);
      reply.status(500).send({ error: 'Internal server error' });
    }
  });
}

export default productRoutes;
