# EatFine Restaurant Website

A complete restaurant website with user authentication, cart functionality, and order management system.

## Features

- User registration and login
- Menu browsing with filtering
- Shopping cart functionality
- Order history tracking
- Responsive design

## Technologies Used

- Node.js
- Express.js
- MongoDB
- HTML, CSS, JavaScript
- Bootstrap (via CDN)

## Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
```

2. Navigate to the project directory:
```bash
cd Eatfine
```

3. Install dependencies:
```bash
npm install
```

4. Create a `.env` file in the root directory with the following content:
```env
MONGO_URI=mongodb+srv://sohailalikha552_db_user:Sohail@BSU@eastfine.cijx8h4.mongodb.net/
PORT=6004
SESSION_SECRET=your-session-secret-here
NODE_ENV=production
```

5. Start the server:
```bash
npm start
```

## Running in Development

To run the application in development mode with auto-restart on changes:

```bash
npm run dev
```

## Deployment

### Deploying to Heroku

1. Create a Heroku account at [https://heroku.com](https://heroku.com)
2. Install the Heroku CLI
3. Login to Heroku:
```bash
heroku login
```
4. Create a new Heroku app:
```bash
heroku create your-app-name
```
5. Set your environment variables:
```bash
heroku config:set MONGO_URI="your-mongodb-uri"
heroku config:set SESSION_SECRET="your-session-secret"
```
6. Deploy your application:
```bash
git push heroku main
```

### Deploying to Other Platforms

The application can also be deployed to platforms like:

- **Railway**: Connect your GitHub repo and deploy automatically
- **Render**: Connect your GitHub repo and configure the environment
- **Vercel**: Though primarily for frontend, can deploy Node.js backends
- **DigitalOcean**: Using App Platform or Droplets

## Environment Variables

- `MONGO_URI`: MongoDB connection string
- `PORT`: Port number for the server (default: 6004)
- `SESSION_SECRET`: Secret key for session encryption
- `NODE_ENV`: Environment mode (development/production)

## API Endpoints

### Authentication
- `POST /api/register` - Register a new user
- `POST /api/login` - Login user
- `POST /api/logout` - Logout user
- `GET /api/check-auth` - Check authentication status

### Cart
- `POST /api/cart/add` - Add item to cart
- `GET /api/cart` - Get cart items
- `PUT /api/cart/update` - Update cart item quantity
- `DELETE /api/cart/remove` - Remove item from cart
- `DELETE /api/cart/clear` - Clear entire cart

### Orders
- `POST /api/orders/create` - Create a new order
- `GET /api/orders` - Get user's order history
- `GET /api/orders/:orderId` - Get specific order details

## Project Structure

```
Eatfine/
├── public/
│   ├── js/
│   │   ├── index.js
│   │   ├── login.js
│   │   ├── main.js
│   │   └── signup.js
│   ├── images/
│   ├── cart.html
│   ├── orders.html
│   ├── about.html
│   ├── contact.html
│   ├── gallery.html
│   ├── index.html
│   ├── login.html
│   ├── menu.html
│   ├── signup.html
│   └── styles.css
├── .env
├── .gitignore
├── package.json
├── README.md
└── server.js
```

## Database Models

### User
- name (String, required)
- email (String, required, unique)
- password (String, required)

### Cart
- userId (ObjectId, required)
- items (Array of cart items)
  - productId (String, required)
  - name (String, required)
  - price (Number, required)
  - quantity (Number, default: 1)
  - image (String)
  - category (String)

### Order
- userId (ObjectId, required)
- items (Array of order items)
  - productId (String, required)
  - name (String, required)
  - price (Number, required)
  - quantity (Number, required)
  - image (String)
- totalAmount (Number, required)
- status (String, default: 'pending')
- orderDate (Date, default: now)
- address (String)
- phone (String)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

If you encounter any issues or have questions, please open an issue in the repository.