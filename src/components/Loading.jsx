import React from 'react';

export function LoadingSpinner({ size = 'normal', className = '' }) {
  const sizeClass = size === 'large' ? 'loading-spinner--lg' : '';
  
  return (
    <div className={`loading-spinner ${sizeClass} ${className}`} role="status" aria-label="Loading">
      <span className="sr-only">Loading...</span>
    </div>
  );
}

export function RecipeCardSkeleton() {
  return (
    <div className="recipe-card-skeleton">
      <div className="recipe-card-skeleton__image skeleton"></div>
      <div className="recipe-card-skeleton__content">
        <div className="recipe-card-skeleton__title skeleton skeleton--title"></div>
        <div className="recipe-card-skeleton__meta">
          <div className="recipe-card-skeleton__badge skeleton"></div>
          <div className="recipe-card-skeleton__badge skeleton"></div>
          <div className="recipe-card-skeleton__badge skeleton"></div>
        </div>
        <div className="recipe-card-skeleton__summary skeleton skeleton--text"></div>
        <div className="recipe-card-skeleton__summary skeleton skeleton--text"></div>
        <div className="recipe-card-skeleton__actions">
          <div className="recipe-card-skeleton__button skeleton"></div>
          <div className="recipe-card-skeleton__button skeleton"></div>
        </div>
      </div>
    </div>
  );
}

export function RecipesLoadingGrid({ count = 6 }) {
  return (
    <div className="recipes-loading">
      {Array.from({ length: count }, (_, index) => (
        <RecipeCardSkeleton key={index} />
      ))}
    </div>
  );
}

export function PageLoading({ message = "Loading..." }) {
  return (
    <div className="empty-state">
      <LoadingSpinner size="large" />
      <h2 className="empty-state__title">{message}</h2>
      <p className="empty-state__description">
        Please wait while we fetch your data...
      </p>
    </div>
  );
}

export function EmptyState({ 
  icon = "🍽️", 
  title = "No items found", 
  description = "There are no items to display at the moment.",
  action
}) {
  return (
    <div className="empty-state">
      <div className="empty-state__icon">{icon}</div>
      <h2 className="empty-state__title">{title}</h2>
      <p className="empty-state__description">{description}</p>
      {action && <div className="empty-state__action">{action}</div>}
    </div>
  );
}

export default LoadingSpinner;
