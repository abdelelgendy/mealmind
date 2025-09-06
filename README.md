# MealMind 🍽️

**MealMind** is an intelligent meal planning application built with **React, Vite, and Supabase**. It enables users to discover recipes, manage their pantry, plan meals, track favorites, and log cooking activities, all with real-time updates and personalized recommendations.

---

## 🌟 Key Features

### User-Centric Functionality

* **Smart Recipe Discovery**: Personalized recipe recommendations based on pantry contents and dietary preferences.
* **Meal Planning**: Drag-and-drop calendar interface for weekly meal planning.
* **Pantry Management**: Track ingredients, quantities, and availability.
* **Favorites**: Save and organize preferred recipes.
* **Meal Tracking**: Log completed meals and cooking activities.
* **Dietary Preferences**: Customizable diet filters, allergy management, and macronutrient targets.

### Technical Highlights

* **Real-Time Sync**: Supabase Realtime integration ensures live updates across devices.
* **Offline Caching**: Local caching for improved performance and reduced API calls.
* **Advanced Filtering**: Ingredient, diet, allergy, and calorie-based recipe suggestions.
* **Responsive Design**: Mobile-first, touch-friendly UI using CSS Grid and Flexbox.
* **Optimized Performance**: Debounced searches, lazy loading, and efficient re-renders.

---

## 🚀 Tech Stack

* **Frontend**: React 18, Vite, React Router, React Context API
* **Backend**: Supabase (PostgreSQL, Auth, Realtime)
* **API Integration**: Spoonacular Recipe API
* **State Management**: React Context API
* **UI / UX**: Custom CSS, React DnD for drag-and-drop, CSS Grid/Flexbox
* **Development Tools**: ESLint, HMR, Prettier

---

## � Project Structure

```
src/
├── components/        # Reusable UI components (RecipeCard, Header, Modals)
├── contexts/          # React Context providers (AuthContext, PlanContext)
├── pages/             # Route components (Dashboard, Pantry, Plan, Preferences, Favorites, Search)
├── hooks/             # Custom hooks
├── lib/               # Third-party integrations (supabase.js, spoonacular.js)
├── utils/             # Utility functions
├── constants/         # App constants
├── styles/            # CSS files (base.css, component styles)
└── routes/            # Route definitions (AppRoutes.jsx)
```

---

## 🛠 Installation & Setup

### Prerequisites

* Node.js 18+ and npm
* Supabase account
* Spoonacular API key

### Setup

1. Clone the repository:

```bash
git clone <repository-url>
cd mealmind
```

2. Install dependencies:

```bash
npm install
```

3. Create `.env.local` with your environment variables:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
VITE_SPOONACULAR_API_KEY=your_spoonacular_api_key_here
```

4. Start the development server:

```bash
npm run dev
```

---

## 🗄 Database Schema

### Core Tables

* **profiles**: User preferences and dietary settings.
* **pantry**: User pantry items with quantities.
* **meal\_plans**: Scheduled meals with day, slot, and recipe details.
* **favorites**: User-saved favorite recipes.
* **meal\_tracking**: Logs for completed meals.
* **recipes\_cache**: Cached recipe information for performance.

---

## 🎨 Design & UI Principles

* **Atomic Components**: Reusable, small UI components for scalability.
* **Responsive Layout**: Mobile-first design using CSS Grid and Flexbox.
* **Consistent Design**: Color scheme, spacing, and typography.
* **Accessible**: Semantic HTML and ARIA attributes.
* **Interactive Elements**: Drag-and-drop Meal Plan, modals, and live updates.

---

## 🔧 Development Practices

* **Code Quality**: ESLint and Prettier enforced for consistency.
* **Error Handling**: Error boundaries for graceful UI degradation.
* **Performance**:

  * Debounced API calls
  * Lazy loading of components
  * Memoization using `React.memo`, `useCallback`, `useMemo`
* **Testing**: Manual test data and structured console logging.

---

## � Features Roadmap

### Completed

* ✅ User authentication
* ✅ Meal planning with drag-and-drop
* ✅ Pantry management and preferences
* ✅ Favorites and recipe tracking
* ✅ Real-time updates via Supabase

### In Progress

* 🔄 Smart suggestions based on pantry & dietary preferences
* � Nutrition tracking and meal scoring
* 🔄 Shopping list generation

### Future Enhancements

* � Grocery delivery integration
* � Advanced AI-powered meal recommendations
* � Voice-assisted meal planning
* � Social sharing of recipes and plans

---

## 🚀 Deployment

```bash
npm run build
```

* Host on **Vercel** or **Netlify**.
* Ensure environment variables are set in production.
* Test all user flows after deployment.

---

## 🙏 Acknowledgments

* [Spoonacular API](https://spoonacular.com/food-api)
* [Supabase](https://supabase.com)
* [React DnD](https://react-dnd.github.io/react-dnd/)

---


