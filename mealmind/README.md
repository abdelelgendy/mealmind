# MealMind 🍽️

A smart meal planning application built with React, Vite, and Supabase. MealMind helps users plan meals, manage pantry items, discover recipes, and track their cooking journey with intelligent filtering and recommendations.

## ✨ Features

### Core Functionality
- **Smart Recipe Discovery**: AI-powered recipe recommendations based on pantry items and dietary preferences
- **Meal Planning**: Drag-and-drop meal planning interface with calendar view
- **Pantry Management**: Track ingredients, quantities, and expiration dates
- **Recipe Favorites**: Save and organize favorite recipes
- **Meal Tracking**: Log completed meals and cooking experiences
- **Dietary Preferences**: Customizable diet filters, allergen management, and cooking time preferences

### Technical Features
- **Real-time Sync**: Live updates across devices using Supabase Realtime
- **Offline Support**: Local caching for better performance
- **Responsive Design**: Mobile-first design with touch-friendly interactions
- **Smart Filtering**: Advanced ingredient-based recipe filtering
- **Performance Optimized**: Debounced searches, lazy loading, and optimized re-renders

## 🚀 Tech Stack

- **Frontend**: React 18, Vite, React Router
- **Backend**: Supabase (PostgreSQL, Auth, Realtime)
- **External API**: Spoonacular Recipe API
- **UI/UX**: Custom CSS with CSS Grid/Flexbox, React DnD
- **State Management**: React Context API
- **Development**: ESLint, Hot Module Replacement

## 📦 Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── Header.jsx
│   ├── ErrorBoundary.jsx
│   ├── RecipeCard.jsx
│   └── ...
├── contexts/            # React Context providers
│   ├── AuthContext.jsx
│   └── ...
├── pages/               # Route components
│   ├── Dashboard.jsx
│   ├── Pantry.jsx
│   ├── Recipes.jsx
│   └── ...
├── hooks/               # Custom React hooks
├── lib/                 # Third-party integrations
│   ├── supabase.js
│   └── spoonacular.js
├── utils/               # Utility functions
│   └── helpers.js
├── constants/           # App constants and config
│   └── index.js
├── styles/              # CSS modules
│   ├── base.css
│   ├── user-components.css
│   └── ...
└── routes/              # Route definitions
    └── AppRoutes.jsx
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+ and npm
- Supabase account
- Spoonacular API key

### Installation
1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd mealmind
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Environment Setup:
   Create a `.env.local` file with:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_SPOONACULAR_API_KEY=your_spoonacular_api_key
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

## 🗄️ Database Schema

### Core Tables
- **profiles**: User profiles and preferences
- **pantry**: User pantry items with quantities and categories
- **meal_plans**: Scheduled meals with dates and times
- **favorites**: User's favorite recipes
- **meal_tracking**: Completed meal logs
- **recipes_cache**: Cached recipe data for performance

## 🎨 Design System

### CSS Custom Properties
```css
:root {
  --brand: #21222A;
  --text: #1f2937;
  --bg: #f7f7fb;
  --surface: #ffffff;
  --radius: 12px;
  --shadow: 0 8px 24px rgba(0,0,0,.06);
  /* ... */
}
```

### Component Architecture
- **Atomic Design**: Small, reusable components
- **Consistent Spacing**: Using CSS custom properties
- **Responsive**: Mobile-first approach
- **Accessible**: ARIA labels and semantic HTML

## 🔧 Development

### Code Quality
- **ESLint**: Configured for React best practices
- **Error Boundaries**: Graceful error handling
- **TypeScript-ready**: JSDoc comments for better DX

### Performance Optimizations
- **React.memo**: Preventing unnecessary re-renders
- **useCallback/useMemo**: Optimizing expensive operations
- **Debounced Search**: Reducing API calls
- **Lazy Loading**: Code splitting for better initial load
- **Image Optimization**: WebP format with fallbacks

### Testing Strategy
- **Error Boundaries**: Component-level error handling
- **Demo Data**: Fallback data for development
- **Console Logging**: Structured development logging

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Environment Variables
Ensure all production environment variables are set:
- Supabase production URL and keys
- Spoonacular API key
- Any additional configuration

## 🤝 Contributing

1. Follow the established code style
2. Use semantic commit messages
3. Add proper JSDoc documentation
4. Test thoroughly before submitting PRs

## 📱 Features Roadmap

### Phase 1 (Current)
- ✅ Basic meal planning
- ✅ Recipe discovery
- ✅ Pantry management
- ✅ User authentication

### Phase 2 (Next)
- 🔄 Shopping list generation
- 🔄 Nutrition tracking
- 🔄 Recipe scaling
- 🔄 Social features (sharing recipes)

### Phase 3 (Future)
- 📋 Advanced meal prep planning
- 📋 Integration with grocery delivery
- 📋 AI-powered meal suggestions
- 📋 Voice commands

## 📄 License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## 🙏 Acknowledgments

- [Spoonacular API](https://spoonacular.com/food-api) for recipe data
- [Supabase](https://supabase.com) for backend infrastructure
- [React DnD](https://react-dnd.github.io/react-dnd/) for drag-and-drop functionality

---

Made with ❤️ for home cooks everywhere!
