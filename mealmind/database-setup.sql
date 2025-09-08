-- MealMind Database Schema
-- Run this in your Supabase SQL Editor to create all required tables

-- Keep the recipes_cache table (no changes needed)
CREATE TABLE IF NOT EXISTS recipes_cache (
  id SERIAL PRIMARY KEY,
  recipe_id TEXT UNIQUE,
  title TEXT,
  image TEXT,               -- Image URL
  calories INTEGER,
  ingredients JSONB,
  instructions JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Profiles table (user preferences)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  calories INTEGER DEFAULT 2000,
  diet TEXT,
  allergies TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Pantry table (user's ingredients)
CREATE TABLE IF NOT EXISTS pantry (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  name TEXT,
  quantity INTEGER,
  unit TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add an image column to meal_plans for storing the recipe image URL
CREATE TABLE IF NOT EXISTS meal_plans (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  day TEXT,
  slot TEXT,
  recipe_id TEXT,
  title TEXT,
  image TEXT,               -- New column for image URL
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create the favorites table
CREATE TABLE IF NOT EXISTS favorites (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  recipe_id TEXT UNIQUE,
  title TEXT,
  image TEXT,    -- Image URL
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create meal tracking table
CREATE TABLE IF NOT EXISTS meal_tracking (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  day TEXT,
  slot TEXT,
  status TEXT, -- 'made', 'eaten', etc.
  tracked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, day, slot) -- Each user can only have one tracking status per day/slot
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_id_on_pantry ON pantry(user_id);
CREATE INDEX IF NOT EXISTS idx_user_id_on_meal_plans ON meal_plans(user_id);
CREATE INDEX IF NOT EXISTS favorites_user_id_idx ON favorites(user_id);
CREATE INDEX IF NOT EXISTS meal_tracking_user_id_idx ON meal_tracking(user_id);

-- Enable Row Level Security on all tables
ALTER TABLE recipes_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE pantry ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_tracking ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for recipes_cache (public read access)
DROP POLICY IF EXISTS "Anyone can read recipes_cache" ON recipes_cache;
DROP POLICY IF EXISTS "Anyone can insert into recipes_cache" ON recipes_cache;
CREATE POLICY "Anyone can read recipes_cache" ON recipes_cache FOR SELECT USING (true);
CREATE POLICY "Anyone can insert into recipes_cache" ON recipes_cache FOR INSERT WITH CHECK (true);

-- Create RLS policies for user-specific tables
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can view own pantry" ON pantry;
DROP POLICY IF EXISTS "Users can insert own pantry" ON pantry;
DROP POLICY IF EXISTS "Users can update own pantry" ON pantry;
DROP POLICY IF EXISTS "Users can delete own pantry" ON pantry;
CREATE POLICY "Users can view own pantry" ON pantry FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own pantry" ON pantry FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own pantry" ON pantry FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own pantry" ON pantry FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own meal_plans" ON meal_plans;
DROP POLICY IF EXISTS "Users can insert own meal_plans" ON meal_plans;
DROP POLICY IF EXISTS "Users can update own meal_plans" ON meal_plans;
DROP POLICY IF EXISTS "Users can delete own meal_plans" ON meal_plans;
CREATE POLICY "Users can view own meal_plans" ON meal_plans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own meal_plans" ON meal_plans FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own meal_plans" ON meal_plans FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own meal_plans" ON meal_plans FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own favorites" ON favorites;
DROP POLICY IF EXISTS "Users can insert own favorites" ON favorites;
DROP POLICY IF EXISTS "Users can delete own favorites" ON favorites;
CREATE POLICY "Users can view own favorites" ON favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own favorites" ON favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own favorites" ON favorites FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own meal_tracking" ON meal_tracking;
DROP POLICY IF EXISTS "Users can insert own meal_tracking" ON meal_tracking;
DROP POLICY IF EXISTS "Users can update own meal_tracking" ON meal_tracking;
DROP POLICY IF EXISTS "Users can delete own meal_tracking" ON meal_tracking;
CREATE POLICY "Users can view own meal_tracking" ON meal_tracking FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own meal_tracking" ON meal_tracking FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own meal_tracking" ON meal_tracking FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own meal_tracking" ON meal_tracking FOR DELETE USING (auth.uid() = user_id);
