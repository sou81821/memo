import { anthropic } from '@ai-sdk/anthropic';
import { generateText } from 'ai';
import { NextResponse } from 'next/server';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { content } = await req.json();

    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    // The API key is read from the server-side environment variables
    const model = anthropic('claude-3-haiku-20240307');

    const { text } = await generateText({
      model: model,
      system: 'あなたはプロの編集者です。以下の文章を日本語で3行以内で簡潔に要約してください。',
      prompt: content,
    });

    return NextResponse.json({ summary: text });
  } catch (error: any) {
    // Basic error handling to provide more insight into the issue
    if (error.name === 'MissingApiKeyError') {
      return NextResponse.json({ error: 'ANTHROPIC_API_KEY is not configured in .env.local' }, { status: 500 });
    }
    console.error('Summarization error:', error);
    return NextResponse.json({ error: 'Failed to generate summary' }, { status: 500 });
  }
} 