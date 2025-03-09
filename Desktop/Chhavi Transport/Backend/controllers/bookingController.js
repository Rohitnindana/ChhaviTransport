const Booking = require('../Models/Booking');

// Add a new booking
exports.createBooking = async (req, res) => {
    try {
        const { name, phone, pickupLocation, dropLocation, date } = req.body;
        
        // Basic validation
        if (!name || !phone || !pickupLocation || !dropLocation || !date) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Create and save booking
        const newBooking = new Booking({ name, phone, pickupLocation, dropLocation, date });
        await newBooking.save();

        res.status(201).json({ message: 'Booking created successfully', booking: newBooking });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create booking' });
    }
};

// Get all bookings
exports.getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.find();
        res.status(200).json(bookings);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch bookings' });
    }
};
