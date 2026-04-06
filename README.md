{\rtf1\ansi\ansicpg1252\cocoartf2580
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fswiss\fcharset0 Helvetica;\f1\fnil\fcharset134 PingFangSC-Regular;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\pard\tx566\tx1133\tx1700\tx2267\tx2834\tx3401\tx3968\tx4535\tx5102\tx5669\tx6236\tx6803\pardirnatural\partightenfactor0

\f0\fs24 \cf0 # Aurix Fintech \'97 Data Analytics & Decision Intelligence System\
\
## Dataset\
Simulated dataset of 180 digital gold transactions (buy/sell) on the Aurix platform.\
\
| Column | Description |\
|---|---|\
| user_id | Unique user identifier |\
| transaction_type | buy or sell |\
| gold_amount_g | Gold amount in grams |\
| price_eur | Transaction value in EUR |\
| timestamp | Date and time |\
\
## Analysis Approach\
1. Data Cleaning \'97 removed outliers using IQR method\
2. EDA \'97 buy/sell volumes, user activity, daily trends\
3. Business Insights \'97 5 actionable insights\
4. Forecasting \'97 Linear Regression to predict weekly gold volume\
5. Anomaly Detection \'97 Rule-based (2.5\uc0\u963  threshold)\
\
## Key Insights\
1. Buy/Sell ratio > 1.5x \'97 users are accumulating gold\
2. Peak trading hour identified \'97 best time for promotions\
3. Top 20% users drive majority of revenue\
4. Weekly volume shows upward trend\
5. Users buy in larger amounts than they sell\
\
## Model\
- Algorithm: Linear Regression\
- Target: Weekly gold transaction volume\
- Limitation: Small dataset; real model would use ARIMA or Prophet\
\
## How to Run\
Open notebooks/aurix_analysis.ipynb in Google Colab or Jupyter Notebook.\
\
## Project Structure\
aurix-analytics/\

\f1 \'a9\'c0
\f0 \uc0\u9472 \u9472  data/\

\f1 \'a9\'c0
\f0 \uc0\u9472 \u9472  notebooks/\
\uc0\u9474    \u9492 \u9472 \u9472  aurix_analysis.ipynb\
\uc0\u9492 \u9472 \u9472  README.md}