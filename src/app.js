const express = require('express');
const cors = require('cors');
require('dotenv').config({
  path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env',
});

const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

const addressRoutes = require('./routes/addressRoutes');
const authRoutes = require('./routes/authRoutes');
const cartRoutes = require('./routes/cartRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const productRoutes = require('./routes/productRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const storeRoutes = require('./routes/storeRoutes');
const userRoutes = require('./routes/userRoutes');
const variantRoutes = require('./routes/variantRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');

const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/users/me/addresses', addressRoutes.meRouter);
app.use('/api/addresses', addressRoutes.router);
app.use('/api/auth', authRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/orders/:orderId/payment', paymentRoutes);
app.use('/api/products', productRoutes);
app.use('/api/products/:productId/reviews', reviewRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products/:productId', variantRoutes.productRouter);
app.use('/api/skus', variantRoutes.router);
app.use('/api/users/me/wishlist', wishlistRoutes);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(notFoundHandler);  
app.use(errorHandler);

module.exports = app;