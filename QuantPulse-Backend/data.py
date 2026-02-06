import yfinance as yf
import pandas as pd

# Top 10 NSE Tickers (can be expanded to 50)
tickers = ["RELIANCE.NS", "TCS.NS", "HDFCBANK.NS", "INFY.NS", "ICICIBANK.NS", 
           "BHARTIARTL.NS", "ITC.NS", "SBIN.NS", "LT.NS", "HCLTECH.NS"]

def download_data():
    print("Downloading historical data...")
    # Downloading 2 years of daily data
    data = yf.download(tickers, period="2y", interval="1d")['Close']
    data.to_csv("market_data.csv")
    print("Saved to market_data.csv")

if __name__ == "__main__":
    download_data()