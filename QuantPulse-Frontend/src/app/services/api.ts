/**
 * QuantPulse Backend API Service
 * 
 * This module provides functions to interact with the FastAPI backend.
 * All API calls are made to the local backend server running on port 8000.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// =============================================================================
// Types
// =============================================================================

export interface StockData {
    symbol: string;
    yahooSymbol: string;
    companyName: string;
    currentPrice: number;
    previousClose: number;
    change: number;
    changePercent: number;
    volume: number;
    volumeFormatted: string;
    marketCap: number | null;
    marketCapFormatted: string;
    currency: string;
    exchange: string;
    timestamp: string;
    marketState: string;
}

export interface NewsSentimentData {
    symbol: string;
    companyName: string;
    sentimentScore: number;
    sentimentLabel: 'Very Bad' | 'Bad' | 'Neutral' | 'Good' | 'Very Good';
    newsConfidence: number;
    articlesAnalyzed: number;
    daysAnalyzed: number;
    timestamp: string;
    sampleArticles: Array<{
        title: string;
        sentiment: number;
        source: string;
        publishedAt: string;
    }>;
    disclaimer: string;
}

export interface AIPredictionData {
    symbol: string;
    timestamp: string;
    prediction: {
        direction: 'UP' | 'DOWN' | 'SIDEWAYS';
        trendLabel: string;
        overallConfidence: number;
        signalsAgree: boolean;
        signalsConflict: boolean;
        agreementStatus: 'agree' | 'conflict' | 'neutral';
    };
    technical: {
        direction: string;
        trendLabel: string;
        confidence: number;
        weight: string;
        currentPrice: number;
        sma5Day: number;
        deviationPercent: number;
    };
    news: {
        sentimentLabel: string;
        sentimentDirection: string;
        confidence: number;
        weight: string;
        articlesAnalyzed: number;
    };
    explanation: string[];
    logic: {
        rule1: string;
        rule2: string;
        rule3: string;
        rule4: string;
    };
    disclaimer: string;
}

export interface ApiError {
    error: string;
    message: string;
    hint?: string;
}

// =============================================================================
// API Functions
// =============================================================================

/**
 * Check if the backend is healthy
 */
export async function checkHealth(): Promise<boolean> {
    try {
        const response = await fetch(`${API_BASE_URL}/health`);
        const data = await response.json();
        return data.status === 'ok';
    } catch {
        return false;
    }
}

/**
 * Fetch stock data for a symbol
 */
export async function fetchStockData(symbol: string): Promise<StockData> {
    const response = await fetch(`${API_BASE_URL}/stock/${symbol.toUpperCase()}`);

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail?.message || `Failed to fetch stock data for ${symbol}`);
    }

    return response.json();
}

/**
 * Fetch news sentiment for a symbol
 */
export async function fetchNewsSentiment(symbol: string, days: number = 7): Promise<NewsSentimentData> {
    const response = await fetch(`${API_BASE_URL}/news-sentiment/${symbol.toUpperCase()}?days=${days}`);

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail?.message || `Failed to fetch news sentiment for ${symbol}`);
    }

    return response.json();
}

/**
 * Fetch AI prediction for a symbol
 */
export async function fetchAIPrediction(symbol: string): Promise<AIPredictionData> {
    const response = await fetch(`${API_BASE_URL}/ai-prediction/${symbol.toUpperCase()}`);

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail?.message || `Failed to fetch prediction for ${symbol}`);
    }

    return response.json();
}

/**
 * Convert sentiment score to label
 * This is a frontend helper to match backend logic
 */
export function getSentimentLabel(score: number): 'Very Bad' | 'Bad' | 'Neutral' | 'Good' | 'Very Good' {
    if (score <= -0.5) return 'Very Bad';
    if (score <= -0.1) return 'Bad';
    if (score < 0.1) return 'Neutral';
    if (score < 0.5) return 'Good';
    return 'Very Good';
}

/**
 * Get sentiment index (0-4) from label
 */
export function getSentimentIndex(label: string): number {
    const labels = ['Very Bad', 'Bad', 'Neutral', 'Good', 'Very Good'];
    return labels.indexOf(label);
}
