import torch
import torch.nn.functional as F
from torch_geometric.nn import GCNConv

class GCN(torch.nn.Module):
    def __init__(self, num_node_features, hidden_channels=16, num_classes=1):
        super(GCN, self).__init__()
        # Two Graph Convolutional Layers
        self.conv1 = GCNConv(num_node_features, hidden_channels)
        self.conv2 = GCNConv(hidden_channels, num_classes)

    def forward(self, x, edge_index):
        # Layer 1: Conv -> ReLU -> Dropout
        x = self.conv1(x, edge_index)
        x = F.relu(x)
        x = F.dropout(x, p=0.5, training=self.training)
        
        # Layer 2: Conv
        x = self.conv2(x, edge_index)
        
        # For regression (Systemic Risk Score), we return the raw output.
        # If classification, we might use log_softmax.
        return x
