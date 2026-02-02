# QuantPulse India

QuantPulse India is a full-stack web application for analyzing Indian NSE stocks using market data, technical indicators, and news sentiment.
This repository contains both the frontend and backend required to run the project locally or deploy it.

This README focuses on how to set up, configure, and run the project.

---

## Repository Structure

QuantPulse
├── QuantPulse-Frontend
├── QuantPulse-Backend
├── .gitignore
├── README.md
└── ATTRIBUTIONS.md

---

## Tech Stack

Frontend
- React
- TypeScript
- Vite
- Tailwind CSS
- Charting libraries

Backend
- REST API
- News API integration
- Market data services
- Sentiment analysis logic

---

## Environment Variables

Backend (QuantPulse-Backend/.env)

Create a .env file inside the backend folder with the following:

NEWS_API_KEY=your_news_api_key_here

This file must NOT be committed to GitHub.

---

Frontend (QuantPulse-Frontend/.env)

Only public variables should be placed here:

VITE_API_BASE_URL=http://localhost:8000

All frontend environment variables must start with VITE_.

---

## Running the Project Locally

### 1) Clone the Repository

git clone https://github.com/your-username/quantpulse.git
cd QuantPulse

---

### 2) Run the Backend

Navigate to the backend folder:

cd QuantPulse-Backend

If using Node.js:

npm install
npm start

If using Python / FastAPI:

pip install -r requirements.txt
uvicorn main:app --reload

Backend will run at:
http://localhost:8000

Test it by opening:
http://localhost:8000/stock/TCS

---

### 3) Run the Frontend

Open a new terminal and navigate to the frontend folder:

cd QuantPulse-Frontend

Install dependencies:

npm install

Start the development server:

npm run dev

Frontend will run at:
http://localhost:5173

---

## Frontend ↔ Backend Connection

The frontend communicates with the backend using the base URL defined in:

QuantPulse-Frontend/.env

Example:

VITE_API_BASE_URL=http://localhost:8000

Make sure the backend is running before opening the frontend.

---

## Demo & Data Notes

- Market data may be delayed or simulated
- News sentiment is derived from recent articles
- Confidence values are calculated using explainable logic
- This project is intended for learning, demonstration, and prototyping

---

## Deployment Notes

Recommended setup:
- Frontend: Vercel or Netlify
- Backend: Render or Railway

Before deployment:
- Update VITE_API_BASE_URL to the hosted backend URL
- Restrict CORS on the backend to the frontend domain
- Set environment variables on the hosting platform

---

## Disclaimer

This application is not financial advice.
All analytics and predictions are for educational purposes only.

---

## Common Issues

- CORS errors: Ensure backend allows the frontend domain
- vite not found: Run commands inside QuantPulse-Frontend
- Missing API key: Ensure backend .env is set correctly

---

## Future Improvements

- User authentication
- Persistent database
- Historical backtesting
- Advanced indicators (RSI, MACD)
- Real-time updates

---

## Contributing

Contributions and suggestions are welcome.

1. Fork the repository
2. Create a new branch
3. Make your changes
4. Submit a pull request

