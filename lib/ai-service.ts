'use server'

import { jsonrepair } from 'jsonrepair'

const apiKey = process.env.GEMINI_API_KEY

/**
 * Generates intelligent field suggestions for candidates.
 */
export async function generateFormSuggestions(fieldName: string, userInput: string, context: string) {
  if (!apiKey) {
    console.error('GEMINI_API_KEY is not configured')
    return 'Please configure a valid Gemini API key in your environment variables.'
  }

  try {
    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are assisting applicants for KIMUN 2026 (Kalinga International Model United Nations).

Field: ${fieldName}
Current Input: "${userInput}"
Context: ${context}

Task:
Improve this field professionally in 1–2 sentences.
If the input is empty, generate a strong example answer.

Return ONLY the improved text.`
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 150
          }
        })
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Gemini API error:', response.status, errorText)

      if (response.status === 429) {
        return 'AI suggestion temporarily unavailable due to rate limits. Please try again.'
      }

      if (response.status === 503) {
        return 'AI service is currently busy. Please try again shortly.'
      }

      throw new Error(`API returned ${response.status}`)
    }

    const data = await response.json()

    return data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
      'Highlight your leadership roles and contributions in student organizations.'

  } catch (error) {
    console.error('Oasis AI Suggestion Error:', error)

    return 'Highlight your leadership roles and specific contributions in student organizations.'
  }
}


/**
 * Evaluates the Organizing Committee (OC) application merit.
 */
export async function evaluateApplication(applicationData: Record<string, any>, retryCount = 0) {

  if (!apiKey) {
    console.error('GEMINI_API_KEY is not configured')

    return {
      score: 0,
      assessment: 'Gemini API key is not configured.',
      strengths: [],
      improvements: ['Configure GEMINI_API_KEY in .env.local']
    }
  }

  const MAX_RETRIES = 3

  try {

    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are evaluating candidates for the KIMUN 2026 Organizing Committee.

Candidate Data:
${JSON.stringify(applicationData)}

Return ONLY valid JSON.

Schema:
{
 "score": number,
 "assessment": string,
 "strengths": string[],
 "improvements": string[]
}

Rules:
- No markdown
- No explanation
- Only JSON`
            }]
          }],
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 800,
            responseMimeType: "application/json"
          }
        })
      }
    )

    if (!response.ok) {

      const errorText = await response.text()
      console.error('Gemini API error:', response.status, errorText)

      if (response.status === 429 && retryCount < MAX_RETRIES) {

        let delayMs = 2000

        try {
          const errorData = JSON.parse(errorText)

          const retryInfo = errorData?.error?.details?.find(
            (d: any) => d['@type'] === 'type.googleapis.com/google.rpc.RetryInfo'
          )

          if (retryInfo?.retryDelay) {
            const seconds = parseFloat(retryInfo.retryDelay.replace('s', ''))
            delayMs = seconds * 1000
          }

        } catch { }

        console.log(`Rate limited. Retrying in ${delayMs}ms`)

        await new Promise(resolve => setTimeout(resolve, delayMs))

        return evaluateApplication(applicationData, retryCount + 1)
      }

      if (response.status === 503 && retryCount < MAX_RETRIES) {

        const delayMs = 3000

        await new Promise(resolve => setTimeout(resolve, delayMs))

        return evaluateApplication(applicationData, retryCount + 1)
      }

      throw new Error(`API returned ${response.status}`)
    }

    const data = await response.json()

    const responseText =
      data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim()

    console.log("Gemini Raw Response:", responseText)

    if (!responseText) {
      throw new Error("Empty AI response")
    }

    // Clean markdown blocks
    const cleanedText = responseText
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim()

    try {

      const repairedJSON = jsonrepair(cleanedText)

      return JSON.parse(repairedJSON)

    } catch (parseError) {

      console.error("JSON Parse Failed:", cleanedText)

      return {
        score: 50,
        assessment: 'AI evaluation formatting error. Manual review recommended.',
        strengths: [],
        improvements: ['AI response formatting issue']
      }

    }

  } catch (error) {

    console.error('Oasis AI Evaluation Error:', error)

    return {
      score: 0,
      assessment: 'AI evaluation service encountered an error.',
      strengths: [],
      improvements: ['AI service temporarily unavailable']
    }
  }
}


/**
 * Optional: Check Gemini model status
 */
export async function checkModelStatus() {

  if (!apiKey) {
    return { error: 'No API key configured' }
  }

  try {

    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash',
      {
        headers: {
          'x-goog-api-key': apiKey
        }
      }
    )

    if (response.ok) {

      const data = await response.json()

      return {
        available: true,
        model: data
      }

    } else {

      return {
        available: false,
        status: response.status
      }

    }

  } catch (error) {

    return {
      available: false,
      error
    }

  }
}