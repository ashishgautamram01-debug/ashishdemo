const express = require('express');
const router = express.Router();
const Showtime = require('../models/Showtime');

// GET /api/showtimes/:id
router.get('/:id', async (req, res) => {
  try {
    const showtime = await Showtime.findById(req.params.id).populate('movie');
    if (!showtime) {
      return res.status(404).json({ message: 'Showtime not found' });
    }
    res.json(showtime);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

module.exports = router;
