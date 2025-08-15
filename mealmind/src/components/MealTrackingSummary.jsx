import { useState, useEffect } from 'react';

export default function MealTrackingSummary({ mealTracking, plan, days, slots }) {
  const [stats, setStats] = useState({
    total: 0,
    made: 0,
    eaten: 0,
    completion: {
      made: 0,
      eaten: 0
    }
  });

  useEffect(() => {
    if (!plan) return;

    // Count total meals planned
    let totalPlanned = 0;
    let totalMade = 0;
    let totalEaten = 0;

    days.forEach(day => {
      slots.forEach(slot => {
        const meal = plan[day]?.[slot];
        if (meal && meal.title) {
          totalPlanned++;
          
          // Check if it's tracked
          const key = `${day}-${slot}`;
          if (mealTracking[key] === 'made') {
            totalMade++;
          }
          if (mealTracking[key] === 'eaten') {
            totalEaten++;
          }
        }
      });
    });

    // Calculate completion percentages
    const madePercentage = totalPlanned > 0 ? Math.round((totalMade / totalPlanned) * 100) : 0;
    const eatenPercentage = totalPlanned > 0 ? Math.round((totalEaten / totalPlanned) * 100) : 0;

    setStats({
      total: totalPlanned,
      made: totalMade,
      eaten: totalEaten,
      completion: {
        made: madePercentage,
        eaten: eatenPercentage
      }
    });
  }, [mealTracking, plan, days, slots]);

  if (stats.total === 0) {
    return null; // Don't show if no meals planned
  }

  return (
    <div className="meal-tracking-summary">
      <h3>Weekly Progress</h3>
      <div className="progress-stats">
        <div className="stat-item">
          <span className="stat-label">Planned</span>
          <span className="stat-value">{stats.total}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Prepared</span>
          <span className="stat-value">{stats.made} ({stats.completion.made}%)</span>
          <div className="progress-bar">
            <div 
              className="progress-fill made" 
              style={{ width: `${stats.completion.made}%` }}
            ></div>
          </div>
        </div>
        <div className="stat-item">
          <span className="stat-label">Consumed</span>
          <span className="stat-value">{stats.eaten} ({stats.completion.eaten}%)</span>
          <div className="progress-bar">
            <div 
              className="progress-fill eaten" 
              style={{ width: `${stats.completion.eaten}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}
