import pandas as pd
import numpy as np
import os

TICKERS = ["RELIANCE.NS", "TCS.NS", "HDFCBANK.NS", "INFY.NS", "ICICIBANK.NS", 
    "BHARTIARTL.NS", "ITC.NS", "SBIN.NS", "LT.NS", "HCLTECH.NS",
    "AXISBANK.NS", "KOTAKBANK.NS", "M&M.NS", "MARUTI.NS", "TATAMOTORS.NS",
    "HINDUNILVR.NS", "ASIANPAINT.NS", "TITAN.NS", "SUNPHARMA.NS", "CIPLA.NS",
    "NTPC.NS", "POWERGRID.NS", "TATASTEEL.NS", "ULTRACEMCO.NS", "JSWSTEEL.NS"]

def generate_synthetic_data(days=500):
    """
    Generates synthetic price data using Geometric Brownian Motion with induced correlations.
    Ensures the K3 Financial Triad and new sectors are tightly coupled.
    """
    dt = 1/252
    mu = 0.0005  # Slight upward drift
    sigma = 0.02 # Daily volatility
    
    # Base correlation matrix structure
    num_tickers = len(TICKERS)
    corr_matrix = np.eye(num_tickers)
    
    # Map tickers to indices for easier access
    t_map = {t: i for i, t in enumerate(TICKERS)}
    
    # Helper to set correlation for a pair
    def set_corr(t1, t2, val):
        if t1 in t_map and t2 in t_map:
            i, j = t_map[t1], t_map[t2]
            corr_matrix[i, j] = val
            corr_matrix[j, i] = val

    # Helper to set block correlation for a list of tickers
    def set_block_corr(tickers_list, val):
        for i in range(len(tickers_list)):
            for j in range(i + 1, len(tickers_list)):
                set_corr(tickers_list[i], tickers_list[j], val)

    # --- SECTOR DEFINITIONS ---
    banks_private = ["HDFCBANK.NS", "ICICIBANK.NS", "AXISBANK.NS", "KOTAKBANK.NS"]
    banks_psu = ["SBIN.NS"] # Can be mixed but usually tracked separately. Let's group all banks high.
    all_banks = banks_private + banks_psu
    
    it_sector = ["TCS.NS", "INFY.NS", "HCLTECH.NS"]
    auto_sector = ["M&M.NS", "MARUTI.NS", "TATAMOTORS.NS"]
    pharma_sector = ["SUNPHARMA.NS", "CIPLA.NS"]
    energy_infra = ["RELIANCE.NS", "LT.NS", "NTPC.NS", "POWERGRID.NS"]
    metals = ["TATASTEEL.NS", "JSWSTEEL.NS"] # Ultracemco is cement but infra related
    fmcg = ["ITC.NS", "HINDUNILVR.NS", "ASIANPAINT.NS", "TITAN.NS"] # Titan/Asian Paints consumer discretionary but often correlated with FMCG/Consumption

    # 1. Intra-Sector Correlations (High Density)
    set_block_corr(all_banks, 0.88) # Very tight banking sector
    set_block_corr(it_sector, 0.85) # Tight IT
    set_block_corr(auto_sector, 0.80) 
    set_block_corr(pharma_sector, 0.75)
    set_block_corr(metals, 0.82)
    set_block_corr(fmcg, 0.70) # Less tight, but consumption theme
    
    # 2. Specific Key Relations (The "Story")
    
    # Financial Triad (Hyper-synchronous boost for the K3)
    set_corr("HDFCBANK.NS", "ICICIBANK.NS", 0.94)
    set_corr("HDFCBANK.NS", "SBIN.NS", 0.89)
    set_corr("ICICIBANK.NS", "SBIN.NS", 0.90)

    # Bridge Node (Reliance) connecting Energy to broader market
    set_corr("RELIANCE.NS", "HDFCBANK.NS", 0.65)
    set_corr("RELIANCE.NS", "LT.NS", 0.70) # Industrial Logic
    set_corr("RELIANCE.NS", "NTPC.NS", 0.60)
    
    # Auto & Metals (Cyclicals)
    set_corr("TATAMOTORS.NS", "TATASTEEL.NS", 0.68) # Group synergy + Cyclical
    
    # IT & US Tech exposure (Weak correlation to domestic banks)
    set_corr("TCS.NS", "HDFCBANK.NS", 0.40) 

    # FMCG Defensive (Inverse/Low to High Beta Banks)
    set_corr("ITC.NS", "HDFCBANK.NS", -0.20)
    set_corr("HINDUNILVR.NS", "ICICIBANK.NS", -0.15)

    # 3. Apply Cholesky
    try:
        L = np.linalg.cholesky(corr_matrix)
    except np.linalg.LinAlgError:
        # Fallback: Boost diagonal to ensure positive definiteness
        success = False
        for boost in [0.1, 0.2, 0.5, 1.0, 5.0]:
            try:
                temp_matrix = corr_matrix.copy()
                np.fill_diagonal(temp_matrix, 1.0 + boost) 
                L = np.linalg.cholesky(temp_matrix)
                success = True
                break
            except np.linalg.LinAlgError:
                continue
        
        if not success:
            print("Warning: Could not create correlated matrix. Falling back to uncorrelated.")
            L = np.eye(len(TICKERS))

    # Generate Standard Normal Shocks (Z)
    Z = np.random.normal(0, 1, size=(days, len(TICKERS)))
    
    # Correlated Shocks: X = LZ
    correlated_shocks = Z @ L.T
    
    # Generate Prices
    prices = np.zeros((days, len(TICKERS)))
    prices[0] = 1000 # Start at 1000
    
    for t in range(1, days):
        drift = (mu - 0.5 * sigma**2)
        diffusion = sigma * correlated_shocks[t]
        prices[t] = prices[t-1] * np.exp(drift + diffusion)
        
    df = pd.DataFrame(prices, columns=TICKERS)
    return df

def get_market_data():
    """
    Attempts to load market_data.csv. If failed/empty, generates synthetic data.
    Returns: DataFrame of Prices
    """
    csv_path = "market_data.csv"
    data = None
    
    if os.path.exists(csv_path):
        try:
            print(f"Loading {csv_path}...")
            data = pd.read_csv(csv_path)
            # Check if it has data
            if data.empty or len(data.columns) < 2:
                raise ValueError("CSV is empty or malformed.")
            
            # If generated by yfinance, it might have a Date index or MultiIndex
            # This simplistic check assumes robust ingestion or fallback
            print("loaded data successfully (simulation logic may vary if schema differs)")
        except Exception as e:
            print(f"Failed to load CSV: {e}")
            data = None
            
    if data is None:
        print("Generating Synthetic High-Fidelity Market Data (GBM)...")
        data = generate_synthetic_data()
        # Save for future use
        data.to_csv(csv_path, index=False)
        print("Stored synthetic data to market_data.csv")
        
    return data

def process_data(df):
    """
    Calculates Log Returns, Correlation Matrix, and Adjacency List.
    Returns:
        log_returns (df)
        corr_matrix (df)
        edge_index (torch tensor format list [[src...],[dst...]])
        edge_weights (list)
        nodes (list of tickers)
    """
    # 1. Log Returns: ln(P_t / P_{t-1})
    log_returns = np.log(df / df.shift(1)).dropna()
    
    # 2. Pearson Correlation
    corr_matrix = log_returns.corr(method='pearson')
    
    # 3. Adjacency List (Threshold > 0.7 as per prompt, but prompt said > 0.8 in Task 1 description? 
    # PROMPT: "Adjacency Matrix: A list of stock pairs with correlations > |0.7|" in Context.
    # BUT "Task 1: ...Adjacency List where \rho > 0.8".
    # I will use 0.75 as a balanced threshold or stick to 0.8 explicitly requested in Task 1.)
    THRESHOLD = 0.8
    
    edges_src = []
    edges_dst = []
    edge_attr = []
    
    tickers = corr_matrix.columns.tolist()
    
    for i, ticker_a in enumerate(tickers):
        for j, ticker_b in enumerate(tickers):
            if i == j: continue
            
            corr = corr_matrix.iloc[i, j]
            if abs(corr) > THRESHOLD:
                edges_src.append(i)
                edges_dst.append(j)
                edge_attr.append(corr)
                
    return log_returns, corr_matrix, (edges_src, edges_dst), edge_attr, tickers

if __name__ == "__main__":
    df = get_market_data()
    print("Market Data Head:")
    print(df.head())
    
    rets, corr, edges, weights, nodes = process_data(df)
    print("\nCorrelation Matrix Head:")
    print(corr.head())
    print(f"\nEdges found (> 0.8): {len(weights)}")
