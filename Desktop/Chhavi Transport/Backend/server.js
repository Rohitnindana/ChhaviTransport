const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('MongoDB Connected'))
.catch((err) => console.error('MongoDB Connection Error:', err));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../Frontend/Public')));

// Session setup
app.use(session({
    secret: process.env.SESSION_SECRET || 'secretkey',
    resave: false,
    saveUninitialized: true,
}));

// Booking schema & model
const bookingSchema = new mongoose.Schema({
    name: String,
    phone: String,
    pickup: String,
    dropoff: String,
    date: String,
    vehicle: String,
    goods: String,
    status: { type: String, default: "Pending" }
});

const Booking = mongoose.model('Booking', bookingSchema);

// Admin credentials
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'password';

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../Frontend/Views/index.html'));
});

app.get('/booking', (req, res) => {
    res.sendFile(path.join(__dirname, '../Frontend/Views/booking.html'));
});

app.post('/submit-booking', async (req, res) => {
    try {
        const newBooking = new Booking(req.body);
        await newBooking.save();
        console.log('Booking saved:', req.body);
        res.redirect('/success');
    } catch (err) {
        console.error('Booking save error:', err);
        res.status(500).send('Failed to save booking');
    }
});

app.get('/success', (req, res) => {
    res.sendFile(path.join(__dirname, '../Frontend/Views/success.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../Frontend/Views/login.html'));
});

app.post('/auth', (req, res) => {
    const { username, password } = req.body;
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        req.session.admin = username;
        res.redirect('/admin');
    } else {
        res.redirect('/login?error=1');
    }
});

app.get('/admin', (req, res) => {
    if (!req.session.admin) {
        return res.redirect('/login');
    }
    res.sendFile(path.join(__dirname, '../Frontend/Views/admin.html'));
});

app.get('/api/bookings', async (req, res) => {
    try {
        const bookings = await Booking.find();
        res.json(bookings);
    } catch (err) {
        console.error('Error fetching bookings:', err);
        res.status(500).json({ error: 'Failed to load bookings' });
    }
});

app.get('/api/stats', async (req, res) => {
    try {
        const total = await Booking.countDocuments();
        const pending = await Booking.countDocuments({ status: "Pending" });
        const completed = await Booking.countDocuments({ status: "Completed" });
        res.json({ total, pending, completed });
    } catch (err) {
        console.error('Error fetching stats:', err);
        res.status(500).json({ error: 'Failed to load stats' });
    }
});

app.post('/update-status/:id', async (req, res) => {
    try {
        await Booking.findByIdAndUpdate(req.params.id, { status: "Completed" });
        res.redirect('/admin');
    } catch (err) {
        console.error('Error updating booking status:', err);
        res.status(500).send('Failed to update status');
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/login');
    });
});

app.post('/delete-booking/:id', async (req, res) => {
    try {
        await Booking.findByIdAndDelete(req.params.id);
        res.redirect('/admin');
    } catch (err) {
        console.error('Error deleting booking:', err);
        res.status(500).send('Failed to delete booking');
    }
});

app.post('/update-booking/:id', async (req, res) => {
    try {
        await Booking.findByIdAndUpdate(req.params.id, req.body);
        res.redirect('/admin');
    } catch (err) {
        console.error('Error updating booking:', err);
        res.status(500).send('Failed to update booking');
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
