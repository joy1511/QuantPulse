import json
import numpy as np
import pandas as pd
import sys
import os

# Try imports
try:
    import torch
    import torch.optim as optim
    from model import GCN
    TORCH_AVAILABLE = True
except ImportError:
    print("Warning: PyTorch/Geometric not found. Running in 'Heuristic Mode' to generate graph data.")
    TORCH_AVAILABLE = False

from data_processor import get_market_data, process_data

def train_gnn():
    print("Initializing Analysis Pipeline...")
    
    # 1. Load Data
    df = get_market_data()
    log_returns, corr_matrix, (rows, cols), weights, tickers = process_data(df)
    
    # Calculate Volatility (Risk)
    # Annualized Volatility
    volatility = log_returns.std() * np.sqrt(252)
    
    model = None
    
    if TORCH_AVAILABLE:
        try:
            # 2. Prepare Graph Data
            window = 30
            if len(log_returns) > window:
                node_features = log_returns.iloc[-window:].T.values
            else:
                node_features = log_returns.T.values
                
            x = torch.tensor(node_features, dtype=torch.float)
            edge_index = torch.tensor([rows, cols], dtype=torch.long)
            
            # Target
            y = torch.tensor(volatility.values, dtype=torch.float).view(-1, 1)
            
            # 3. Initialize Model
            model = GCN(num_node_features=x.shape[1], hidden_channels=32, num_classes=1)
            optimizer = optim.Adam(model.parameters(), lr=0.01)
            criterion = torch.nn.MSELoss()
            
            # 4. Train Loop
            model.train()
            print("Training GNN for 100 epochs...")
            for epoch in range(101):
                optimizer.zero_grad()
                out = model(x, edge_index)
                loss = criterion(out, y)
                loss.backward()
                optimizer.step()
                
                if epoch % 20 == 0:
                    print(f"Epoch {epoch} | Loss: {loss.item():.4f}")
                    
            # 5. Save Weights
            torch.save(model.state_dict(), "quantpulse_gnn.pt")
            print("Model saved to quantpulse_gnn.pt")
            
        except Exception as e:
            print(f"GNN Training failed ({e}). Falling back to statistical metrics.")
            model = None
    else:
        print("Skipping GNN training (Libraries missing). Using statistical volatility.")
    
    return model, tickers, corr_matrix, volatility

def simulate_domino_effect(trigger_ticker, tickers, corr_matrix, threshold=0.65):
    """
    Simulates shock propagation given a high correlation network.
    """
    if trigger_ticker not in tickers:
        return []
        
    impacts = []
    
    # corr_matrix is a DataFrame
    if trigger_ticker not in corr_matrix.columns:
        return []

    corrs = corr_matrix[trigger_ticker]
    
    for other in tickers:
        if other == trigger_ticker: continue
        
        rho = corrs[other]
        if rho > threshold:
            impacts.append({
                "ticker": other,
                "correlation": round(rho, 4),
                "predicted_impact": "High" if rho > 0.8 else "Medium"
            })
            
    # Sort by correlation desc
    impacts.sort(key=lambda x: x["correlation"], reverse=True)
    return impacts[:3] # Top 3

import networkx as nx

def generate_graph_data_json(model, tickers, corr_matrix, volatilities):
    """
    Constructs graphData.json using a Hybrid MST + High-Density Topology.
    """
    nodes = []
    links = []
    
    # Create NetworkX graph
    G = nx.Graph()
    
    # Add nodes
    for t in tickers:
        G.add_node(t)

    # 1. MST Backbone Construction
    # proper distance metric: d = sqrt(2(1 - rho))
    # Correlation ranges -1 to 1.
    # We only care about positive correlation for "distance" in this context usually, 
    # but strictly d = sqrt(2*(1-rho)) works for all.
    # However, for financial markets, usually we care about |rho|.
    # Let's use distance based on absolute correlation to ensure connectivity even if negative correlation (hedges) are strong?
    # Prompt says: d_{ij} = \sqrt{2(1 - \rho_{ij})}
    
    # We need a complete graph first to find MST
    complete_graph = nx.Graph()
    for i, t1 in enumerate(tickers):
        for j, t2 in enumerate(tickers):
            if i >= j: continue
            rho = corr_matrix.loc[t1, t2]
            # MST minimizes weight. High correlation = Low distance.
            # Using the formula provided:
            dist = np.sqrt(2 * (1 - rho))
            complete_graph.add_edge(t1, t2, weight=dist, correlation=rho)
            
    mst = nx.minimum_spanning_tree(complete_graph, weight='weight')
    
    # Add MST edges to final graph
    for u, v, data in mst.edges(data=True):
        if not G.has_edge(u, v):
            G.add_edge(u, v, weight=data['correlation'], type='MST')

    # 2. Add High-Density Overlay (> 0.72)
    STRONG_THRESHOLD = 0.72
    for i, t1 in enumerate(tickers):
        for j, t2 in enumerate(tickers):
            if i >= j: continue
            rho = corr_matrix.loc[t1, t2]
            
            if abs(rho) > STRONG_THRESHOLD:
                if not G.has_edge(t1, t2):
                    G.add_edge(t1, t2, weight=rho, type='STRONG')
    
    # 3. Compute Advanced Metrics
    # Eigenvector Centrality
    try:
        eigen_centrality = nx.eigenvector_centrality_numpy(G, weight='weight')
    except:
        eigen_centrality = {t: 0.5 for t in tickers}
        
    # Betweenness Centrality (Bridge Detection)
    betweenness = nx.betweenness_centrality(G, weight=None) # Unweighted often better for topological bridges
    
    # Spectral Radius (Largest Eigenvalue of Adjacency)
    # Good proxy for "virality" or spread speed
    adj = nx.adjacency_matrix(G).todense()
    try:
        eigenvalues = np.linalg.eigvals(adj)
        spectral_radius = float(np.max(np.abs(eigenvalues)))
    except:
        spectral_radius = 0.0

    # Average Path Length (Market efficiency)
    try:
        avg_path_len = nx.average_shortest_path_length(G)
    except:
        avg_path_len = 0.0 # Graph might not be connected if logic failed, but MST ensures it is.

    # -- Sector Map --
    sector_map = {
        "HDFCBANK.NS": 1, "ICICIBANK.NS": 1, "SBIN.NS": 1, "AXISBANK.NS": 1, "KOTAKBANK.NS": 1, # Finance
        "TCS.NS": 2, "INFY.NS": 2, "HCLTECH.NS": 2, # IT
        "RELIANCE.NS": 3, "LT.NS": 3, "NTPC.NS": 3, "POWERGRID.NS": 3, "TATAMOTORS.NS": 3, "TATASTEEL.NS": 3, "JSWSTEEL.NS": 3, "M&M.NS": 3, "MARUTI.NS": 3, # Infra/Energy/Auto/Metal
        "BHARTIARTL.NS": 4, # Telecom
        "ITC.NS": 5, "HINDUNILVR.NS": 5, "ASIANPAINT.NS": 5, "TITAN.NS": 5, "SUNPHARMA.NS": 5, "CIPLA.NS": 5 # FMCG/Pharma
    }

    # -- Assemble Nodes --
    nodes_out = []
    for t in tickers:
        ec = eigen_centrality.get(t, 0)
        bc = betweenness.get(t, 0)
        vol = float(volatilities[t])
        
        # Risk Score Composite
        risk_score = (vol * 0.4) + (ec * 0.4) + (bc * 0.2)
        
        nodes_out.append({
            "id": t,
            "group": sector_map.get(t, 0),
            "risk_score": round(risk_score, 4),
            "centrality_eigen": round(ec, 4),
            "centrality_between": round(bc, 4),
            "market_cap": "Large"
        })

    # -- Assemble Links --
    links_out = []
    for u, v, data in G.edges(data=True):
        links_out.append({
            "source": u,
            "target": v,
            "value": round(data['weight'], 2),
            "type": data.get('type', 'Standard')
        })

    print(f"Generated Hybrid Graph: {len(nodes_out)} Nodes, {len(links_out)} Edges (MST + Rho > {STRONG_THRESHOLD})")

    # -- Domino Simulation --
    domino_target = "HDFCBANK.NS"
    # Use the Graph structure for propagation
    neighbors = list(G.neighbors(domino_target))
    # Sort neighbors by weight
    neighbors_weighted = []
    for n in neighbors:
        w = G[domino_target][n]['weight']
        neighbors_weighted.append({"ticker": n, "weight": w})
    
    neighbors_weighted.sort(key=lambda x: x['weight'], reverse=True)
    downstream = []
    for item in neighbors_weighted[:3]:
        downstream.append({
            "ticker": item['ticker'],
            "correlation": round(item['weight'], 4),
            "predicted_impact": "High" if item['weight'] > 0.8 else "Medium"
        })

    output = {
        "nodes": nodes_out,
        "links": links_out,
        "insights": {
            "metrics": {
                "spectral_radius": round(spectral_radius, 4),
                "avg_path_length": round(avg_path_len, 4),
                "density": round(nx.density(G), 4)
            },
            "domino_prediction": {
                "trigger": domino_target,
                "sentiment": "Bearish",
                "downstream_impact": downstream
            },
            "clusters": [
                {"name": "Financial Core", "members": ["HDFCBANK.NS", "ICICIBANK.NS", "SBIN.NS"], "risk": "Critical"},
                {"name": "IT Defensive", "members": ["TCS.NS", "INFY.NS"], "risk": "Moderate"}
            ]
        }
    }
    
    frontend_path = "../QuantPulse-Frontend/src/app/data/graphData.json"
    if "QuantPulse-Backend" not in os.getcwd():
         frontend_path = "c:/Users/Prakhar/Downloads/innovault/QuantPulse/QuantPulse-Frontend/src/app/data/graphData.json"
         
    try:
        with open(frontend_path, "w") as f:
            json.dump(output, f, indent=2)
        print(f"Exported graphData.json to {frontend_path}")
    except FileNotFoundError:
        with open("graphData.json", "w") as f:
            json.dump(output, f, indent=2)
        print("Exported graphData.json to local directory")

if __name__ == "__main__":
    try:
        model, tickers, corr, vols = train_gnn()
        generate_graph_data_json(model, tickers, corr, vols)
    except Exception as e:
        print(f"An error occurred: {e}")
        import traceback
        traceback.print_exc()
