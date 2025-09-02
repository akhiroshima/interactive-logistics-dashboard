# 📊 Interactive Logistics Dashboard

A comprehensive, interactive dashboard for logistics and delivery analytics built with React and Plotly.js.

## ✨ Features

### 🌍 Interactive Geographic Map
- **Multi-country selection** with visual feedback
- **Drill-down capability** from world view to US states
- **Smart filtering** - shows all locations while respecting non-geographic filters
- Real-time order volume visualization with color-coded intensity

### 📈 Advanced Analytics
- **Dual-axis charts** showing delivery status distribution vs order volume
- **Time-series analysis** with intelligent drill-down (yearly → quarterly → monthly → weekly → daily)
- **Late delivery reasons** breakdown with stacked bar charts
- **Percentage-based visualizations** for delivery performance metrics

### 🔧 Smart Filtering System
- **Multi-dimensional filtering** - apply multiple filters simultaneously
- **Date range picker** with natural language search ("Q3 2024", "last month")
- **Advanced filter menu** for complex filter combinations
- **Intelligent drill-down suggestions** based on active filters
- **Interactive legends** with toggle functionality

### 🎯 User Experience
- **Responsive design** that works on all devices
- **Real-time updates** - all charts sync with filter changes
- **Visual feedback** for active selections and filters
- **Professional styling** with modern UI components

## 🛠️ Tech Stack

- **React** - Frontend framework with Context API for state management
- **Plotly.js** - Interactive visualizations and choropleth maps
- **React Select** - Enhanced dropdown components
- **date-fns** - Date manipulation and formatting
- **CSS Grid & Flexbox** - Modern responsive layouts

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ (managed with nvm)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd logistics-dashboard

# Install dependencies
npm install

# Start development server
npm start
```

The app will open at [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
# Create production build
npm run build

# Serve locally to test
npx serve -s build
```

## 📊 Dashboard Components

### Geographic Distribution Map
- **World View**: Shows global order distribution with country-level data
- **US Drill-down**: Click USA to view state-level distribution
- **Multi-selection**: Click multiple countries/states to compare
- **Smart Data**: Respects date and status filters while keeping all locations selectable

### Delivery Performance Chart
- **Stacked Percentage Bars**: On-time, Late, and Early delivery distributions
- **Order Volume Line**: Red line showing total order counts
- **Time-based Drill-down**: Automatically adjusts granularity based on filters
- **Interactive Clicking**: Click bars to filter by both time period and delivery status

### Late Delivery Analysis
- **Reason Breakdown**: Weather, Traffic, Vehicle issues, Customs, etc.
- **Time-series View**: See how late reasons change over time
- **Dual Filtering**: Click to filter by both time and specific reason
- **Average Delay Metrics**: Hover to see detailed delay information

## 🎮 How to Use

### Basic Navigation
1. **Explore the Map**: Click countries to select them (red borders indicate selection)
2. **Drill into USA**: Click United States to see state-level data
3. **Apply Date Filters**: Use the date picker for time-based analysis
4. **Set Status Filters**: Use Advanced Filters menu for delivery status filtering

### Advanced Interactions
1. **Multi-dimensional Filtering**: 
   - Select multiple countries on the map
   - Set a date range (e.g., "Q2 2024")
   - Add delivery status filters
   - All charts update to show the intersection

2. **Smart Drill-downs**:
   - Apply a monthly filter → charts automatically switch to weekly view
   - Click a week bar → adds both week and delivery status filters
   - System suggests optimal granularity based on your selections

3. **Legend Interactions**:
   - First click on legend item → filters to show only that item
   - Subsequent clicks → toggle additional items in/out
   - Visual indicators show active legend filters

## 📁 Project Structure

```
src/
├── components/
│   ├── Dashboard.js              # Main dashboard layout
│   ├── FilterTags.js            # Active filter display
│   ├── DateRangePicker.js       # Date selection with natural language
│   ├── FilterSideMenu.js        # Advanced filtering options
│   ├── InteractiveLegend.js     # Reusable interactive legends
│   └── charts/
│       ├── PlotlyChoroplethMap.js    # Geographic map component
│       ├── DualAxisChart.js          # Delivery status vs volume chart
│       └── LateDeliveryChart.js      # Late delivery reasons chart
├── contexts/
│   └── FilterContext.js         # Global state management for filters
├── data/
│   ├── mockData.js              # Mock logistics data generator
│   └── geographicData.js        # Hierarchical geographic data
├── utils/
│   └── dateUtils.js             # Date parsing and formatting utilities
└── index.css                    # Global styles and responsive design
```

## 🔄 Filter System

The dashboard uses a sophisticated filtering system that intelligently handles different types of filters:

### Filter Types
- **Geographic**: Country, State/Subdivision, Region
- **Temporal**: Year, Quarter, Month, Week, Day, Date Range
- **Categorical**: Delivery Status, Late Reason
- **Chart-specific**: Legend filters for individual visualizations

### Smart Behaviors
- **Map Filtering**: Geographic filters don't hide countries/states, but other filters do affect map data
- **Auto Drill-down**: Applying specific filters automatically suggests better chart granularities
- **Filter Dependencies**: Some drill-down options are disabled when conflicting filters are active
- **Consistent Labeling**: Date ranges are formatted consistently across all filter sources

## 🎨 Styling & Design

- **Modern Color Palette**: Professional blues, grays with red accents for selections
- **Responsive Grid**: CSS Grid for main layout, Flexbox for components
- **Interactive Feedback**: Hover states, click animations, loading indicators
- **Accessibility**: Clear labels, good contrast ratios, keyboard navigation support

## 📈 Data Generation

The dashboard uses a sophisticated mock data generator that creates realistic logistics scenarios:

- **Weighted Distribution**: US gets 40% of orders, realistic state distributions
- **Seasonal Patterns**: Delivery performance varies by time periods
- **Geographic Realism**: Order volumes reflect real-world logistics patterns
- **Status Variety**: Realistic mix of on-time, late, and early deliveries
- **Rich Metadata**: Full date hierarchies, detailed late reasons, delivery metrics

## 🌐 Deployment

Ready for deployment to any static hosting service:

- **Netlify**: Connect to GitHub for automatic deployments
- **Vercel**: Zero-config deployment with GitHub integration
- **AWS S3 + CloudFront**: For enterprise-scale hosting
- **GitHub Pages**: Free hosting for public repositories

## 🤝 Contributing

This dashboard is designed to be easily extensible:

1. **New Chart Types**: Add to `src/components/charts/`
2. **Additional Filters**: Extend `src/contexts/FilterContext.js`
3. **Data Sources**: Replace mock data generator in `src/data/`
4. **Styling**: Modify global styles in `src/index.css`

## 📝 License

MIT License - feel free to use this for your own logistics analytics needs!

---

**Built with ❤️ for modern logistics analytics**