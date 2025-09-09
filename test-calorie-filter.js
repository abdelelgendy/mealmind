/**
 * Test script to verify calorie filtering functionality
 */

import { searchMockRecipes } from './src/lib/mockData.js';

console.log('🧪 Testing calorie filtering functionality...\n');

// Test 1: Get all recipes (no filters)
const allRecipes = searchMockRecipes('');
console.log(`📊 Total recipes: ${allRecipes.length}`);
allRecipes.forEach(recipe => {
  console.log(`   - ${recipe.title}: ${recipe.calories} calories`);
});

console.log('\n🔍 Testing max calorie filter: 300...');

// Test 2: Filter recipes with max 300 calories
const lowCalRecipes = searchMockRecipes('', { maxCals: '300' });
console.log(`📊 Recipes with ≤300 calories: ${lowCalRecipes.length}`);
lowCalRecipes.forEach(recipe => {
  console.log(`   ✅ ${recipe.title}: ${recipe.calories} calories`);
});

console.log('\n🔍 Testing max calorie filter: 400...');

// Test 3: Filter recipes with max 400 calories
const medCalRecipes = searchMockRecipes('', { maxCals: '400' });
console.log(`📊 Recipes with ≤400 calories: ${medCalRecipes.length}`);
medCalRecipes.forEach(recipe => {
  console.log(`   ✅ ${recipe.title}: ${recipe.calories} calories`);
});

console.log('\n✅ Test completed!');
