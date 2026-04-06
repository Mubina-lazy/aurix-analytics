# Aurix Fintech — Data Analytics & Decision Intelligence System

Author: Mubinabegim To'lqinjonova

## Dataset
Simulated dataset of 180 digital gold transactions (buy/sell) on the Aurix platform.

| Column | Description |
|---|---|
| user_id | Unique user identifier |
| transaction_type | buy or sell |
| gold_amount_g | Gold amount in grams |
| price_eur | Transaction value in EUR |
| timestamp | Date and time |

## Analysis Approach
1. Data Cleaning — removed outliers using IQR method
2. EDA — buy/sell volumes, user activity, daily trends
3. Business Insights — 5 actionable insights
4. Forecasting — Linear Regression to predict weekly gold volume
5. Anomaly Detection — Rule-based (2.5 sigma threshold)

## Key Insights
1. Buy/Sell ratio > 1.5x — users are accumulating gold
2. Peak trading hour identified — best time for promotions
3. Top 20% users drive majority of revenue
4. Weekly volume shows upward trend
5. Users buy in larger amounts than they sell

## Model
- Algorithm: Linear Regression
- Target: Weekly gold transaction volume
- Limitation: Small dataset; real model would use ARIMA or Prophet

## How to Run
Open notebooks/aurix_analysis.ipynb in Google Colab
