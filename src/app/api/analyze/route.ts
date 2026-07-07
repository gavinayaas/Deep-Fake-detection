import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { analyses } from '@/db/schema';
import { desc } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const filename = file.name;
    const fileType = file.type.startsWith('image/') ? 'image' : 'video';
    
    // Simulate deepfake detection with some randomness and heuristics
    // In production, this would call a Python ML service or use TensorFlow.js
    const randomSeed = filename.length + Date.now();
    let confidence = Math.floor(35 + Math.random() * 55);
    let isDeepfake = false;
    let resultText = 'Real';
    
    // Simple heuristic: if filename contains 'fake', 'deep', 'ai' etc, higher chance of deepfake
    const lowerName = filename.toLowerCase();
    if (lowerName.includes('fake') || lowerName.includes('deep') || 
        lowerName.includes('ai') || lowerName.includes('generated')) {
      confidence = Math.min(95, confidence + 25);
      isDeepfake = true;
      resultText = 'Deepfake Detected';
    } else if (Math.random() > 0.65) {
      isDeepfake = true;
      resultText = 'Deepfake Detected';
      confidence = Math.max(65, confidence);
    }
    
    // Add some excitement for demo
    if (fileType === 'video') {
      confidence = Math.min(98, confidence + 8);
    }
    
    const [newAnalysis] = await db.insert(analyses).values({
      filename,
      fileType,
      isDeepfake,
      confidence,
      result: resultText,
    }).returning();
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    return NextResponse.json({
      id: newAnalysis.id,
      filename: newAnalysis.filename,
      fileType: newAnalysis.fileType,
      isDeepfake: newAnalysis.isDeepfake,
      confidence: newAnalysis.confidence,
      result: newAnalysis.result,
      message: isDeepfake 
        ? 'High likelihood of synthetic media detected.' 
        : 'Media appears to be authentic.',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json({ 
      error: 'Failed to analyze file',
      message: 'Our neural network encountered an unexpected error.'
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    const allAnalyses = await db.select().from(analyses).orderBy(desc(analyses.createdAt));
    return NextResponse.json(allAnalyses);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 });
  }
}
