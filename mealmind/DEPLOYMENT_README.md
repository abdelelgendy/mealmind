# MealMind 🍽️

A comprehensive meal planning and recipe management application built with React and Vite.

## ✨ Features

### 🥗 Smart Pantry Management
- **Quick Select**: Add pantry items with one click using emoji-based interface
- **Manual Entry**: Custom item addition with quantities and units
- **Persistent Storage**: Items saved locally and sync with cloud when available
- **Smart Categories**: Organized by Proteins, Vegetables, Fruits, Grains, Dairy, and Pantry Staples

### 📅 Meal Planning
- Weekly meal planning interface
- Drag-and-drop recipe organization
- Integration with pantry items
- Smart recipe suggestions

### 🔍 Recipe Search & Discovery
- Spoonacular API integration for vast recipe database
- Smart filtering based on pantry items
- Favorites management
- Recipe details with nutrition information

### 🎨 Modern UI/UX
- Dark/Light mode toggle
- Responsive design for all devices
- Vibrant, minimalistic interface
- Smooth animations and transitions

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/abdelelgendy/mealmind.git
   cd mealmind/mealmind
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your environment variables:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_SPOONACULAR_API_KEY=your_spoonacular_api_key
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   Navigate to `http://localhost:5173`

## 🏗️ Build & Deploy

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

### Deploy to Netlify
The project is configured for Netlify deployment:
- Push to your repository
- Connect to Netlify
- Set environment variables in Netlify dashboard
- Deploy automatically from main branch

## 🧪 Testing

### Manual Testing Checklist
- [ ] Dashboard loads with proper navigation
- [ ] Pantry quick select adds items instantly
- [ ] Manual pantry form works correctly
- [ ] Items persist after page refresh
- [ ] All navigation links work
- [ ] Responsive design on mobile/desktop
- [ ] Dark/light mode toggle functions
- [ ] Error handling when offline

### Production Build Test
```bash
npm run build && npm run preview
```

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Header.jsx      # Navigation header
│   ├── QuickSelect.jsx # Pantry quick select component
│   └── ...
├── pages/              # Main application pages
│   ├── Dashboard.jsx   # Home dashboard
│   ├── Pantry.jsx      # Pantry management
│   ├── Plan.jsx        # Meal planning
│   └── ...
├── contexts/           # React contexts for state management
├── hooks/              # Custom React hooks
├── lib/                # Utility libraries
├── styles/             # CSS stylesheets
└── constants/          # Application constants
```

## 🔧 Configuration

### Environment Variables
- `VITE_SUPABASE_URL`: Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Supabase anonymous key
- `VITE_SPOONACULAR_API_KEY`: Spoonacular API key for recipes

### Offline Mode
The application gracefully handles offline scenarios:
- Uses localStorage for data persistence
- Continues functioning without database connection
- Syncs data when connection is restored

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:
1. Check the [Issues](https://github.com/abdelelgendy/mealmind/issues) page
2. Create a new issue with detailed description
3. Include browser console errors if applicable

## 🎯 Roadmap

- [ ] Advanced meal planning features
- [ ] Grocery list generation
- [ ] Nutrition tracking
- [ ] Social sharing of recipes
- [ ] Mobile app development

---

Built with ❤️ using React, Vite, and modern web technologies.
