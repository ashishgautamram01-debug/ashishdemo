require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Movie = require('./models/Movie');
const Showtime = require('./models/Showtime');
const Booking = require('./models/Booking');
const User = require('./models/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/imovies';

const generateSeats = (rows = ['A', 'B', 'C', 'D'], cols = 6) => {
  const seats = [];
  rows.forEach(row => {
    for (let c = 1; c <= cols; c++) {
      seats.push({
        seatNumber: `${row}${c}`,
        isBooked: false
      });
    }
  });
  return seats;
};

const moviesData = [
  {
    title: 'Inception',
    description: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.',
    genre: 'Sci-Fi / Action',
    duration: 148,
    poster: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&auto=format&fit=crop&q=80'
  },
  {
    title: 'Interstellar',
    description: 'When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot, Joseph Cooper, is tasked to pilot a spacecraft along with a team of researchers.',
    genre: 'Sci-Fi / Adventure',
    duration: 169,
    poster: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=80'
  },
  {
    title: 'The Dark Knight',
    description: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests.',
    genre: 'Action / Crime / Drama',
    duration: 152,
    poster: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80'
  },
  {
    title: 'Dune: Part Two',
    description: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.',
    genre: 'Sci-Fi / Adventure',
    duration: 166,
    poster: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80'
  }
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB for seeding...');

    await Promise.all([
      Movie.deleteMany({}),
      Showtime.deleteMany({}),
      Booking.deleteMany({}),
      User.deleteMany({})
    ]);
    console.log('Cleared existing data.');

    // Seed Demo User
    const hashedPassword = await bcrypt.hash('password123', 10);
    const demoUser = await User.create({
      name: 'Demo Cinephile',
      email: 'user@example.com',
      password: hashedPassword
    });
    console.log(`Demo user created: ${demoUser.email} (password: password123)`);

    // Seed Movies
    const createdMovies = await Movie.insertMany(moviesData);
    console.log(`Seeded ${createdMovies.length} movies.`);

    // Seed Showtimes
    const screens = ['IMAX Theater', 'Screen 1 (Dolby Atmos)', 'Screen 2'];
    const now = new Date();

    for (const movie of createdMovies) {
      // Create 3 showtimes per movie: Today 18:00, Tomorrow 14:00, Tomorrow 20:00
      const showtimeConfigs = [
        { hoursAhead: 2, screen: screens[0], price: 15.00 },
        { hoursAhead: 24, screen: screens[1], price: 12.50 },
        { hoursAhead: 30, screen: screens[2], price: 12.00 }
      ];

      for (const config of showtimeConfigs) {
        const showtimeDate = new Date(now.getTime() + config.hoursAhead * 60 * 60 * 1000);
        const seats = generateSeats();

        // Randomly pre-book 2-3 seats for realism
        seats[2].isBooked = true; // A3
        seats[7].isBooked = true; // B2

        await Showtime.create({
          movie: movie._id,
          dateTime: showtimeDate,
          screen: config.screen,
          price: config.price,
          seats
        });
      }
    }

    console.log('Seeded showtimes with seating layouts.');
    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seed();
