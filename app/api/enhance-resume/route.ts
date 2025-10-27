import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_KEY || '');

export async function POST(request: Request) {
  try {
    const { section, content, suggestions, keywords } = await request.json();

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    const prompt = `Enhance this resume ${section} section to be more impactful and ATS-friendly.
    
    Current content:
    ${content}

    Enhancement requirements:
    1. Use strong action verbs
    2. Add specific metrics where possible
    3. Include these keywords naturally: ${keywords.join(', ')}
    4. Address these improvements: ${suggestions.map((s: string) => `- ${s}`).join('\n')}
    5. Keep it concise but impactful
    
    Return only the enhanced content without any explanations or formatting.`;

    const result = await model.generateContent(prompt);
    const enhancedContent = await result.response.text();

    return NextResponse.json({
      content: enhancedContent,
      success: true
    });

  } catch (error) {
    console.error('Enhancement error:', error);
    return NextResponse.json(
      { error: 'Failed to enhance resume content', success: false },
      { status: 500 }
    );
  }
}
