# ML Server - Accident Detection

This is the FastAPI-based ML server for accident image classification.

## Setup

### 1. Install Dependencies

```bash
# Create virtual environment (recommended)
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Ensure Model File Exists

Make sure `cnn_accident_model.pth` is present in the `ml-server` directory.

### 3. Start the Server

**Option 1: Using the startup script**
```bash
chmod +x start.sh
./start.sh
```

**Option 2: Manual start**
```bash
# Activate virtual environment first
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Start server
uvicorn accident_classifier:app --host 0.0.0.0 --port 8000 --reload
```

The server will start on `http://localhost:8000`

## API Endpoints

### Health Check
- **GET** `/` - Returns server status

### Prediction
- **POST** `/predict` - Classify an accident image
  - **Request Body:**
    ```json
    {
      "image_url": "https://example.com/image.jpg"
    }
    ```
  - **Response:**
    ```json
    {
      "prediction": "accident" | "not accident",
      "confidence": 0.95,
      "probabilities": [0.95, 0.05]
    }
    ```

## API Documentation

Once the server is running, visit:
- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc

## Configuration

The server runs on port `8000` by default. To change the port:

```bash
uvicorn accident_classifier:app --host 0.0.0.0 --port <YOUR_PORT>
```

## Troubleshooting

1. **Port already in use:** Change the port or stop the process using port 8000
2. **Model file not found:** Ensure `cnn_accident_model.pth` is in the ml-server directory
3. **Dependencies error:** Make sure you're using Python 3.8+ and have installed all requirements

