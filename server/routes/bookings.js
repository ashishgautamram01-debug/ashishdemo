const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Showtime = require('../models/Showtime');
const auth = require('../middleware/auth');

// POST /api/bookings (auth)
router.post('/', auth, async (req, res) => {
  try {
    const { showtimeId, seats } = req.body;

    if (!showtimeId || !Array.isArray(seats) || seats.length === 0) {
      return res.status(400).json({ message: 'showtimeId and at least one seat are required' });
    }

    const showtime = await Showtime.findById(showtimeId).populate('movie');
    if (!showtime) {
      return res.status(404).json({ message: 'Showtime not found' });
    }

    // Verify all requested seats exist in this showtime
    const existingSeatNumbers = new Set(showtime.seats.map(s => s.seatNumber));
    const invalidSeats = seats.filter(s => !existingSeatNumbers.has(s));
    if (invalidSeats.length > 0) {
      return res.status(400).json({ message: `Seats do not exist: ${invalidSeats.join(', ')}` });
    }

    // Atomically check that none of the seats are booked, and mark them booked
    const updatedShowtime = await Showtime.findOneAndUpdate(
      {
        _id: showtimeId,
        seats: {
          $not: {
            $elemMatch: {
              seatNumber: { $in: seats },
              isBooked: true
            }
          }
        }
      },
      {
        $set: {
          'seats.$[elem].isBooked': true
        }
      },
      {
        arrayFilters: [{ 'elem.seatNumber': { $in: seats } }],
        new: true
      }
    );

    if (!updatedShowtime) {
      return res.status(400).json({ message: 'One or more selected seats have already been booked' });
    }

    const totalPrice = (showtime.price || 12) * seats.length;

    const booking = new Booking({
      user: req.user.id,
      showtime: showtimeId,
      seats,
      totalPrice,
      status: 'confirmed'
    });

    await booking.save();
    const populatedBooking = await Booking.findById(booking._id).populate({
      path: 'showtime',
      populate: { path: 'movie' }
    });

    res.status(201).json(populatedBooking);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// GET /api/bookings/me (auth)
router.get('/me', auth, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate({
        path: 'showtime',
        populate: { path: 'movie' }
      })
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// GET /api/bookings/:id (auth)
router.get('/:id', auth, async (req, res) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, user: req.user.id })
      .populate({
        path: 'showtime',
        populate: { path: 'movie' }
      });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// DELETE /api/bookings/:id (auth - cancel booking and free seats)
router.delete('/:id', auth, async (req, res) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, user: req.user.id });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({ message: 'Booking is already cancelled' });
    }

    booking.status = 'cancelled';
    await booking.save();

    // Free the seats in the Showtime document
    await Showtime.updateOne(
      { _id: booking.showtime },
      { $set: { 'seats.$[elem].isBooked': false } },
      { arrayFilters: [{ 'elem.seatNumber': { $in: booking.seats } }] }
    );

    res.json({ message: 'Booking cancelled successfully', booking });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

module.exports = router;
