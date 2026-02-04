# QuantPulse India Backend

Backend API service for QuantPulse India stock analytics platform.

## 📁 Project Structure

```
quantpulse-backend/
├── app/
│   ├── __init__.py       # Package marker
│   ├── config.py         # Configuration settings
│   ├── main.py           # FastAPI application entry point
│   └── routers/
│       ├── __init__.py   # Routers package marker
│       └── health.py     # Health check endpoints
├── requirements.txt      # Python dependencies
├── run.py               # Server startup script
└── README.md            # This file
```

## 🚀 Getting Started

### 1. Create Virtual Environment (Recommended)

```bash
cd quantpulse-backend
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Run the Server

```bash
python run.py
```

Or using uvicorn directly:

```bash
uvicorn app.main:app --reload --port 8000
```

## 📚 API Endpoints

| Method | Endpoint  | Description                    |
|--------|-----------|--------------------------------|
| GET    | `/`       | Welcome message                |
| GET    | `/health` | Health check                   |
| GET    | `/docs`   | Swagger UI documentation       |
| GET    | `/redoc`  | ReDoc documentation            |

## 🔧 Configuration

Edit `app/config.py` to modify:
- Allowed CORS origins
- Server host/port
- Application metadata

## 🛣️ Future Roadmap

- [ ] Stock data API (`/api/stocks`)
- [ ] News sentiment API (`/api/news`)
- [ ] AI predictions API (`/api/predictions`)
- [ ] Database integration
- [ ] Authentication

<!-- Railway deployment optimized for Python 3.11.9 -->