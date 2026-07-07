import { NextResponse } from 'next/server';
import { db } from '@/db';
import { analyses } from '@/db/schema';
import { desc } from 'drizzle-orm';

export async function GET() {
  try {
    const history = await db.select().from(analyses).orderBy(desc(analyses.createdAt));
    return NextResponse.json(history);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 });
  }
}
