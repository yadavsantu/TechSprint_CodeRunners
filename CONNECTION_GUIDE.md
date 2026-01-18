# ML Server and Backend Connection Guide

This guide explains how to connect the ML server (Python/FastAPI) with the Backend server (Node.js/Express).

## Architecture Overview

```
Frontend → Backend (Node.js) → ML Server (Python/FastAPI)
```

The backend makes HTTP requests to the ML server when an accident is reported with images.

## Prerequisites

1. **Python 3.8+** installed
2. **Node.js** installed
3. **Model file** (`cnn_accident_model.pth`) in `ml-server/` directory

## Setup Steps

### 1. Start the ML Server

Navigate to the `ml-server` directory and start the server:

```bash
cd ml-server

# Option 1: Use the startup script
chmod +x start.sh
./start.sh

# Option 2: Manual start
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn accident_classifier:app --host 0.0.0.0 --port 8000 --reload
```

The ML server will run on `http://localhost:8000`

**Verify it's running:**
- Visit http://localhost:8000 - Should see `{"message": "Accident Detection ML Server Running"}`
- Visit http://localhost:8000/docs - Should see Swagger API documentation

### 2. Install Backend Dependencies

Navigate to the `backend` directory:

```bash
cd backend
npm install
```

This will install `axios` and other dependencies needed to communicate with the ML server.

### 3. Configure Backend Environment Variables

Create a `.env` file in the `backend` directory (if it doesn't exist):

```bash
# .env file
ML_SERVER_URL=http://localhost:8000
ML_ENABLED=true
ML_TIMEOUT=30000
PORT=5000
```

**Configuration Options:**
- `ML_SERVER_URL`: URL of the ML server (default: `http://localhost:8000`)
- `ML_ENABLED`: Enable/disable ML classification (default: `true`)
- `ML_TIMEOUT`: Request timeout in milliseconds (default: `30000` = 30 seconds)

### 4. Start the Backend Server

```bash
cd backend
npm start
# or
npm run dev
```

The backend will run on `http://localhost:5000` (or the port specified in your `.env`)

## How It Works

1. **User reports an accident** via the frontend with images
2. **Backend receives the request** at `/api/v1/accident/report`
3. **Accident is saved** to the database with status "pending"
4. **ML classification is triggered** asynchronously:
   - Backend calls `classifyAccident(accidentId)`
   - Service sends image URL to ML server at `/predict`
   - ML server processes the image and returns prediction
   - Backend updates accident status:
     - `"verified"` if prediction is "accident"
     - `"rejected"` if prediction is "not accident"

## Testing the Connection

### Test ML Server Directly

```bash
curl -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '{"image_url": "https://example.com/accident-image.jpg"}'
```

### Test Backend → ML Server Connection

1. Report an accident through your frontend with an image
2. Check backend logs - you should see:
   ```
   ML classifyAccident called for ID: <accident_id>
   Accident found, sending image to ML: <image_url>
   ML prediction: accident (confidence: 0.95)
   Accident <accident_id> → VERIFIED
   ```

## Troubleshooting

### ML Server Not Responding

**Error:** `ECONNREFUSED` or `ETIMEDOUT`

**Solutions:**
1. Verify ML server is running: `curl http://localhost:8000`
2. Check if port 8000 is available: `lsof -i :8000`
3. Verify `ML_SERVER_URL` in backend `.env` matches ML server URL
4. Check firewall settings

### ML Server Returns Error

**Error:** `Failed to open image` or model errors

**Solutions:**
1. Ensure image URL is accessible (not behind authentication)
2. Verify model file exists: `ls ml-server/cnn_accident_model.pth`
3. Check ML server logs for detailed error messages
4. Verify image format is supported (JPG, PNG, etc.)

### Backend Can't Find ML Service

**Error:** `Cannot find module '../services/mlServices'`

**Solutions:**
1. Verify `mlServices.js` exists in `backend/services/`
2. Run `npm install` to ensure all dependencies are installed
3. Check file paths are correct

### ML Classification Not Triggering

**Check:**
1. Verify `ML_ENABLED=true` in backend `.env`
2. Ensure accident has at least one image
3. Check backend logs for any errors
4. Verify accident controller is calling `classifyAccident()`

## Production Deployment

### ML Server

1. Use a production ASGI server:
   ```bash
   pip install gunicorn
   gunicorn accident_classifier:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
   ```

2. Use environment variables for configuration
3. Set up proper logging and monitoring
4. Consider using a reverse proxy (nginx) for SSL

### Backend

1. Update `ML_SERVER_URL` in production `.env` to point to production ML server
2. Add retry logic for ML requests
3. Implement proper error handling and fallbacks
4. Monitor ML server health and response times

## File Structure

```
TechSprint_CodeRunners/
├── ml-server/
│   ├── accident_classifier.py    # FastAPI ML server
│   ├── cnn_accident_model.pth    # Trained model
│   ├── requirements.txt          # Python dependencies
│   ├── start.sh                  # Startup script
│   └── README.md                 # ML server docs
│
├── backend/
│   ├── config/
│   │   └── ml.config.js          # ML server configuration
│   ├── services/
│   │   └── mlServices.js         # ML service integration
│   ├── controllers/
│   │   └── accidentController.js # Calls ML service
│   └── package.json              # Includes axios dependency
│
└── CONNECTION_GUIDE.md           # This file
```

## Additional Notes

- ML classification runs **asynchronously** - it doesn't block the API response
- If ML server is unavailable, the accident remains in "pending" status
- Confidence scores are stored in the accident document (`mlConfidence` field)
- You can disable ML classification by setting `ML_ENABLED=false` in `.env`

