
import React from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Download, Eye, EyeOff } from 'lucide-react';

interface PiiEntity {
    text: string;
    label: string;
    start: number;
    end: number;
}

interface RedactionPreviewProps {
    originalText: string;
    redactedText: string;
    piiEntities: PiiEntity[];
    onDownload: () => void;
}

export function RedactionPreview({
  originalText = "",
  redactedText = "",
  piiEntities = [],
  onDownload
}: RedactionPreviewProps) {
  const entities = piiEntities ?? [];
  const [showOriginal, setShowOriginal] = React.useState(false);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Redaction Results</h2>
        <div className="flex gap-2">
           <Button 
             variant="outline" 
             size="sm"
             onClick={() => setShowOriginal(!showOriginal)}
           >
             {showOriginal ? <><EyeOff size={16} /> Hide Original</> : <><Eye size={16} /> Show Original</>}
           </Button>
           <Button 
             variant="primary" 
             size="sm"
             onClick={onDownload}
           >
             <Download size={16} /> Download
           </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="relative overflow-hidden min-h-[400px]">
           <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500" />
           <h3 className="text-lg font-semibold mb-4 text-gray-300">
             {showOriginal ? "Original Content" : "Redacted Preview"}
           </h3>
           <div className="prose prose-invert max-w-none font-mono text-sm whitespace-pre-wrap overflow-auto h-[350px] p-2 rounded bg-black/30">
              {showOriginal ? originalText : redactedText}
           </div>
        </Card>

        <Card className="min-h-[400px]">
            <h3 className="text-lg font-semibold mb-4 text-gray-300">Detected PII ({entities.length})</h3>
            <div className="space-y-2 overflow-auto h-[350px] pr-2">
                {entities.length === 0 ? (
                    <p className="text-gray-500 italic">No PII detected.</p>
                ) : (
                    entities.map((pii, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 rounded bg-white/5 border border-white/10">
                            <div className="flex flex-col">
                                <span className="font-medium text-red-400">{pii.label}</span>
                                <span className="text-xs text-gray-400">Index: {pii.start}-{pii.end}</span>
                            </div>
                            <span className="bg-red-500/10 text-red-400 px-2 py-1 rounded text-xs font-mono">
                                {pii.text}
                            </span>
                        </div>
                    ))
                )}
            </div>
        </Card>
      </div>
    </div>
  );
}
