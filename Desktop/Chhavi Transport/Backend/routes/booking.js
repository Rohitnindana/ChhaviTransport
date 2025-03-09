const express = require('express');
const router = express.Router();
const bookingController = require('../Controllers/bookingController');
// Booking Model
const Booking = require('../Models/Booking');
// Create a new booking
router.post('/create', bookingController.createBooking);

// Get all bookings
router.get('/all', bookingController.getAllBookings);

// Handle form submission
router.post('/submit-booking', async (req, res) => {
    const { name, phone, pickup, dropoff, date, vehicle, goods } = req.body;

    try {
        // Create a new booking instance
        const newBooking = new Booking({
            name,
            phone,
            pickup,
            dropoff,
            date,
            vehicle,
            goods
        });

        // Save to database
        await newBooking.save();

        // Redirect to a success page (we'll create this later)
        res.redirect('/success');
    } catch (error) {
        console.error('Error submitting booking:', error);
        res.status(500).send('Failed to submit booking');
    }
});

module.exports = router;
