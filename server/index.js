require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const multer = require('multer');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));
app.use(express.json());

// Database Connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

// File Upload Configuration
const storage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// User Model
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  token: { type: String, unique: true },
  createdAt: { type: Date, default: Date.now }
});

userSchema.pre("save", function(next) {
  if (!this.token) {
    this.token = crypto.randomBytes(32).toString("hex");
  }
  next();
});

const User = mongoose.model('User', userSchema);

// Location Model with Image
const locationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  state: { type: String, required: true },
  lat: { type: Number, required: true },
  lon: { type: Number, required: true },
  windSpeed: { type: Number, required: true },
  image: {
    data: Buffer,
    contentType: String
  },
  nearestStation: {
    name: { type: String, required: true },
    address: { type: String, required: true },
    distance: { type: Number, required: true }
  },
  timestamp: { type: Date, default: Date.now }
});

const Location = mongoose.model('Location', locationSchema);

// Authentication Middleware
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authorization required' });
    }

    const token = authHeader.split(' ')[1];
    const user = await User.findOne({ token });
    if (!user) return res.status(401).json({ message: 'Invalid token' });

    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Routes
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({
      message: 'User created successfully',
      token: newUser.token,
      user: { id: newUser._id, username, email }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    res.json({
      message: 'Login successful',
      token: user.token,
      user: { id: user._id, username: user.username, email }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/auth/me', authenticate, (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      username: req.user.username,
      email: req.user.email
    }
  });
});

// Updated Location Route with Image Upload
app.post('/api/locations', authenticate, upload.single('image'), async (req, res) => {
  try {
    const locationData = {
      userId: req.user._id,
      ...req.body,
      timestamp: new Date()
    };

    if (req.file) {
      locationData.image = {
        data: req.file.buffer,
        contentType: req.file.mimetype
      };
    }

    const requiredFields = ['name', 'state', 'lat', 'lon'];
    const missingFields = requiredFields.filter(field => !locationData[field]);
    if (missingFields.length > 0) {
      return res.status(400).json({
        message: 'Missing required fields',
        missing: missingFields
      });
    }

    const newLocation = new Location(locationData);
    await newLocation.save();

    res.status(201).json({
      message: 'Location saved successfully',
      location: newLocation
    });
  } catch (error) {
    console.error('Location save error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Image Retrieval Endpoint
app.get('/api/locations/image/:id', async (req, res) => {
  try {
    const location = await Location.findById(req.params.id);
    
    if (!location || !location.image || !location.image.data) {
      return res.status(404).json({ message: 'Image not found' });
    }

    res.set('Content-Type', location.image.contentType);
    res.send(location.image.data);
  } catch (error) {
    console.error('Image retrieval error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/locations', async (req, res) => {
  try {
    const locations = await Location.find()
      .populate('userId', 'username')
      .select('-image.data'); // Exclude image buffer but keep other fields

    res.json(locations.map(location => ({
      id: location._id, // Add ID field
      username: location.userId.username,
      name: location.name,
      state: location.state,
      lat: location.lat,
      lon: location.lon,
      windSpeed: location.windSpeed,
      hasImage: !!location.image.contentType, // Add image existence check
      nearestStation: {
        name: location.nearestStation.name,
        address: location.nearestStation.address,
        distance: location.nearestStation.distance
      },
      timestamp: location.timestamp.toISOString().split('T')[0]
    })));
  } catch (error) {
    console.error('Error fetching locations:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


// Error Handling
app.use((req, res) => res.status(404).json({ message: 'Route not found' }));
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
