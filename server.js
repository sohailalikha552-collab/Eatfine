require('dotenv').config();
const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const path = require('path');
const MongoStore = require('connect-mongo');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 6004;

app.use(cors({
    origin: true,
    credentials: true
}));

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
    console.error('MONGO_URI environment variable is required');
    process.exit(1);
}

// Global connection promise to ensure connection is established
let connectionPromise = null;

// Function to connect to MongoDB with proper options for serverless environments
function connectDB() {
    if (connectionPromise) {
        return connectionPromise;
    }
    
    connectionPromise = mongoose.connect(MONGO_URI, { 
        useNewUrlParser: true, 
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 60000,  // Increase timeout to 60 seconds
        socketTimeoutMS: 60000,         // Increase socket timeout to 60 seconds
        bufferCommands: true,           // Enable mongoose buffering
        bufferMaxEntries: 0,            // Disable mongoose buffering
        maxPoolSize: 10,                // Maintain up to 10 socket connections
        connectTimeoutMS: 60000,        // Increase connection timeout
        heartbeatFrequencyMS: 30000     // Heartbeat every 30 seconds
    });
    
    return connectionPromise;
}

connectDB()
.then(() => {
    console.log('Connected to MongoDB!');
})
.catch(err => {
    console.error('Error connecting to MongoDB:', err);
    console.error('Connection string used:', MONGO_URI);
});

// Connection ready state
let dbConnected = false;

// Handle connection events
mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
    dbConnected = false;
});

mongoose.connection.on('disconnected', () => {
    console.log('MongoDB disconnected');
    dbConnected = false;
});

mongoose.connection.once('open', () => {
    console.log('MongoDB connection established');
    dbConnected = true;
});

// Graceful shutdown
process.on('SIGINT', () => {
    mongoose.connection.close(() => {
        console.log('MongoDB connection closed through app termination');
        process.exit(0);
    });
});

app.use(session({
    secret: process.env.SESSION_SECRET || 'your-fallback-secret',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ 
        mongoUrl: MONGO_URI,
        autoRemove: 'interval',
        autoRemoveInterval: 10,
        touchAfter: 24 * 3600 // Resave interval
    }),
    cookie: { 
        secure: false,
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24,
        sameSite: 'lax',
        path: '/'
    }
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

const cartItemSchema = new mongoose.Schema({
    productId: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, default: 1 },
    image: { type: String },
    category: { type: String }
}, { _id: false });

const cartSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [cartItemSchema],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const Cart = mongoose.model('Cart', cartSchema);

const orderItemSchema = new mongoose.Schema({
    productId: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    image: { type: String }
}, { _id: false });

const orderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [orderItemSchema],
    totalAmount: { type: Number, required: true },
    status: { type: String, default: 'pending' },
    orderDate: { type: Date, default: Date.now },
    address: { type: String },
    phone: { type: String }
});

const Order = mongoose.model('Order', orderSchema);

app.use((req, res, next) => {
    console.log('Request:', {
        method: req.method,
        path: req.path,
        sessionId: req.sessionID,
        userId: req.session?.userId
    });
    next();
});


app.get('/api/check-auth', async (req, res) => {
    // Ensure database is connected
    await connectDB();
    
    res.json({ isAuthenticated: !!req.session.userId });
});


const isAuthenticated = (req, res, next) => {
    if (req.session.userId) {
        next();
    } else {
        res.status(401).json({ error: 'Not authenticated' });
    }
};

app.post('/api/register', async (req, res) => {
    console.log('Registration attempt:', req.body);
    
    try {
        // Ensure database is connected
        await connectDB();
        
        const { name, email, password } = req.body;
        
        if (!name || !email || !password) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ name, email, password: hashedPassword });
        await user.save();
        
        console.log('Welcome to DineFine', user._id);
        
        req.session.userId = user._id;
        try {
            await req.session.save();
            res.status(201).json({ success: true, redirectUrl: '/' });
        } catch (err) {
            console.error('Session save error:', err);
            return res.status(500).json({ error: 'Session creation failed' });
        }
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Registration failed: ' + error.message });
    }
});

app.post('/api/login', async (req, res) => {
    console.log('Login attempt:', req.body.email);
    
    try {
        // Ensure database is connected
        await connectDB();
        
        const { email, password } = req.body;
        
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        req.session.userId = user._id;
        try {
            await req.session.save();
            res.json({ success: true, redirectUrl: '/' });
        } catch (err) {
            console.error('Session save error:', err);
            return res.status(500).json({ error: 'Login failed' });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed: ' + error.message });
    }
});


app.post('/api/logout', async (req, res) => {
    // Ensure database is connected
    await connectDB();
    
    req.session.destroy((err) => {
        if (err) {
            console.error('Logout error:', err);
            return res.status(500).json({ error: 'Logout failed' });
        }
        res.clearCookie('connect.sid');
        res.json({ success: true, redirectUrl: '/' });
    });
});

app.post('/api/cart/add', isAuthenticated, async (req, res) => {
    try {
        // Ensure database is connected
        await connectDB();
        
        const { productId, name, price, quantity = 1, image, category } = req.body;
        
        if (!productId || !name || !price) {
            return res.status(400).json({ error: 'Product ID, name, and price are required' });
        }
        
        let cart = await Cart.findOne({ userId: req.session.userId });
        
        if (cart) {
            const existingItemIndex = cart.items.findIndex(item => item.productId === productId);
            
            if (existingItemIndex > -1) {
                cart.items[existingItemIndex].quantity += quantity;
            } else {
                cart.items.push({ productId, name, price, quantity, image, category });
            }
            
            cart.updatedAt = Date.now();
            await cart.save();
        } else {
            cart = new Cart({
                userId: req.session.userId,
                items: [{ productId, name, price, quantity, image, category }]
            });
            await cart.save();
        }
        
        res.json({ success: true, cart });
    } catch (error) {
        console.error('Add to cart error:', error);
        res.status(500).json({ error: 'Failed to add item to cart' });
    }
});

app.get('/api/cart', isAuthenticated, async (req, res) => {
    try {
        // Ensure database is connected
        await connectDB();
        
        const cart = await Cart.findOne({ userId: req.session.userId });
        
        if (!cart) {
            return res.json({ items: [], total: 0 });
        }
        
        const total = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        res.json({ items: cart.items, total });
    } catch (error) {
        console.error('Get cart error:', error);
        res.status(500).json({ error: 'Failed to get cart' });
    }
});

app.put('/api/cart/update', isAuthenticated, async (req, res) => {
    try {
        // Ensure database is connected
        await connectDB();
        
        const { productId, quantity } = req.body;
        
        if (!productId || quantity < 0) {
            return res.status(400).json({ error: 'Product ID and valid quantity are required' });
        }
        
        const cart = await Cart.findOne({ userId: req.session.userId });
        
        if (!cart) {
            return res.status(404).json({ error: 'Cart not found' });
        }
        
        const itemIndex = cart.items.findIndex(item => item.productId === productId);
        
        if (itemIndex > -1) {
            if (quantity === 0) {
                cart.items.splice(itemIndex, 1);
            } else {
                cart.items[itemIndex].quantity = quantity;
            }
            
            cart.updatedAt = Date.now();
            await cart.save();
        }
        
        res.json({ success: true, cart });
    } catch (error) {
        console.error('Update cart error:', error);
        res.status(500).json({ error: 'Failed to update cart' });
    }
});

app.delete('/api/cart/remove', isAuthenticated, async (req, res) => {
    try {
        // Ensure database is connected
        await connectDB();
        
        const { productId } = req.body;
        
        if (!productId) {
            return res.status(400).json({ error: 'Product ID is required' });
        }
        
        const cart = await Cart.findOne({ userId: req.session.userId });
        
        if (!cart) {
            return res.status(404).json({ error: 'Cart not found' });
        }
        
        cart.items = cart.items.filter(item => item.productId !== productId);
        
        cart.updatedAt = Date.now();
        await cart.save();
        
        res.json({ success: true, cart });
    } catch (error) {
        console.error('Remove from cart error:', error);
        res.status(500).json({ error: 'Failed to remove item from cart' });
    }
});

app.delete('/api/cart/clear', isAuthenticated, async (req, res) => {
    try {
        // Ensure database is connected
        await connectDB();
        
        const result = await Cart.deleteOne({ userId: req.session.userId });
        
        if (result.deletedCount === 0) {
            return res.json({ success: true, message: 'Cart cleared' });
        }
        
        res.json({ success: true, message: 'Cart cleared' });
    } catch (error) {
        console.error('Clear cart error:', error);
        res.status(500).json({ error: 'Failed to clear cart' });
    }
});

app.post('/api/orders/create', isAuthenticated, async (req, res) => {
    try {
        // Ensure database is connected
        await connectDB();
        
        const { address, phone } = req.body;
        
        const cart = await Cart.findOne({ userId: req.session.userId });
        
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ error: 'Cart is empty' });
        }
        
        const totalAmount = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        const order = new Order({
            userId: req.session.userId,
            items: cart.items,
            totalAmount,
            address,
            phone
        });
        
        await order.save();
        
        await Cart.deleteOne({ userId: req.session.userId });
        
        res.json({ success: true, order });
    } catch (error) {
        console.error('Create order error:', error);
        res.status(500).json({ error: 'Failed to create order' });
    }
});

app.get('/api/orders', isAuthenticated, async (req, res) => {
    try {
        // Ensure database is connected
        await connectDB();
        
        const orders = await Order.find({ userId: req.session.userId })
            .sort({ orderDate: -1 });
        
        res.json({ orders });
    } catch (error) {
        console.error('Get orders error:', error);
        res.status(500).json({ error: 'Failed to get orders' });
    }
});

app.get('/api/orders/:orderId', isAuthenticated, async (req, res) => {
    try {
        // Ensure database is connected
        await connectDB();
        
        const order = await Order.findOne({
            _id: req.params.orderId,
            userId: req.session.userId
        });
        
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }
        
        res.json({ order });
    } catch (error) {
        console.error('Get order error:', error);
        res.status(500).json({ error: 'Failed to get order' });
    }
});


app.use(express.static(path.join(__dirname, 'public')));
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`);
    server.close(() => {
        process.exit(1);
    });
});

const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    server.close(() => {
        console.log('Process terminated');
    });
});

process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    server.close(() => {
        console.log('Process terminated');
    });
});
