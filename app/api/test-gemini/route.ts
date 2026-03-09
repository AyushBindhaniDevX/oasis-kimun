import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    return NextResponse.json({ 
      error: 'GEMINI_API_KEY is not set',
      status: 'missing_key'
    }, { status: 500 });
  }

  // Test with a simple curl-like request using fetch
  try {
    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models?key=' + apiKey,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({ 
        error: 'API key validation failed',
        status: response.status,
        statusText: response.statusText,
        details: errorText,
        apiKeyPrefix: apiKey.substring(0, 5) + '...' // Show first 5 chars for debugging
      }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json({ 
      success: true, 
      models: data.models,
      apiKeyPrefix: apiKey.substring(0, 5) + '...'
    });
    
  } catch (error) {
    return NextResponse.json({ 
      error: 'Network error',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}