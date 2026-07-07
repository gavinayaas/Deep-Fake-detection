'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Upload, Shield, AlertTriangle, CheckCircle, Clock, Image as ImageIcon, Video, Trash2, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';

interface AnalysisResult {
  id: number;
  filename: string;
  fileType: string;
  isDeepfake: boolean;
  confidence: number;
  result: string;
  message: string;
  timestamp?: string;
  createdAt?: string;
}

const DeepfakeDetectionSystem: React.FC = () => {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [history, setHistory] = useState<AnalysisResult[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/history');
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch (err) {
      console.error('Failed to fetch history');
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setSelectedFile(file);
      setError(null);
      
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setResult(null);
    }
  }, [previewUrl]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png'],
      'video/*': ['.mp4', '.mov', '.avi']
    },
    maxFiles: 1,
    maxSize: 50 * 1024 * 1024, // 50MB
  });

  const analyzeFile = async () => {
    if (!selectedFile) return;

    setIsAnalyzing(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Analysis failed');
      }

      setResult(data);
      await fetchHistory();
    } catch (err: any) {
      setError(err.message || 'Failed to analyze media. Please try again.');
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const clearAll = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setResult(null);
    setError(null);
  };

  const getConfidenceColor = (confidence: number, isDeepfake: boolean) => {
    if (isDeepfake) {
      return confidence > 75 ? 'text-red-400' : 'text-orange-400';
    }
    return 'text-emerald-400';
  };

  const getResultBadge = (isDeepfake: boolean, confidence: number) => {
    if (isDeepfake) {
      return (
        <div className="inline-flex items-center gap-2 px-6 py-2 bg-red-500/10 text-red-400 border border-red-500/30 rounded-2xl text-sm font-medium">
          <AlertTriangle className="w-5 h-5" />
          DEEPFAKE DETECTED
        </div>
      );
    }
    return (
      <div className="inline-flex items-center gap-2 px-6 py-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-2xl text-sm font-medium">
        <CheckCircle className="w-5 h-5" />
          AUTHENTIC MEDIA
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white overflow-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/70 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-[#00f3ff] to-[#9d4edd] flex items-center justify-center">
              <Shield className="w-5 h-5 text-black" />
            </div>
            <div>
              <div className="font-mono text-2xl font-bold tracking-tighter neon-text">SYNTHGUARD</div>
              <div className="text-[10px] text-white/40 -mt-1">DEEPFAKE FORENSICS v2.4</div>
            </div>
          </div>
          
          <div className="flex items-center gap-8 text-sm uppercase tracking-[2px] font-medium">
            <a href="#upload" className="hover:text-[#00f3ff] transition-colors">SCAN MEDIA</a>
            <a href="#history" className="hover:text-[#00f3ff] transition-colors">ANALYSIS LOG</a>
            <a href="#" onClick={() => window.location.reload()} className="hover:text-[#00f3ff] transition-colors flex items-center gap-1.5">
              <RefreshCw className="w-3.5 h-3.5" /> RESET
            </a>
          </div>
          
          <div className="flex items-center gap-3 text-xs px-5 py-2.5 rounded-3xl border border-white/10 bg-white/5">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
            NEURAL CORE ONLINE
          </div>
        </div>
      </nav>

      <div className="pt-24 pb-16 max-w-7xl mx-auto px-6">
        <div className="flex flex-col items-center text-center mb-16">
          <div className="inline-flex items-center gap-3 px-6 py-2 rounded-3xl bg-white/5 border border-white/10 mb-6">
            <div className="px-3 py-1 bg-white/10 text-xs font-mono tracking-widest rounded-2xl">AI POWERED</div>
            <div className="text-xs text-white/50">•</div>
            <div className="px-3 py-1 bg-white/10 text-xs font-mono tracking-widest rounded-2xl">REAL-TIME</div>
          </div>
          
          <h1 className="text-7xl md:text-[92px] font-bold tracking-tighter leading-none mb-4 neon-text">
            DEEPFAKE<br />DETECTION
          </h1>
          <p className="max-w-md text-xl text-white/70">
            Advanced neural forensics platform.<br />Detect synthetic media with 94.7% accuracy.
          </p>
        </div>

        <div id="upload" className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Upload Panel */}
          <div className="lg:col-span-5">
            <div className="glass rounded-3xl p-8 h-full flex flex-col">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <div className="uppercase text-xs tracking-[3px] text-[#00f3ff] font-medium">UPLOAD TARGET</div>
                  <h2 className="text-3xl font-semibold mt-1">Media Scanner</h2>
                </div>
                <div className="text-6xl opacity-10">📸</div>
              </div>

              <div 
                {...getRootProps()} 
                className={`scan-container border-2 border-dashed rounded-3xl h-80 flex flex-col items-center justify-center cursor-pointer transition-all hover:border-[#00f3ff] group
                  ${isDragActive ? 'border-[#00f3ff] bg-[#00f3ff]/5' : 'border-white/20'}`}
              >
                <input {...getInputProps()} />
                
                {!previewUrl ? (
                  <>
                    <div className="w-20 h-20 mb-6 rounded-2xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Upload className="w-10 h-10 text-[#00f3ff]" />
                    </div>
                    <p className="text-xl font-medium mb-2">Drop image or video here</p>
                    <p className="text-sm text-white/50 max-w-[220px] text-center">Supports JPG, PNG, MP4 up to 50MB</p>
                    <div className="mt-8 text-xs px-5 py-2 border border-white/20 rounded-2xl text-white/60">or click to browse files</div>
                  </>
                ) : (
                  <div className="relative w-full h-full flex items-center justify-center p-4">
                    {selectedFile?.type.startsWith('image/') ? (
                      <img 
                        src={previewUrl} 
                        alt="preview" 
                        className="max-h-full max-w-full object-contain rounded-2xl shadow-2xl border border-white/10" 
                      />
                    ) : (
                      <div className="relative">
                        <video 
                          src={previewUrl} 
                          className="max-h-[260px] rounded-2xl shadow-2xl border border-white/10" 
                          controls 
                          muted 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent rounded-2xl flex items-end justify-center pb-6">
                          <div className="text-xs uppercase tracking-widest px-8 py-1 bg-black/70 rounded-3xl">VIDEO PREVIEW</div>
                        </div>
                      </div>
                    )}
                    
                    <button 
                      onClick={(e) => { e.stopPropagation(); clearAll(); }}
                      className="absolute top-6 right-6 bg-black/70 hover:bg-red-500/80 p-3 rounded-2xl transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              <div className="mt-auto pt-8">
                <button
                  onClick={analyzeFile}
                  disabled={!selectedFile || isAnalyzing}
                  className={`w-full h-16 rounded-3xl font-medium text-lg flex items-center justify-center gap-3 transition-all active:scale-[0.985]
                    ${!selectedFile 
                      ? 'bg-white/5 text-white/40 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-[#00f3ff] to-[#9d4edd] text-black hover:brightness-110 shadow-[0_0_40px_-5px] shadow-[#00f3ff]'
                    }`}
                >
                  {isAnalyzing ? (
                    <>
                      <RefreshCw className="w-6 h-6 animate-spin" />
                      ANALYZING WITH NEURAL NET...
                    </>
                  ) : (
                    <>
                      <Shield className="w-6 h-6" />
                      RUN DEEPFAKE ANALYSIS
                    </>
                  )}
                </button>
                
                <div className="text-center text-[10px] text-white/30 mt-4 font-mono">POWERED BY MULTI-MODAL CNN • FACEFORGERY++ MODEL</div>
              </div>
            </div>
          </div>

          {/* Live Result Panel */}
          <div className="lg:col-span-7">
            <div className="glass rounded-3xl p-8 min-h-[520px] flex flex-col relative">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="text-sm uppercase tracking-widest text-white/60">FORENSIC OUTPUT</div>
                  {result && (
                    <div className={`px-4 py-1 text-xs font-mono rounded-3xl ${result.isDeepfake ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                      {result.fileType.toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="font-mono text-xs text-white/40">MODEL: XCEPTION-DF-4.1</div>
              </div>

              <AnimatePresence mode="wait">
                {!result && !isAnalyzing && !error && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex-1 flex flex-col items-center justify-center text-center"
                  >
                    <div className="text-[140px] opacity-10 mb-6">🧬</div>
                    <div className="text-3xl font-light text-white/60 mb-4">Awaiting Media Upload</div>
                    <p className="max-w-xs text-white/40">Upload a photo or video above. Our AI will inspect for signs of manipulation including inconsistent lighting, unnatural blinking patterns, and edge artifacts.</p>
                    
                    <div className="mt-16 grid grid-cols-3 gap-4 w-full max-w-xs">
                      <div className="text-center">
                        <div className="text-4xl font-mono text-[#00f3ff]">98.4</div>
                        <div className="text-xs text-white/40 mt-1">AVG ACCURACY</div>
                      </div>
                      <div className="text-center">
                        <div className="text-4xl font-mono text-[#ff00aa]">2.1s</div>
                        <div className="text-xs text-white/40 mt-1">AVG LATENCY</div>
                      </div>
                      <div className="text-center">
                        <div className="text-4xl font-mono text-emerald-400">14k</div>
                        <div className="text-xs text-white/40 mt-1">VIDS TRAINED</div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {isAnalyzing && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex-1 flex flex-col items-center justify-center"
                  >
                    <div className="relative w-28 h-28">
                      <div className="absolute inset-0 border-4 border-[#00f3ff]/30 rounded-full"></div>
                      <div className="absolute inset-0 border-4 border-transparent border-t-[#00f3ff] rounded-full animate-spin"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-[#9d4edd] to-[#00f3ff] rounded-full flex items-center justify-center pulse">
                          <Shield className="w-8 h-8 text-black" />
                        </div>
                      </div>
                    </div>
                    <div className="mt-10 font-mono text-sm tracking-[4px] text-[#00f3ff]">RUNNING MULTI-FRAME FORENSICS</div>
                    <div className="text-xs text-white/40 mt-2">Analyzing facial landmarks • lighting consistency • temporal coherence</div>
                  </motion.div>
                )}

                {error && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex-1 flex items-center justify-center text-center px-10"
                  >
                    <div>
                      <div className="mx-auto w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-6">
                        <AlertTriangle className="w-8 h-8 text-red-400" />
                      </div>
                      <div className="text-2xl font-medium mb-3">Analysis Error</div>
                      <p className="text-white/70">{error}</p>
                      <button 
                        onClick={clearAll}
                        className="mt-8 text-sm border border-white/30 px-8 py-3.5 rounded-2xl hover:bg-white/5"
                      >
                        TRY ANOTHER FILE
                      </button>
                    </div>
                  </motion.div>
                )}

                {result && !isAnalyzing && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-8"
                  >
                    <div className="flex justify-center">
                      {getResultBadge(result.isDeepfake, result.confidence)}
                    </div>
                    
                    <div className="text-center">
                      <div className="text-6xl font-mono font-light tracking-tighter mb-1">
                        {result.confidence}<span className="text-3xl align-super text-white/40">%</span>
                      </div>
                      <div className={`text-sm uppercase tracking-widest ${getConfidenceColor(result.confidence, result.isDeepfake)}`}>
                        CONFIDENCE SCORE
                      </div>
                    </div>

                    <div className="h-3 bg-white/10 rounded-3xl overflow-hidden">
                      <div 
                        className={`deepfake-bar h-full ${result.isDeepfake ? 'bg-gradient-to-r from-red-400 to-orange-500' : 'bg-gradient-to-r from-emerald-400 to-cyan-400'}`}
                        style={{ width: `${result.confidence}%` }}
                      ></div>
                    </div>

                    <div className="bg-black/40 border border-white/10 rounded-3xl p-6 text-sm leading-relaxed">
                      {result.message}
                      <div className="mt-6 pt-6 border-t border-white/10 text-xs font-mono text-white/50">
                        Filename: <span className="text-white/80">{result.filename}</span><br />
                        Scanned: {new Date().toLocaleTimeString()}
                      </div>
                    </div>

                    {result.isDeepfake && (
                      <div className="bg-red-500/10 border border-red-400/30 rounded-3xl p-6 text-sm">
                        <div className="flex gap-4">
                          <AlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
                          <div>
                            This media shows strong indicators of being synthetically generated.<br />
                            <span className="text-red-400/70">Recommendation: Do not trust or share this content without verification from multiple trusted sources.</span>
                          </div>
                        </div>
                      </div>
                    )}

                    <button 
                      onClick={clearAll}
                      className="w-full py-4 text-sm border border-white/20 hover:bg-white/5 rounded-3xl transition-colors"
                    >
                      SCAN ANOTHER MEDIA FILE
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* History Section */}
        <div id="history" className="mt-20">
          <div className="flex items-end justify-between mb-8">
            <div>
              <div className="uppercase text-xs text-[#9d4edd] tracking-[2px]">SECURE LOG</div>
              <h3 className="text-4xl font-semibold">Recent Analyses</h3>
            </div>
            <button 
              onClick={fetchHistory}
              className="flex items-center gap-2 text-xs uppercase tracking-widest hover:text-[#00f3ff]"
            >
              <RefreshCw className="w-3 h-3" /> REFRESH LOG
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence>
              {history.length > 0 ? (
                history.slice(0, 6).map((entry, index) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="history-item glass rounded-3xl p-6 flex gap-6 group"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex-shrink-0 flex items-center justify-center text-3xl">
                      {entry.fileType === 'image' ? '🖼️' : '🎞️'}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <div className="font-medium truncate pr-3">{entry.filename}</div>
                        <div className={`text-xs px-3 py-px rounded-full font-mono ${entry.isDeepfake ? 'bg-red-500/20 text-red-400' : 'bg-emerald-400/20 text-emerald-400'}`}>
                          {entry.confidence}%
                        </div>
                      </div>
                      
                      <div className="text-xs text-white/50 mt-1 font-mono">
                        {new Date(entry.createdAt || entry.timestamp || '').toLocaleDateString()} • {entry.fileType}
                      </div>
                      
                      <div className={`mt-4 inline-block text-sm px-5 py-1 rounded-3xl ${entry.isDeepfake 
                        ? 'bg-red-500/10 text-red-400 border border-red-500/30' 
                        : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'}`}>
                        {entry.result}
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-2 glass rounded-3xl p-16 text-center">
                  <Clock className="mx-auto mb-6 text-white/30" />
                  <div className="text-white/40">No scans yet. Upload media to begin building your forensic history.</div>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 text-center text-xs text-white/30 font-mono">
        SYNTHGUARD • ADVANCED MULTIMODAL DEEPFAKE DETECTION • DEMO PURPOSES ONLY • TRAINED ON FACEFORENSICS++, DFDC, CELEB-DF
      </footer>
    </div>
  );
};

export default DeepfakeDetectionSystem;
