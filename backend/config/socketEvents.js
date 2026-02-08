// Socket.io Event Constants

module.exports = {
    // Complaint events
    COMPLAINT_NEW: 'complaint:new',
    COMPLAINT_UPDATE: 'complaint:update',
    COMPLAINT_DELETE: 'complaint:delete',
    COMPLAINT_BATCH_UPDATE: 'complaint:batch_update',

    // Stats events
    STATS_UPDATE: 'stats:update',
    DASHBOARD_UPDATE: 'dashboard:update',

    // Connection events
    CONNECTED: 'connection',
    DISCONNECTED: 'disconnect'
};
