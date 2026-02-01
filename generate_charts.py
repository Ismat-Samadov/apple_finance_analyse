"""
Apple Financial Analysis - Business Insights Chart Generator
Generates business-focused visualizations for executive decision-making
"""

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from datetime import datetime
import warnings
warnings.filterwarnings('ignore')

# Set professional styling
plt.style.use('seaborn-v0_8-darkgrid')
sns.set_palette("husl")
COLORS = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b']

# Create output directory
import os
os.makedirs('charts', exist_ok=True)

# Load datasets
print("Loading datasets...")
daily_data = pd.read_csv('data/aapl_master_enriched.csv')
quarterly_summary = pd.read_csv('data/aapl_quarterly_summary.csv')
quarterly_master = pd.read_csv('data/aapl_quarterly_master.csv')

# Convert date columns
daily_data['date'] = pd.to_datetime(daily_data['date'])
quarterly_summary['period'] = quarterly_summary['fiscal_year'].astype(str) + '-' + quarterly_summary['fiscal_quarter']

print(f"Loaded {len(daily_data)} daily records and {len(quarterly_summary)} quarterly records")

# ============================================================================
# CHART 1: Long-Term Shareholder Value Creation (1980-2026)
# ============================================================================
print("\nGenerating Chart 1: Long-term stock price growth...")

fig, ax = plt.subplots(figsize=(14, 7))
ax.plot(daily_data['date'], daily_data['close'], linewidth=1.5, color=COLORS[0], alpha=0.8)
ax.fill_between(daily_data['date'], daily_data['close'], alpha=0.3, color=COLORS[0])

# Add major milestones
milestones = [
    ('2007-01-09', 'iPhone Launch', daily_data[daily_data['date'] == '2007-01-09']['close'].values[0] if len(daily_data[daily_data['date'] == '2007-01-09']) > 0 else None),
    ('2010-04-03', 'iPad Launch', daily_data[daily_data['date'] == '2010-04-03']['close'].values[0] if len(daily_data[daily_data['date'] == '2010-04-03']) > 0 else None),
    ('2011-10-05', 'Steve Jobs', daily_data[daily_data['date'] == '2011-10-05']['close'].values[0] if len(daily_data[daily_data['date'] == '2011-10-05']) > 0 else None),
]

for date_str, label, price in milestones:
    if price is not None:
        ax.axvline(pd.to_datetime(date_str), color='red', linestyle='--', alpha=0.5, linewidth=1)
        ax.text(pd.to_datetime(date_str), price, f'  {label}', rotation=90, va='bottom', fontsize=9)

ax.set_xlabel('Year', fontsize=12, fontweight='bold')
ax.set_ylabel('Stock Price ($)', fontsize=12, fontweight='bold')
ax.set_title('Apple Stock Price: 45+ Years of Shareholder Value Creation (1980-2026)',
             fontsize=14, fontweight='bold', pad=20)
ax.grid(True, alpha=0.3)
plt.tight_layout()
plt.savefig('charts/01_longterm_stock_performance.png', dpi=300, bbox_inches='tight')
plt.close()

# ============================================================================
# CHART 2: Decade-by-Decade Returns Comparison
# ============================================================================
print("Generating Chart 2: Decade-by-decade returns...")

daily_data['decade'] = (daily_data['year'] // 10) * 10
decade_returns = []
decade_labels = []

for decade in sorted(daily_data['decade'].unique()):
    decade_data = daily_data[daily_data['decade'] == decade]
    if len(decade_data) > 1:
        start_price = decade_data.iloc[0]['close']
        end_price = decade_data.iloc[-1]['close']
        total_return = ((end_price - start_price) / start_price) * 100
        decade_returns.append(total_return)
        decade_labels.append(f"{decade}s")

fig, ax = plt.subplots(figsize=(12, 7))
bars = ax.bar(decade_labels, decade_returns, color=COLORS[:len(decade_labels)], alpha=0.8, edgecolor='black')

# Add value labels on bars
for i, (bar, val) in enumerate(zip(bars, decade_returns)):
    height = bar.get_height()
    ax.text(bar.get_x() + bar.get_width()/2., height,
            f'{val:.0f}%', ha='center', va='bottom' if val > 0 else 'top',
            fontweight='bold', fontsize=11)

ax.axhline(y=0, color='black', linestyle='-', linewidth=0.8)
ax.set_xlabel('Decade', fontsize=12, fontweight='bold')
ax.set_ylabel('Total Return (%)', fontsize=12, fontweight='bold')
ax.set_title('Apple Stock Performance by Decade: Strategic Era Analysis',
             fontsize=14, fontweight='bold', pad=20)
ax.grid(True, alpha=0.3, axis='y')
plt.tight_layout()
plt.savefig('charts/02_decade_returns.png', dpi=300, bbox_inches='tight')
plt.close()

# ============================================================================
# CHART 3: Revenue Growth by Product Category (2018-2025)
# ============================================================================
print("Generating Chart 3: Revenue by product category...")

revenue_data = quarterly_summary[quarterly_summary['revenue_total'].notna()].copy()
revenue_data = revenue_data.sort_values(['fiscal_year', 'fiscal_quarter'])

fig, ax = plt.subplots(figsize=(14, 7))
x_pos = np.arange(len(revenue_data))

# Stack the revenue categories
bottom = np.zeros(len(revenue_data))
categories = [
    ('revenue_iphone', 'iPhone', COLORS[0]),
    ('revenue_services', 'Services', COLORS[1]),
    ('revenue_mac', 'Mac', COLORS[2]),
    ('revenue_ipad', 'iPad', COLORS[3]),
    ('revenue_wearables_other', 'Wearables & Other', COLORS[4])
]

for col, label, color in categories:
    values = revenue_data[col].fillna(0).values / 1e9  # Convert to billions
    ax.bar(x_pos, values, bottom=bottom, label=label, color=color, alpha=0.85, edgecolor='white', linewidth=0.5)
    bottom += values

ax.set_xlabel('Quarter', fontsize=12, fontweight='bold')
ax.set_ylabel('Revenue ($ Billions)', fontsize=12, fontweight='bold')
ax.set_title('Apple Revenue Composition by Product Category (2018-2025)',
             fontsize=14, fontweight='bold', pad=20)
ax.set_xticks(x_pos[::2])  # Show every other label to avoid crowding
ax.set_xticklabels([f"{row['fiscal_year']}\n{row['fiscal_quarter']}"
                     for _, row in revenue_data.iloc[::2].iterrows()], rotation=45, ha='right')
ax.legend(loc='upper left', fontsize=10, framealpha=0.9)
ax.grid(True, alpha=0.3, axis='y')
plt.tight_layout()
plt.savefig('charts/03_revenue_composition.png', dpi=300, bbox_inches='tight')
plt.close()

# ============================================================================
# CHART 4: Total Revenue Growth Trend
# ============================================================================
print("Generating Chart 4: Total revenue growth trend...")

fig, ax = plt.subplots(figsize=(14, 7))
revenue_billions = revenue_data['revenue_total'].values / 1e9
x_pos = np.arange(len(revenue_data))

ax.plot(x_pos, revenue_billions, marker='o', linewidth=2.5, markersize=6,
        color=COLORS[0], label='Quarterly Revenue')

# Add trend line
z = np.polyfit(x_pos, revenue_billions, 1)
p = np.poly1d(z)
ax.plot(x_pos, p(x_pos), "--", color=COLORS[1], linewidth=2, alpha=0.7, label='Trend Line')

ax.set_xlabel('Quarter', fontsize=12, fontweight='bold')
ax.set_ylabel('Total Revenue ($ Billions)', fontsize=12, fontweight='bold')
ax.set_title('Apple Total Revenue Trend: 8-Year Growth Trajectory (2018-2025)',
             fontsize=14, fontweight='bold', pad=20)
ax.set_xticks(x_pos[::3])
ax.set_xticklabels([f"{row['fiscal_year']}-{row['fiscal_quarter']}"
                     for _, row in revenue_data.iloc[::3].iterrows()], rotation=45, ha='right')
ax.legend(loc='upper left', fontsize=11)
ax.grid(True, alpha=0.3)
plt.tight_layout()
plt.savefig('charts/04_total_revenue_trend.png', dpi=300, bbox_inches='tight')
plt.close()

# ============================================================================
# CHART 5: Product Portfolio Evolution - Market Share Trends
# ============================================================================
print("Generating Chart 5: Product portfolio market share...")

fig, ax = plt.subplots(figsize=(14, 7))
x_pos = np.arange(len(revenue_data))

share_categories = [
    ('share_iphone', 'iPhone', COLORS[0]),
    ('share_services', 'Services', COLORS[1]),
    ('share_mac', 'Mac', COLORS[2]),
    ('share_ipad', 'iPad', COLORS[3]),
    ('share_wearables_other', 'Wearables & Other', COLORS[4])
]

for col, label, color in share_categories:
    if col in revenue_data.columns:
        values = revenue_data[col].fillna(0).values * 100  # Convert to percentage
        ax.plot(x_pos, values, marker='o', linewidth=2, markersize=5,
                label=label, color=color, alpha=0.8)

ax.set_xlabel('Quarter', fontsize=12, fontweight='bold')
ax.set_ylabel('Revenue Share (%)', fontsize=12, fontweight='bold')
ax.set_title('Product Portfolio Evolution: Revenue Share Trends (2018-2025)',
             fontsize=14, fontweight='bold', pad=20)
ax.set_xticks(x_pos[::3])
ax.set_xticklabels([f"{row['fiscal_year']}-{row['fiscal_quarter']}"
                     for _, row in revenue_data.iloc[::3].iterrows()], rotation=45, ha='right')
ax.legend(loc='best', fontsize=10, framealpha=0.9)
ax.grid(True, alpha=0.3)
ax.set_ylim(0, 70)
plt.tight_layout()
plt.savefig('charts/05_revenue_share_evolution.png', dpi=300, bbox_inches='tight')
plt.close()

# ============================================================================
# CHART 6: Services Revenue Growth - Strategic Diversification
# ============================================================================
print("Generating Chart 6: Services revenue focus...")

fig, ax1 = plt.subplots(figsize=(14, 7))

services_billions = revenue_data['revenue_services'].values / 1e9
services_share = revenue_data['share_services'].values * 100

x_pos = np.arange(len(revenue_data))
color1 = COLORS[1]
color2 = COLORS[3]

# Revenue bars
ax1.bar(x_pos, services_billions, alpha=0.7, color=color1, label='Services Revenue ($ B)', edgecolor='black', linewidth=0.5)
ax1.set_xlabel('Quarter', fontsize=12, fontweight='bold')
ax1.set_ylabel('Services Revenue ($ Billions)', fontsize=12, fontweight='bold', color=color1)
ax1.tick_params(axis='y', labelcolor=color1)

# Share line
ax2 = ax1.twinx()
ax2.plot(x_pos, services_share, color=color2, linewidth=2.5, marker='s',
         markersize=6, label='Revenue Share (%)')
ax2.set_ylabel('Share of Total Revenue (%)', fontsize=12, fontweight='bold', color=color2)
ax2.tick_params(axis='y', labelcolor=color2)

ax1.set_title('Services Revenue: Strategic Shift Toward Recurring Income (2018-2025)',
              fontsize=14, fontweight='bold', pad=20)
ax1.set_xticks(x_pos[::2])
ax1.set_xticklabels([f"{row['fiscal_year']}-{row['fiscal_quarter']}"
                      for _, row in revenue_data.iloc[::2].iterrows()], rotation=45, ha='right')

# Combine legends
lines1, labels1 = ax1.get_legend_handles_labels()
lines2, labels2 = ax2.get_legend_handles_labels()
ax1.legend(lines1 + lines2, labels1 + labels2, loc='upper left', fontsize=11)

ax1.grid(True, alpha=0.3, axis='y')
plt.tight_layout()
plt.savefig('charts/06_services_growth.png', dpi=300, bbox_inches='tight')
plt.close()

# ============================================================================
# CHART 7: Stock Volatility Trends - Risk Assessment
# ============================================================================
print("Generating Chart 7: Stock volatility analysis...")

# Sample data for clearer visualization
daily_sample = daily_data[daily_data['date'] >= '2015-01-01'].copy()
daily_sample = daily_sample.set_index('date')
monthly_vol = daily_sample['volatility_20d'].resample('M').mean()

fig, ax = plt.subplots(figsize=(14, 7))
ax.plot(monthly_vol.index, monthly_vol.values, linewidth=1.5, color=COLORS[0], alpha=0.8)
ax.fill_between(monthly_vol.index, monthly_vol.values, alpha=0.3, color=COLORS[0])

# Add horizontal lines for reference
mean_vol = monthly_vol.mean()
ax.axhline(y=mean_vol, color='red', linestyle='--', linewidth=2,
           label=f'Average Volatility: {mean_vol:.2f}', alpha=0.7)

ax.set_xlabel('Year', fontsize=12, fontweight='bold')
ax.set_ylabel('20-Day Volatility', fontsize=12, fontweight='bold')
ax.set_title('Apple Stock Volatility: Market Risk Assessment (2015-2026)',
             fontsize=14, fontweight='bold', pad=20)
ax.legend(loc='upper right', fontsize=11)
ax.grid(True, alpha=0.3)
plt.tight_layout()
plt.savefig('charts/07_stock_volatility.png', dpi=300, bbox_inches='tight')
plt.close()

# ============================================================================
# CHART 8: Annual Returns Performance
# ============================================================================
print("Generating Chart 8: Annual returns...")

yearly_returns = []
years = []

for year in range(daily_data['year'].min(), daily_data['year'].max() + 1):
    year_data = daily_data[daily_data['year'] == year]
    if len(year_data) > 20:  # Ensure sufficient data
        start_price = year_data.iloc[0]['close']
        end_price = year_data.iloc[-1]['close']
        annual_return = ((end_price - start_price) / start_price) * 100
        yearly_returns.append(annual_return)
        years.append(year)

fig, ax = plt.subplots(figsize=(16, 7))
colors = [COLORS[0] if x > 0 else COLORS[3] for x in yearly_returns]
bars = ax.bar(years, yearly_returns, color=colors, alpha=0.8, edgecolor='black', linewidth=0.5)

# Add value labels for significant years
for i, (year, ret) in enumerate(zip(years, yearly_returns)):
    if abs(ret) > 50 or year in [2007, 2008, 2020]:  # Label significant years
        ax.text(year, ret, f'{ret:.0f}%', ha='center',
                va='bottom' if ret > 0 else 'top', fontsize=9, fontweight='bold')

ax.axhline(y=0, color='black', linestyle='-', linewidth=1)
ax.set_xlabel('Year', fontsize=12, fontweight='bold')
ax.set_ylabel('Annual Return (%)', fontsize=12, fontweight='bold')
ax.set_title('Apple Annual Stock Returns: Year-by-Year Performance (1980-2026)',
             fontsize=14, fontweight='bold', pad=20)
ax.grid(True, alpha=0.3, axis='y')
plt.tight_layout()
plt.savefig('charts/08_annual_returns.png', dpi=300, bbox_inches='tight')
plt.close()

# ============================================================================
# CHART 9: Quarterly Revenue Growth Rate
# ============================================================================
print("Generating Chart 9: Quarterly revenue growth rate...")

revenue_data_sorted = revenue_data.sort_values(['fiscal_year', 'fiscal_quarter']).copy()
revenue_data_sorted['revenue_growth'] = revenue_data_sorted['revenue_total'].pct_change() * 100

fig, ax = plt.subplots(figsize=(14, 7))
x_pos = np.arange(len(revenue_data_sorted))
colors = [COLORS[0] if x > 0 else COLORS[3] for x in revenue_data_sorted['revenue_growth'].fillna(0)]

bars = ax.bar(x_pos, revenue_data_sorted['revenue_growth'], color=colors, alpha=0.8, edgecolor='black', linewidth=0.5)

# Add trend line
valid_growth = revenue_data_sorted['revenue_growth'].dropna()
valid_x = x_pos[revenue_data_sorted['revenue_growth'].notna()]
if len(valid_growth) > 1:
    z = np.polyfit(valid_x, valid_growth, 1)
    p = np.poly1d(z)
    ax.plot(x_pos, p(x_pos), "--", color='red', linewidth=2, alpha=0.7, label='Trend Line')

ax.axhline(y=0, color='black', linestyle='-', linewidth=1)
ax.set_xlabel('Quarter', fontsize=12, fontweight='bold')
ax.set_ylabel('Quarter-over-Quarter Growth (%)', fontsize=12, fontweight='bold')
ax.set_title('Quarterly Revenue Growth Rate: Business Momentum Analysis (2018-2025)',
             fontsize=14, fontweight='bold', pad=20)
ax.set_xticks(x_pos[::2])
ax.set_xticklabels([f"{row['fiscal_year']}-{row['fiscal_quarter']}"
                     for _, row in revenue_data_sorted.iloc[::2].iterrows()], rotation=45, ha='right')
ax.legend(loc='upper right', fontsize=11)
ax.grid(True, alpha=0.3, axis='y')
plt.tight_layout()
plt.savefig('charts/09_revenue_growth_rate.png', dpi=300, bbox_inches='tight')
plt.close()

# ============================================================================
# CHART 10: iPhone Revenue Dependency Analysis
# ============================================================================
print("Generating Chart 10: iPhone dependency...")

fig, ax = plt.subplots(figsize=(14, 7))
x_pos = np.arange(len(revenue_data))

iphone_revenue = revenue_data['revenue_iphone'].values / 1e9
non_iphone_revenue = (revenue_data['revenue_total'].values - revenue_data['revenue_iphone'].values) / 1e9

ax.bar(x_pos, iphone_revenue, label='iPhone Revenue', color=COLORS[0], alpha=0.8, edgecolor='black', linewidth=0.5)
ax.bar(x_pos, non_iphone_revenue, bottom=iphone_revenue, label='Non-iPhone Revenue',
       color=COLORS[2], alpha=0.8, edgecolor='black', linewidth=0.5)

# Add percentage labels
for i, (iphone, total) in enumerate(zip(revenue_data['revenue_iphone'].values, revenue_data['revenue_total'].values)):
    percentage = (iphone / total) * 100
    if i % 3 == 0:  # Show every 3rd label to avoid crowding
        ax.text(i, iphone/2e9, f'{percentage:.0f}%', ha='center', va='center',
                fontweight='bold', fontsize=9, color='white')

ax.set_xlabel('Quarter', fontsize=12, fontweight='bold')
ax.set_ylabel('Revenue ($ Billions)', fontsize=12, fontweight='bold')
ax.set_title('iPhone Revenue Dependency: Diversification Progress (2018-2025)',
             fontsize=14, fontweight='bold', pad=20)
ax.set_xticks(x_pos[::2])
ax.set_xticklabels([f"{row['fiscal_year']}-{row['fiscal_quarter']}"
                     for _, row in revenue_data.iloc[::2].iterrows()], rotation=45, ha='right')
ax.legend(loc='upper left', fontsize=11)
ax.grid(True, alpha=0.3, axis='y')
plt.tight_layout()
plt.savefig('charts/10_iphone_dependency.png', dpi=300, bbox_inches='tight')
plt.close()

# ============================================================================
# CHART 11: Stock Price vs Revenue Correlation (Recent Years)
# ============================================================================
print("Generating Chart 11: Stock price vs revenue correlation...")

# Get quarterly stock prices aligned with revenue data
quarterly_stock = []
for _, row in revenue_data.iterrows():
    year = row['fiscal_year']
    quarter = row['fiscal_quarter']
    # Get end of quarter stock price
    quarter_end = quarterly_master[(quarterly_master['fiscal_year'] == year) &
                                    (quarterly_master['fiscal_quarter'] == quarter)]
    if len(quarter_end) > 0:
        quarterly_stock.append(quarter_end.iloc[0]['close_price'])
    else:
        quarterly_stock.append(None)

revenue_data_plot = revenue_data.copy()
revenue_data_plot['stock_price'] = quarterly_stock

fig, ax1 = plt.subplots(figsize=(14, 7))
x_pos = np.arange(len(revenue_data_plot))
color1 = COLORS[0]
color2 = COLORS[1]

# Revenue line
ax1.plot(x_pos, revenue_data_plot['revenue_total'].values / 1e9,
         color=color1, linewidth=2.5, marker='o', markersize=6, label='Total Revenue')
ax1.set_xlabel('Quarter', fontsize=12, fontweight='bold')
ax1.set_ylabel('Revenue ($ Billions)', fontsize=12, fontweight='bold', color=color1)
ax1.tick_params(axis='y', labelcolor=color1)

# Stock price line
ax2 = ax1.twinx()
ax2.plot(x_pos, revenue_data_plot['stock_price'],
         color=color2, linewidth=2.5, marker='s', markersize=6, label='Stock Price')
ax2.set_ylabel('Stock Price ($)', fontsize=12, fontweight='bold', color=color2)
ax2.tick_params(axis='y', labelcolor=color2)

ax1.set_title('Stock Price vs Revenue: Market Valuation Alignment (2018-2025)',
              fontsize=14, fontweight='bold', pad=20)
ax1.set_xticks(x_pos[::2])
ax1.set_xticklabels([f"{row['fiscal_year']}-{row['fiscal_quarter']}"
                      for _, row in revenue_data_plot.iloc[::2].iterrows()], rotation=45, ha='right')

# Combine legends
lines1, labels1 = ax1.get_legend_handles_labels()
lines2, labels2 = ax2.get_legend_handles_labels()
ax1.legend(lines1 + lines2, labels1 + labels2, loc='upper left', fontsize=11)

ax1.grid(True, alpha=0.3, axis='y')
plt.tight_layout()
plt.savefig('charts/11_stock_vs_revenue.png', dpi=300, bbox_inches='tight')
plt.close()

# ============================================================================
# CHART 12: Risk-Adjusted Performance Metrics
# ============================================================================
print("Generating Chart 12: Risk-adjusted performance...")

# Calculate yearly risk-adjusted returns (Sharpe-like metric)
yearly_risk_return = []
years_risk = []

for year in range(2010, daily_data['year'].max() + 1):
    year_data = daily_data[daily_data['year'] == year]
    if len(year_data) > 50:
        avg_return = year_data['return_1d'].mean() * 252  # Annualized
        volatility = year_data['volatility_20d'].mean()
        if volatility > 0:
            risk_adjusted = (avg_return / volatility) * 100
            yearly_risk_return.append(risk_adjusted)
            years_risk.append(year)

fig, ax = plt.subplots(figsize=(14, 7))
colors = [COLORS[0] if x > 0 else COLORS[3] for x in yearly_risk_return]
bars = ax.bar(years_risk, yearly_risk_return, color=colors, alpha=0.8, edgecolor='black', linewidth=0.8)

# Add value labels
for bar, val in zip(bars, yearly_risk_return):
    height = bar.get_height()
    ax.text(bar.get_x() + bar.get_width()/2., height,
            f'{val:.1f}', ha='center', va='bottom' if val > 0 else 'top',
            fontsize=9, fontweight='bold')

ax.axhline(y=0, color='black', linestyle='-', linewidth=1)
ax.set_xlabel('Year', fontsize=12, fontweight='bold')
ax.set_ylabel('Risk-Adjusted Return Score', fontsize=12, fontweight='bold')
ax.set_title('Risk-Adjusted Performance: Return per Unit of Risk (2010-2026)',
             fontsize=14, fontweight='bold', pad=20)
ax.grid(True, alpha=0.3, axis='y')
plt.tight_layout()
plt.savefig('charts/12_risk_adjusted_returns.png', dpi=300, bbox_inches='tight')
plt.close()

print("\n" + "="*70)
print("CHART GENERATION COMPLETE")
print("="*70)
print(f"\nGenerated 12 business-focused charts in the 'charts/' directory:")
print("  1. Long-term stock performance (45+ years)")
print("  2. Decade-by-decade returns comparison")
print("  3. Revenue composition by product")
print("  4. Total revenue growth trend")
print("  5. Product portfolio market share evolution")
print("  6. Services revenue strategic growth")
print("  7. Stock volatility and risk assessment")
print("  8. Annual returns performance")
print("  9. Quarterly revenue growth rate")
print(" 10. iPhone dependency analysis")
print(" 11. Stock price vs revenue correlation")
print(" 12. Risk-adjusted performance metrics")
print("\nAll charts are ready for business presentation.")
print("="*70)
