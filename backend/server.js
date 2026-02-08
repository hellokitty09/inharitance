const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

// Import routes
const complaintsRoutes = require('./routes/complaints');
const analyticsRoutes = require('./routes/analytics');
const adminRoutes = require('./routes/admin');
const usersRoutes = require('./routes/users');

// Import database initialization
const { initDatabase } = require('./config/database');
const socketEvents = require('./config/socketEvents');

const app = express();
const PORT = process.env.PORT || 4000;

// Create HTTP server for Socket.io
const server = http.createServer(app);

// Initialize Socket.io with CORS
const io = new Server(server, {
    cors: {
        origin: "*", // Allow all origins for socket
        methods: ['GET', 'POST', 'PATCH', 'DELETE'],
        credentials: true
    }
});

// Make io accessible to routes
app.set('io', io);

// ============ MIDDLEWARE ============
app.use(helmet());
app.use(cors({
    origin: true, // Allow all origins
    credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());

// ============ SOCKET.IO CONNECTION HANDLING ============
io.on(socketEvents.CONNECTED, (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    // Send current stats on connection
    socket.emit(socketEvents.STATS_UPDATE, {
        message: 'Connected to real-time updates',
        timestamp: new Date().toISOString()
    });

    socket.on(socketEvents.DISCONNECTED, () => {
        console.log(`🔌 Client disconnected: ${socket.id}`);
    });
});

// ============ ROUTES ============
app.use('/api/complaints', complaintsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', usersRoutes);

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        service: 'Inheritance Backend API',
        realtime: true,
        connectedClients: io.engine.clientsCount,
        timestamp: new Date().toISOString()
    });
});

// API info
app.get('/api', (req, res) => {
    res.json({
        name: 'Inheritance Backend API',
        version: '1.0.0',
        realtime: true,
        endpoints: {
            complaints: '/api/complaints',
            analytics: '/api/analytics',
            admin: '/api/admin'
        }
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err.message);
    res.status(err.status || 500).json({
        success: false,
        error: err.message || 'Internal Server Error'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found'
    });
});

// ============ START SERVER ============
const startServer = async () => {
    try {
        // Initialize database
        await initDatabase();
        console.log('✅ Database initialized');

        // Use server.listen instead of app.listen for Socket.io
        server.listen(PORT, () => {
            console.log('='.repeat(50));
            console.log(`🚀 Inheritance Backend API running on port ${PORT}`);
            console.log(`🔌 Socket.io real-time updates enabled`);
            console.log('='.repeat(50));
            console.log('Endpoints:');
            console.log(`  📋 Complaints: http://localhost:${PORT}/api/complaints`);
            console.log(`  📊 Analytics:  http://localhost:${PORT}/api/analytics`);
            console.log(`  🔐 Admin:      http://localhost:${PORT}/api/admin`);
            console.log(`  ❤️  Health:     http://localhost:${PORT}/health`);
            console.log('='.repeat(50));
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};

startServer();

module.exports = { app, io };
