import { supabase } from './supabase.js';

/**
 * Simple backend health check utility
 * Tests connection and environment setup
 */

export async function runBackendHealthCheck() {
  console.log('🔍 Running backend health check...');
  
  const results = {
    overall: 'unknown',
    tests: [],
    timestamp: new Date().toISOString()
  };

  // Test Supabase connection
  try {
    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    
    if (error) {
      results.tests.push({ 
        name: 'Supabase Connection', 
        status: 'failed', 
        message: `Connection failed: ${error.message}` 
      });
    } else {
      results.tests.push({ 
        name: 'Supabase Connection', 
        status: 'passed', 
        message: 'Successfully connected to Supabase' 
      });
    }
  } catch (err) {
    results.tests.push({ 
      name: 'Supabase Connection', 
      status: 'failed', 
      message: `Connection error: ${err.message}` 
    });
  }

  // Check environment variables
  const requiredEnvVars = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'];
  const missingVars = requiredEnvVars.filter(key => !import.meta.env[key]);
  
  if (missingVars.length === 0) {
    results.tests.push({ 
      name: 'Environment Variables', 
      status: 'passed', 
      message: 'All required environment variables are set' 
    });
  } else {
    results.tests.push({ 
      name: 'Environment Variables', 
      status: 'failed', 
      message: `Missing: ${missingVars.join(', ')}` 
    });
  }

  // Calculate overall health
  const failed = results.tests.filter(t => t.status === 'failed').length;
  results.overall = failed > 0 ? 'critical' : 'healthy';

  // Display results
  console.log('\n📊 Backend Health Check Results:');
  console.log('=====================================');
  
  results.tests.forEach(test => {
    const icon = test.status === 'passed' ? '✅' : '❌';
    console.log(`${icon} ${test.name}: ${test.message}`);
  });

  const statusIcon = results.overall === 'healthy' ? '🟢' : '🔴';
  console.log(`\n${statusIcon} Overall Status: ${results.overall.toUpperCase()}`);

  if (results.overall === 'critical') {
    console.log('\n🚨 Issues detected:');
    console.log('- Check your environment variables in Netlify');
    console.log('- Verify Supabase project is set up correctly');
  } else {
    console.log('\n🎉 Backend is healthy and ready!');
  }

  return results;
}

// Make available in development
if (import.meta.env.DEV) {
  window.runBackendHealthCheck = runBackendHealthCheck;
  console.log('💡 Run runBackendHealthCheck() in console to test backend');
}