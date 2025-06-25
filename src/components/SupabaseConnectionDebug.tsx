import React, { useState } from 'react';

export default function SupabaseConnectionDebug() {
  const [results, setResults] = useState<string[]>([]);
  const [testing, setTesting] = useState(false);

  const testConnection = async () => {
    setTesting(true);
    const testResults: string[] = [];
    
    // Test 1: Basic project connectivity
    try {
      const response = await fetch('https://bcblhwcluxpxypvomjcr.supabase.co/rest/v1/', {
        method: 'HEAD',
      });
      testResults.push(`Project URL Response: ${response.status}`);
    } catch (error) {
      testResults.push(`Project URL Error: ${error}`);
    }

    // Test 2: With API key
    try {
      const response = await fetch('https://bcblhwcluxpxypvomjcr.supabase.co/rest/v1/', {
        method: 'HEAD',
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjYmxod2NsdXhweHlwdm9tamNyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NDA3MDYsImV4cCI6MjA2NjQxNjcwNn0.q7fKN-XH0AsP6Tclt9pzobWTvArk3d3ErwmzMncaqnY',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjYmxod2NsdXhweHlwdm9tamNyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NDA3MDYsImV4cCI6MjA2NjQxNjcwNn0.q7fKN-XH0AsP6Tclt9pzobWTvArk3d3ErwmzMncaqnY'
        }
      });
      testResults.push(`With API Key Response: ${response.status}`);
      
      // Try to get error details
      if (!response.ok) {
        const errorText = await response.text();
        testResults.push(`Error details: ${errorText}`);
      }
    } catch (error) {
      testResults.push(`API Key Test Error: ${error}`);
    }

    // Test 3: Check if JWT is valid format
    const jwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjYmxod2NsdXhweHlwdm9tamNyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NDA3MDYsImV4cCI6MjA2NjQxNjcwNn0.q7fKN-XH0AsP6Tclt9pzobWTvArk3d3ErwmzMncaqnY';
    try {
      const [header, payload, signature] = jwt.split('.');
      const decodedPayload = JSON.parse(atob(payload));
      testResults.push(`JWT Payload: ${JSON.stringify(decodedPayload, null, 2)}`);
      testResults.push(`JWT Expiry: ${new Date(decodedPayload.exp * 1000).toISOString()}`);
    } catch (error) {
      testResults.push(`JWT Decode Error: ${error}`);
    }

    setResults(testResults);
    setTesting(false);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Supabase Connection Debug</h2>
      
      <button 
        onClick={testConnection}
        disabled={testing}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {testing ? 'Testing...' : 'Run Debug Test'}
      </button>
      
      {results.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Debug Results:</h3>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {results.join('\n')}
          </pre>
        </div>
      )}
    </div>
  );
}