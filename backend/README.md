# Inheritance Backend API

Backend service for the Inheritance political funding transparency platform.

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Start production server
npm start
```

## API Endpoints

### Health Check
- `GET /health` - Server status

### Complaints API
- `GET /api/complaints` - List all complaints
- `GET /api/complaints/:id` - Get single complaint
- `POST /api/complaints` - Submit anonymous complaint
- `PATCH /api/complaints/:id/status` - Update status
- `DELETE /api/complaints/:id` - Delete complaint

### Analytics API
- `GET /api/analytics/overview` - Dashboard stats
- `GET /api/analytics/donations` - Donation trends
- `GET /api/analytics/parties` - Party-wise breakdown
- `GET /api/analytics/regions` - Regional stats

### Admin API
- `POST /api/admin/verify` - Verify wallet signature
- `GET /api/admin/complaints` - Admin complaint view
- `PATCH /api/admin/complaints/batch` - Batch update
- `GET /api/admin/dashboard` - Admin dashboard
- `GET /api/admin/export` - Export complaints

## Environment Variables

Create a `.env` file:
```
PORT=5000
NODE_ENV=development
```

## Testing

```bash
# Submit a test complaint
curl -X POST http://localhost:5000/api/complaints \
  -H "Content-Type: application/json" \
  -d '{"category":"corruption","description":"Test complaint"}'

# Get all complaints
curl http://localhost:5000/api/complaints
```
