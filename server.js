// server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Import Routes
const authRoutes = require('./routes/auth');
const loanRoutes = require('./routes/loans');
const adminRoutes = require('./routes/admin');

const app = express();

// ===== Middleware =====
app.use(cors());
app.use(express.json()); // Parse JSON bodies

// ===== Routes =====
app.get('/', (req, res) => {
  res.send('💰 Finance Project API is running...');
});

app.use('/api/auth', authRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/admin', adminRoutes);

// ===== Database Connection =====
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('✅ MongoDB Connected Successfully'))
  .catch((err) => {
    console.error('❌ MongoDB Connection Error:', err.message);
    process.exit(1); // Stop app if DB connection fails
  });

// ===== Server Start =====
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running at http://localhost:${PORT}`)
);
