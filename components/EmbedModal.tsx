import React, { useState, useEffect } from 'react';
import { X, Copy, Check, Code, Globe, AlertTriangle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const EmbedModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [embedUrl, setEmbedUrl] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
        // Default to the current URL without query parameters
        setEmbedUrl(window.location.origin + window.location.pathname);
    }
  }, []);
  
  if (!isOpen) return null;

  // Responsive iframe code
  const embedCode = `<iframe src="${embedUrl}" width="100%" height="1000" style="border:none; border-radius: 12px; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1); background: #fff;" title="GTA Condo Valuation Tool"></iframe>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 transform transition-all scale-100 flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center mb-5 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-blue-50 p-2.5 rounded-xl">
                <Code className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Embed Calculator</h3>
              <p className="text-xs text-gray-500">Add this tool to your website</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="overflow-y-auto flex-grow pr-1 custom-scrollbar">
            <p className="text-gray-600 text-sm mb-4 leading-relaxed">
              Copy the code below and paste it into your WordPress site (via a <strong>Custom HTML</strong> block) or any other website.
            </p>

            {/* URL Input Field */}
            <div className="mb-4 space-y-2">
                <label className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-blue-500" />
                    Tool URL (Edit if deploying to production)
                </label>
                <input 
                    type="url" 
                    value={embedUrl}
                    onChange={(e) => setEmbedUrl(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none transition-all"
                    placeholder="https://your-app-url.vercel.app"
                />
                <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-3 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-yellow-800 leading-snug">
                        <strong>Important:</strong> If you are currently viewing a preview URL (e.g., from a cloud IDE), it might be private. Ensure you use your deployed public URL (e.g., Vercel, Netlify) above.
                    </p>
                </div>
            </div>

            <div className="relative mb-2 group">
              <div className="absolute inset-0 bg-blue-500 rounded-xl opacity-0 group-hover:opacity-5 transition-opacity pointer-events-none"></div>
              <textarea 
                readOnly 
                value={embedCode}
                onClick={(e) => e.currentTarget.select()}
                className="w-full h-32 p-4 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono text-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none transition-all"
              />
              <button 
                onClick={handleCopy}
                className="absolute top-3 right-3 p-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-all z-10"
                title="Copy to clipboard"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5 text-gray-500" />}
              </button>
            </div>
        </div>

        <div className="flex justify-end gap-3 mt-5 flex-shrink-0 pt-3 border-t border-gray-100">
            <button onClick={onClose} className="px-4 py-2.5 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition-colors text-sm">
                Close
            </button>
            <button onClick={handleCopy} className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2 text-sm transform active:scale-95">
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied Code' : 'Copy Code'}
            </button>
        </div>
      </div>
    </div>
  );
};

export default EmbedModal;