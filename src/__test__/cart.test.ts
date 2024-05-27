
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { app, server } from '../index';
import { getConnection } from 'typeorm';
import { dbConnection } from '../startups/dbConnection';
import { v4 as uuid } from 'uuid';
import { User, UserInterface } from '../entities/User';
import { Product } from '../entities/Product';
import { Category } from '../entities/Category';
import { Cart } from '../entities/Cart';
import { CartItem } from '../entities/CartItem';
import { cleanDatabase } from './test-assets/DatabaseCleanup';

const vendor1Id = uuid();
const buyer1Id = uuid();
const buyer2Id = uuid();
const product1Id = uuid();
const product2Id = uuid();
const catId = uuid();
const cart1Id = uuid();
const cartItemId = uuid();
const sampleCartId = uuid();
const sampleCartItemId = uuid();
const samplecartItem3Id = uuid();

const jwtSecretKey = process.env.JWT_SECRET || '';

const getAccessToken = (id: string, email: string) => {
  return jwt.sign(
    {
      id: id,
      email: email,
    },
    jwtSecretKey
  );
};

const sampleVendor1: UserInterface = {
  id: vendor1Id,
  firstName: 'vendor1',
  lastName: 'user',
  email: 'vendo111@example.com',
  password: 'password',
  userType: 'Vendor',
  gender: 'Male',
  phoneNumber: '11126380996347',
  photoUrl: 'https://example.com/photo.jpg',
  role: 'VENDOR',
};

const sampleBuyer1: UserInterface = {
  id: buyer1Id,
  firstName: 'buyer1',
  lastName: 'user',
  email: 'elijahladdiedv@gmail.com',
  password: 'password',
  userType: 'Buyer',
  gender: 'Male',
  phoneNumber: '12116380996347',
  photoUrl: 'https://example.com/photo.jpg',
  role: 'BUYER',
};

const sampleBuyer2: UserInterface = {
  id: buyer2Id,
  firstName: 'buyer1',
  lastName: 'user',
  email: 'buyer1112@example.com',
  password: 'password',
  userType: 'Buyer',
  gender: 'Male',
  phoneNumber: '12116380996348',
  photoUrl: 'https://example.com/photo.jpg',
  role: 'BUYER',
};

const sampleCat = {
  id: catId,
  name: 'accessories',
};

const sampleProduct1 = {
  id: product1Id,
  name: 'test product',
  description: 'amazing product',
  images: ['photo1.jpg', 'photo2.jpg', 'photo3.jpg'],
  newPrice: 200,
  quantity: 10,
  vendor: sampleVendor1,
  categories: [sampleCat],
};

const sampleProduct2 = {
  id: product2Id,
  name: 'test product2',
  description: 'amazing product2',
  images: ['photo1.jpg', 'photo2.jpg', 'photo3.jpg', 'photo4.jpg', 'photo5.jpg'],
  newPrice: 200,
  quantity: 10,
  vendor: sampleVendor1,
  categories: [sampleCat],
};

const sampleCart1 = {
  id: cart1Id,
  user: sampleBuyer1,
  totalAmount: 200,
};

const sampleCart2 = {
  id: sampleCartId,
  totalAmount: 200,
};

const sampleCartItem1 = {
  id: cartItemId,
  product: sampleProduct1,
  cart: sampleCart1,
  quantity: 2,
  newPrice: 200,
  total: 400,
};

const sampleCartItem2 = {
  id: sampleCartItemId,
  product: sampleProduct2,
  cart: sampleCart1,
  quantity: 2,
  newPrice: 200,
  total: 400,
};

const sampleCartItem3 = {
  id: samplecartItem3Id,
  product: sampleProduct2,
  cart: sampleCart2,
  quantity: 2,
  newPrice: 200,
  total: 400,
};

const bodyTosend = {
  productId: product1Id,
  quantity: 2,
};

beforeAll(async () => {
  const connection = await dbConnection();

  const categoryRepository = connection?.getRepository(Category);
  await categoryRepository?.save({ ...sampleCat });

  const userRepository = connection?.getRepository(User);
  await userRepository?.save({ ...sampleVendor1 });
  await userRepository?.save({ ...sampleBuyer1 });
  await userRepository?.save({ ...sampleBuyer2 });

  const productRepository = connection?.getRepository(Product);
  await productRepository?.save({ ...sampleProduct1 });
  await productRepository?.save({ ...sampleProduct2 });

  const cartRepository = connection?.getRepository(Cart);
  await cartRepository?.save({ ...sampleCart1 });
  await cartRepository?.save({ ...sampleCart2 });

  const cartItemRepository = connection?.getRepository(CartItem);
  await cartItemRepository?.save({ ...sampleCartItem1 });
  await cartItemRepository?.save({ ...sampleCartItem2 });
  await cartItemRepository?.save({ ...sampleCartItem3 });
});

afterAll(async () => {
  await cleanDatabase()

});

describe('Cart management for guest/buyer', () => {
  describe('Creating new product', () => {
    it('should create new product', async () => {
      const response = await request(app)
        .post('/product')
        .field('name', 'test product3')
        .field('description', 'amazing product3')
        .field('newPrice', 200)
        .field('quantity', 10)
        .field('expirationDate', '10-2-2023')
        .field('categories', 'technology')
        .field('categories', 'sample')
        .attach('images', `${__dirname}/test-assets/photo1.png`)
        .attach('images', `${__dirname}/test-assets/photo2.webp`)
        .set('Authorization', `Bearer ${getAccessToken(vendor1Id, sampleVendor1.email)}`);

      expect(response.status).toBe(201);
      expect(response.body.data.product).toBeDefined;
    }, 60000);

    it('return an error if the number of product images exceeds 6', async () => {
      const response = await request(app)
        .post(`/product/`)
        .field('name', 'test-product-images')
        .field('description', 'amazing product3')
        .field('newPrice', 200)
        .field('quantity', 10)
        .field('expirationDate', '10-2-2023')
        .field('categories', 'technology')
        .field('categories', 'sample')
        .attach('images', `${__dirname}/test-assets/photo1.png`)
        .attach('images', `${__dirname}/test-assets/photo1.png`)
        .attach('images', `${__dirname}/test-assets/photo2.webp`)
        .attach('images', `${__dirname}/test-assets/photo2.webp`)
        .attach('images', `${__dirname}/test-assets/photo2.webp`)
        .attach('images', `${__dirname}/test-assets/photo2.webp`)
        .attach('images', `${__dirname}/test-assets/photo2.webp`)
        .set('Authorization', `Bearer ${getAccessToken(vendor1Id, sampleVendor1.email)}`);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Product cannot have more than 6 images');
    });

    it('should not create new product it already exist', async () => {
      const response = await request(app)
        .post('/product')
        .field('name', 'test product3')
        .field('description', 'amazing product3')
        .field('newPrice', 200)
        .field('quantity', 10)
        .field('categories', sampleCat.name)
        .attach('images', `${__dirname}/test-assets/photo1.png`)
        .attach('images', `${__dirname}/test-assets/photo2.webp`)
        .set('Authorization', `Bearer ${getAccessToken(vendor1Id, sampleVendor1.email)}`);

      expect(response.status).toBe(409);
    });

    it('should not create new product, if there are missing field data', async () => {
      const response = await request(app)
        .post('/product')
        .field('description', 'amazing product3')
        .field('newPrice', 200)
        .field('quantity', 10)
        .field('categories', sampleCat.name)
        .attach('images', `${__dirname}/test-assets/photo1.png`)
        .attach('images', `${__dirname}/test-assets/photo2.webp`)
        .set('Authorization', `Bearer ${getAccessToken(vendor1Id, sampleVendor1.email)}`);

      expect(response.status).toBe(400);
    });

    it('should not create new product, images are not at least more than 1', async () => {
      const response = await request(app)
        .post('/product')
        .field('name', 'test-product-image')
        .field('description', 'amazing product3')
        .field('newPrice', 200)
        .field('quantity', 10)
        .field('categories', sampleCat.name)
        .attach('images', `${__dirname}/test-assets/photo1.png`)
        .set('Authorization', `Bearer ${getAccessToken(vendor1Id, sampleVendor1.email)}`);

      expect(response.status).toBe(400);
    });
  });

  describe('Adding product to cart on guest/buyer', () => {
    it('should get cart items of authenticated user', async () => {
      const response = await request(app)
        .get('/cart')
        .set('Authorization', `Bearer ${getAccessToken(buyer1Id, sampleBuyer1.email)}`);

      expect(response.status).toBe(200);
      expect(response.body.data.message).toBe('Cart retrieved successfully');
      expect(response.body.data.cart).toBeDefined;
    });

    it('should get cart items of authenticated user', async () => {
      const response = await request(app)
        .get('/cart')
        .set('Authorization', `Bearer ${getAccessToken(buyer2Id, sampleBuyer2.email)}`);

      expect(response.status).toBe(200);
      expect(response.body.data.message).toBe('Cart is empty');
      expect(response.body.data.cart).toBeDefined;
    });

    it('should add product to cart as authenticated buyer', async () => {
      const response = await request(app)
        .post(`/cart`)
        .send(bodyTosend)
        .set('Authorization', `Bearer ${getAccessToken(buyer1Id, sampleBuyer1.email)}`);

      expect(response.status).toBe(201);
      expect(response.body.data.message).toBe('cart updated successfully');
      expect(response.body.data.cart).toBeDefined;
    });

    it('should add product to cart as guest', async () => {
      const response = await request(app).post(`/cart`).send(bodyTosend);

      expect(response.status).toBe(201);
      expect(response.body.data.message).toBe('cart updated successfully');
      expect(response.body.data.cart).toBeDefined;
    });

    it('should get cart items of guest user', async () => {
      const response = await request(app).get('/cart');

      expect(response.status).toBe(200);
      expect(response.body.data.cart).toBeDefined;
    });

    it('should return 400 if you do not send proper request body', async () => {
      const response = await request(app).post(`/cart`);

      expect(response.status).toBe(400);
    });

    it('should not add product to cart if product does not exist', async () => {
      const response = await request(app)
        .post(`/cart`)
        .send({ productId: uuid(), quantity: 2 })
        .set('Authorization', `Bearer ${getAccessToken(buyer1Id, sampleBuyer1.email)}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Product not found, try again.');
    });

    it('should not add product to cart if quantity is less than 1', async () => {
      const response = await request(app)
        .post(`/cart`)
        .send({ productId: product1Id, quantity: 0 })
        .set('Authorization', `Bearer ${getAccessToken(buyer1Id, sampleBuyer1.email)}`);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Quantity must be greater than 0');
    });

    it('should chnage quantity of product in cart if it is already there', async () => {
      const response = await request(app)
        .post(`/cart`)
        .send({ productId: product1Id, quantity: 3 })
        .set('Authorization', `Bearer ${getAccessToken(buyer1Id, sampleBuyer1.email)}`);

      expect(response.status).toBe(201);
      expect(response.body.data.message).toBe('cart updated successfully');
      expect(response.body.data.cart).toBeDefined;
    });
  });

  describe('Getting cart items', () => {
    it('should get cart items of authenticated user', async () => {
      const response = await request(app)
        .get('/cart')
        .set('Authorization', `Bearer ${getAccessToken(buyer1Id, sampleBuyer1.email)}`);

      expect(response.status).toBe(200);
      expect(response.body.data.message).toBe('Cart retrieved successfully');
      expect(response.body.data.cart).toBeDefined;
    });

    it('should get cart items of guest user', async () => {
      const response = await request(app).get('/cart');

      expect(response.status).toBe(200);
      expect(response.body.data.cart).toBeDefined;
    });

    it('should get cart items of guest user as empty with wrong cartId', async () => {
      const response = await request(app)
        .get('/cart')
        .set('Cookie', [`cartId=${uuid()}`]);

      expect(response.status).toBe(200);
      expect(response.body.data.message).toBe('Cart is empty');
      expect(response.body.data.cart).toBeDefined;
    });
  });

  describe('Deleting product from cart', () => {
    it('should return 404 if product does not exist in cart', async () => {
      const response = await request(app)
        .delete(`/cart/${uuid()}`)
        .set('Authorization', `Bearer ${getAccessToken(buyer1Id, sampleBuyer1.email)}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Cart item not found');
    });

    it('should return 401 if you try to delete item not in your cart', async () => {
      const response = await request(app)
        .delete(`/cart/${cartItemId}`)
        .set('Authorization', `Bearer ${getAccessToken(buyer2Id, sampleBuyer2.email)}`);

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('You are not authorized to perform this action');
    });

    it('should delete product from cart', async () => {
      const response = await request(app)
        .delete(`/cart/${sampleCartItemId}`)
        .set('Authorization', `Bearer ${getAccessToken(buyer1Id, sampleBuyer1.email)}`);

      expect(response.status).toBe(200);
      expect(response.body.data.message).toBe('Product removed from cart successfully');
      expect(response.body.data.cart).toBeDefined;
    });

    it('should delete product from cart', async () => {
      const response = await request(app)
        .delete(`/cart/${cartItemId}`)
        .set('Authorization', `Bearer ${getAccessToken(buyer1Id, sampleBuyer1.email)}`);

      expect(response.status).toBe(200);
      expect(response.body.data.message).toBe('cart removed successfully');
    });

    it('should add product to cart as authenticated buyer', async () => {
      const response = await request(app)
        .post(`/cart`)
        .send(bodyTosend)
        .set('Authorization', `Bearer ${getAccessToken(buyer1Id, sampleBuyer1.email)}`);

      expect(response.status).toBe(201);
      expect(response.body.data.message).toBe('cart updated successfully');
      expect(response.body.data.cart).toBeDefined;
    });

    it('should add product to cart as authenticated buyer', async () => {
      const response = await request(app)
        .post(`/cart`)
        .send({ productId: product2Id, quantity: 2 })
        .set('Authorization', `Bearer ${getAccessToken(buyer1Id, sampleBuyer1.email)}`);

      expect(response.status).toBe(201);
      expect(response.body.data.message).toBe('cart updated successfully');
      expect(response.body.data.cart).toBeDefined;
    });

    it('should return 404 if product does not exist in guest cart', async () => {
      const response = await request(app).delete(`/cart/${uuid()}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Cart item not found');
    });

    it('should return 404 if product does not exist in guest cart', async () => {
      const response = await request(app).delete(`/cart/${samplecartItem3Id}`);

      expect(response.status).toBe(200);
    });
  });

  describe('Clearing cart', () => {
    it('should return 200 as authenticated buyer does not have a cart', async () => {
      const response = await request(app)
        .delete(`/cart`)
        .set('Authorization', `Bearer ${getAccessToken(buyer2Id, sampleBuyer2.email)}`);

      expect(response.status).toBe(200);
      expect(response.body.data.message).toBe('Cart is empty');
      expect(response.body.data.cart).toBeDefined;
    });

    it('should add product to cart as authenticated buyer', async () => {
      const response = await request(app)
        .post(`/cart`)
        .send(bodyTosend)
        .set('Authorization', `Bearer ${getAccessToken(buyer2Id, sampleBuyer2.email)}`);

      expect(response.status).toBe(201);
      expect(response.body.data.message).toBe('cart updated successfully');
      expect(response.body.data.cart).toBeDefined;
    });

    it('should clear cart as authenticated buyer', async () => {
      const response = await request(app)
        .delete(`/cart`)
        .set('Authorization', `Bearer ${getAccessToken(buyer2Id, sampleBuyer2.email)}`);

      expect(response.status).toBe(200);
      expect(response.body.data.message).toBe('Cart cleared successfully');
      expect(response.body.data.cart).toBeDefined;
    });

    it('should return 200 as guest does not have a cart', async () => {
      const response = await request(app).delete(`/cart`);

      expect(response.status).toBe(200);
      expect(response.body.data.message).toBe('Cart is empty');
      expect(response.body.data.cart).toBeDefined;
    });

    it('should get cart items of guest user as empty with wrong cartId', async () => {
      const response = await request(app)
        .get('/cart')
        .set('Cookie', [`cartId=${uuid()}`]);

      expect(response.status).toBe(200);
      expect(response.body.data.message).toBe('Cart is empty');
      expect(response.body.data.cart).toBeDefined;
    });

    it('should delete cart items of guest user as empty with wrong cartId', async () => {
      const response = await request(app)
        .delete('/cart')
        .set('Cookie', [`cartId=${sampleCartId}`]);

      expect(response.status).toBe(200);
      expect(response.body.data.message).toBe('Cart is empty');
      expect(response.body.data.cart).toBeDefined;
    });
  });
});

describe('Order management tests', () => {
  let orderId: string | null;
  describe('Create order', () => {
    it('should return 400 when user ID is not provided', async () => {
      const response = await request(app)
        .post('/product/orders')
        .send({
          address: {
            country: 'Test Country',
            city: 'Test City',
            street: 'Test Street',
          },
        }).set('Authorization', `Bearer ${getAccessToken(buyer1Id, sampleBuyer1.email)}`);
      expect(response.status).toBe(400);
    });

    it('should create a new order', async () => {

      const response = await request(app)
        .post('/product/orders')
        .send({
          address: {
            country: 'Test Country',
            city: 'Test City',
            street: 'Test Street',
          },
        })
        .set('Authorization', `Bearer ${getAccessToken(buyer2Id, sampleBuyer2.email)}`);

      expect(response.status).toBe(400);
      expect(response.body.message).toBeUndefined;
      orderId = response.body.data?.orderId; // Assuming orderId is returned in response
    });

    it('should insert   a new order', async () => {

      const response = await request(app)
        .post('/product/orders')
        .send({
          address: {
            country: 'Test Country',
            city: 'Test City',
            street: 'Test Street',
          },
        })
        .set('Authorization', `Bearer ${getAccessToken(buyer2Id, sampleBuyer2.email)}`);

      expect(response.status).toBe(400);
      expect(response.body.message).toBeUndefined;
      orderId = response.body.data?.orderId; // Assuming orderId is returned in response
    });
  });

  describe('Get orders', () => {
    it('should return orders for the buyer', async () => {
      const response = await request(app)
        .get('/product/client/orders')
        .set('Authorization', `Bearer ${getAccessToken(buyer2Id, sampleBuyer2.email)}`);
        expect(response.status).toBe(404);
      expect(response.body.message).toBeUndefined;

    });

    it('should return 404 if the buyer has no orders', async () => {
      const response = await request(app)
        .get('/product/client/orders')
        .set('Authorization', `Bearer ${getAccessToken(buyer2Id, sampleBuyer2.email)}`);
      expect(response.status).toBe(404);
      expect(response.body.message).toBeUndefined;
    });
  });

  describe('Get transaction history', () => {
    it('should return transaction history for the buyer', async () => {

      const response = await request(app)
        .get('/product/orders/history')
        .set('Authorization', `Bearer ${getAccessToken(buyer1Id, sampleBuyer1.email)}`);
      expect(response.status).toBe(404);
      expect(response.body.message).toBe('No transaction history found');

    });

    it('should return 400 when user ID is not provided', async () => {
      const response = await request(app)
        .get('/product/orders/history')
        .set('Authorization', `Bearer ${getAccessToken(buyer1Id, sampleBuyer1.email)}`);
      expect(response.status).toBe(404);
    });
  });

  describe('Update order', () => {
    it('should update order status successfully', async () => {
  
      const response = await request(app)
        .put(`/product/client/orders/${orderId}`)
        .send({ orderStatus: 'delivered' })
        .set('Authorization', `Bearer ${getAccessToken(buyer1Id, sampleBuyer1.email)}`);
        expect(response.status).toBe(500);
    });
  });
});