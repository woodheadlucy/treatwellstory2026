import { useState, useRef } from 'react';
import { Button } from './ui/button';
import { Upload, X, AlertCircle, CheckCircle2, Image as ImageIcon, Video, Loader2, ArrowLeft, Sparkles, BarChart3 } from 'lucide-react';

export interface UploadedMedia {
  id: string;
  file: File;
  url: string;
  type: 'image' | 'video';
  status: 'analyzing' | 'approved' | 'rejected';
  aiAnalysis?: {
    contentType: string[];
    tags: string[];
    moderationStatus: 'safe' | 'unsafe';
    moderationReasons?: string[];
    confidence: number;
  };
}

export function StoryUploadModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [uploadedMedia, setUploadedMedia] = useState<UploadedMedia[]>([]);
  const [showRejectionDialog, setShowRejectionDialog] = useState(false);
  const [rejectionReasons, setRejectionReasons] = useState<string[]>([]);
  const [isPublishing, setIsPublishing] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    // Only take the first file (single file upload)
    const file = files[0];
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');

    if (!isImage && !isVideo) return;

    // Clear existing media before adding new one
    uploadedMedia.forEach(media => URL.revokeObjectURL(media.url));
    
    const url = URL.createObjectURL(file);
    const newMedia: UploadedMedia = {
      id: Math.random().toString(36).substring(7),
      file,
      url,
      type: isImage ? 'image' : 'video',
      status: 'analyzing',
    };

    setUploadedMedia([newMedia]);

    // Simulate AI analysis
    simulateAIAnalysis(newMedia.id);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const simulateAIAnalysis = async (mediaId: string) => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 2000 + Math.random() * 2000));

    setUploadedMedia((prev) =>
      prev.map((media) => {
        if (media.id !== mediaId) return media;

        // Random analysis results for demo
        const isSafe = Math.random() > 0.15; // 85% approval rate
        const contentTypes = [
          'Haircut',
          'Hair Coloring',
          'Manicure',
          'Pedicure',
          'Facial Treatment',
          'Massage',
          'Makeup',
          'Hair Styling',
        ];
        const randomContentType = contentTypes[Math.floor(Math.random() * contentTypes.length)];

        const tags = generateTags(randomContentType);

        const moderationReasons = isSafe
          ? undefined
          : ['Potentially inappropriate content detected', 'Image quality too low'];

        // Show rejection dialog if content is rejected
        if (!isSafe && moderationReasons) {
          setRejectionReasons(moderationReasons);
          setShowRejectionDialog(true);
        }

        return {
          ...media,
          status: isSafe ? 'approved' : 'rejected',
          aiAnalysis: {
            contentType: [randomContentType],
            tags,
            moderationStatus: isSafe ? 'safe' : 'unsafe',
            moderationReasons,
            confidence: 0.85 + Math.random() * 0.14,
          },
        };
      })
    );
  };

  const generateTags = (contentType: string): string[] => {
    const tagOptions: Record<string, string[]> = {
      Haircut: ['Short hair', 'Long hair', 'Bob', 'Layers', 'Bangs'],
      'Hair Coloring': ['Blonde', 'Brunette', 'Highlights', 'Balayage', 'Ombre'],
      Manicure: ['Gel nails', 'Acrylic', 'French tips', 'Nail art', 'Natural nails'],
      Pedicure: ['Foot care', 'Toe nail art', 'Summer ready', 'Spa treatment'],
      'Facial Treatment': ['Glowing skin', 'Anti-aging', 'Hydrating', 'Deep cleanse'],
      Massage: ['Relaxation', 'Deep tissue', 'Hot stone', 'Aromatherapy'],
      Makeup: ['Smokey eyes', 'Natural look', 'Bold lips', 'Bridal makeup'],
      'Hair Styling': ['Updo', 'Curls', 'Blowout', 'Braids', 'Waves'],
    };

    const options = tagOptions[contentType] || ['Professional', 'Quality service'];
    const numTags = 2 + Math.floor(Math.random() * 3);
    return options.slice(0, numTags);
  };

  const removeMedia = (id: string) => {
    setUploadedMedia((prev) => {
      const media = prev.find((m) => m.id === id);
      if (media) {
        URL.revokeObjectURL(media.url);
      }
      return prev.filter((m) => m.id !== id);
    });
  };

  const handlePublish = async () => {
    const approvedMedia = uploadedMedia.filter((m) => m.status === 'approved');
    if (approvedMedia.length > 0) {
      setIsPublishing(true);
      // Simulate publishing process
      await new Promise(resolve => setTimeout(resolve, 2000));
      setIsPublishing(false);
      setShowSuccessDialog(true);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccessDialog(false);
    setUploadedMedia([]);
    onOpenChange(false);
  };

  const approvedCount = uploadedMedia.filter((m) => m.status === 'approved').length;
  const analyzingCount = uploadedMedia.filter((m) => m.status === 'analyzing').length;
  const rejectedCount = uploadedMedia.filter((m) => m.status === 'rejected').length;

  // Don't render anything if not open
  if (!open) return null;

  // Show upload screen
  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      {/* Success Dialog */}
      {showSuccessDialog && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-[var(--radius-card)] p-8 max-w-md w-full shadow-2xl">
            <div className="text-center">
              {/* Success Icon with Animation */}
              <div className="mx-auto mb-6 w-20 h-20 bg-chart-2/20 rounded-full flex items-center justify-center">
                <CheckCircle2 size={48} className="text-chart-2" />
              </div>
              
              {/* Exciting Message */}
              <h2 className="mb-3" style={{ fontSize: '24px', fontWeight: 'var(--font-weight-medium)' }}>
                🎉 Your Stories Are Going Live!
              </h2>
              <p className="text-muted-foreground mb-6" style={{ fontSize: '16px', lineHeight: '1.6' }}>
                Amazing! Your stories will appear on the Treatwell marketplace in the next few minutes and start attracting customers.
              </p>

              {/* Stats Info Card */}
              <div className="bg-primary/10 border border-primary/30 rounded-[var(--radius-lg)] p-5 mb-6 text-left">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <BarChart3 size={20} className="text-primary" />
                  </div>
                  <div>
                    <h4 className="text-foreground mb-1.5" style={{ fontSize: '15px', fontWeight: 'var(--font-weight-medium)' }}>
                      Track Your Success
                    </h4>
                    <p className="text-muted-foreground" style={{ fontSize: '14px', lineHeight: '1.5' }}>
                      Visit the <strong className="text-foreground">Reports</strong> section to see how many customers viewed your stories and placed bookings. Watch your engagement grow! 📈
                    </p>
                  </div>
                </div>
              </div>

              {/* CTA Button */}
              <Button onClick={handleSuccessClose} className="w-full" size="lg">
                Done
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Dialog */}
      {showRejectionDialog && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-[var(--radius-card)] p-8 max-w-md w-full shadow-2xl">
            <div className="text-center">
              {/* Error Icon */}
              <div className="mx-auto mb-6 w-20 h-20 bg-destructive/20 rounded-full flex items-center justify-center">
                <AlertCircle size={48} className="text-destructive" />
              </div>
              
              {/* Error Message */}
              <h2 className="mb-3 text-destructive" style={{ fontSize: '24px', fontWeight: 'var(--font-weight-bold)' }}>
                Content Not Approved
              </h2>
              <p className="text-muted-foreground mb-6" style={{ fontSize: '16px', lineHeight: '1.6' }}>
                Our AI detected issues with your uploaded content. Please review the reasons below and upload a different picture or video that meets our guidelines.
              </p>

              {/* Rejection Reasons */}
              <div className="bg-destructive/10 border border-destructive/30 rounded-[var(--radius-lg)] p-5 mb-6 text-left">
                <h4 className="text-foreground mb-3" style={{ fontSize: '15px', fontWeight: 'var(--font-weight-bold)' }}>
                  Rejection Reasons:
                </h4>
                <ul className="space-y-2">
                  {rejectionReasons.map((reason, index) => (
                    <li key={index} className="flex items-start gap-2 text-muted-foreground" style={{ fontSize: '14px', lineHeight: '1.5' }}>
                      <span className="text-destructive mt-1">•</span>
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowRejectionDialog(false);
                    setUploadedMedia([]);
                  }} 
                  className="flex-1"
                >
                  Upload Different Content
                </Button>
                <Button 
                  onClick={() => setShowRejectionDialog(false)} 
                  className="flex-1"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="border-b border-border bg-background">
        <div className="max-w-[1600px] mx-auto px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="rounded-full"
            >
              <ArrowLeft size={20} />
            </Button>
            <div>
              <h1 className="text-foreground" style={{ fontSize: '24px', fontWeight: 'var(--font-weight-semibold)' }}>
                Story Showcase - Upload Content
              </h1>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={handlePublish}
              disabled={approvedCount === 0 || analyzingCount > 0}
            >
              {isPublishing ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                'Publish'
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-[1600px] mx-auto px-8 py-8">
          {/* Conditional Banner */}
          {uploadedMedia.length === 0 ? (
            /* Marketplace Highlight Banner - Before Upload */
            <div className="bg-primary/10 border-l-4 border-primary rounded-[var(--radius)] p-6 mb-8">
              <div className="flex items-start gap-4">
                <div className="bg-primary text-primary-foreground rounded-full p-3 mt-0.5">
                  <ImageIcon size={28} />
                </div>
                <div>
                  <h4 className="mb-2" style={{ fontSize: '20px', fontWeight: 'var(--font-weight-medium)' }}>
                    Publish to Treatwell Marketplace
                  </h4>
                  <p className="text-muted-foreground" style={{ fontSize: '16px', lineHeight: '1.6' }}>
                    Your content will be displayed to thousands of potential customers browsing Treatwell. 
                    High-quality stories help attract new customers and showcase your best work to people actively looking to book treatments.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* AI Benefits Banner - After Upload */
            <div className="bg-primary/10 border-l-4 border-primary rounded-[var(--radius)] p-6 mb-8">
              <div className="flex items-start gap-4">
                <div className="bg-primary text-primary-foreground rounded-full p-3 mt-0.5">
                  <Sparkles size={28} />
                </div>
                <div className="flex-1">
                  <h4 className="mb-2" style={{ fontSize: '20px', fontWeight: 'var(--font-weight-medium)' }}>
                    AI-Powered Customer Matching
                  </h4>
                  <p className="text-muted-foreground mb-3" style={{ fontSize: '16px', lineHeight: '1.6' }}>
                    Your stories will be shown to customers most likely to book your services.
                  </p>
                  <div className="bg-card/50 rounded-[var(--radius)] p-4">
                    <p className="text-foreground" style={{ fontSize: '15px', lineHeight: '1.6' }}>
                      <span style={{ fontWeight: 'var(--font-weight-medium)' }}>Reach new customers</span> based on their preferences, location, and booking history.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Conditional Layout: 2-column when no upload, 3-column when uploaded */}
          {uploadedMedia.length === 0 ? (
            /* Two Column Layout - No Upload */
            <div className="grid grid-cols-[1fr_420px] gap-10 mb-8">
              {/* Left: Upload Area */}
              <div>
                <div
                  className="border-2 border-dashed border-border rounded-[var(--radius)] p-16 text-center cursor-pointer hover:border-primary transition-colors min-h-[400px] flex flex-col items-center justify-center"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="mx-auto mb-8 text-muted-foreground" size={72} />
                  <p className="mb-4" style={{ fontSize: '20px', fontWeight: 'var(--font-weight-medium)' }}>
                    Click to upload or drag and drop
                  </p>
                  <p className="text-muted-foreground" style={{ fontSize: '16px' }}>
                    Images (PNG, JPG) or Videos (MP4, MOV, max 10 seconds) - Max 50MB
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,video/*"
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                </div>
              </div>

              {/* Right: Upload Guidelines */}
              <div className="bg-card border border-border rounded-[var(--radius)] p-7 h-fit sticky top-8">
                <h4 className="mb-6" style={{ fontSize: '20px', fontWeight: 'var(--font-weight-medium)' }}>
                  📋 Upload Guidelines
                </h4>
                <ul className="space-y-5" style={{ fontSize: '16px', lineHeight: '1.6' }}>
                  <li className="flex items-start gap-4">
                    <span className="bg-primary text-primary-foreground rounded-full w-7 h-7 flex items-center justify-center flex-shrink-0 mt-0.5" style={{ fontSize: '14px', fontWeight: 'var(--font-weight-medium)' }}>
                      1
                    </span>
                    <div>
                      <strong className="text-foreground">Vertical format:</strong>
                      <span className="text-muted-foreground"> Content must be in vertical/portrait orientation (9:16 ratio recommended)</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <span className="bg-primary text-primary-foreground rounded-full w-7 h-7 flex items-center justify-center flex-shrink-0 mt-0.5" style={{ fontSize: '14px', fontWeight: 'var(--font-weight-medium)' }}>
                      2
                    </span>
                    <div>
                      <strong className="text-foreground">High quality:</strong>
                      <span className="text-muted-foreground"> Upload clear, well-lit, high-resolution images and videos</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <span className="bg-primary text-primary-foreground rounded-full w-7 h-7 flex items-center justify-center flex-shrink-0 mt-0.5" style={{ fontSize: '14px', fontWeight: 'var(--font-weight-medium)' }}>
                      3
                    </span>
                    <div>
                      <strong className="text-foreground">No contact information:</strong>
                      <span className="text-muted-foreground"> Don't include phone numbers, email addresses, or external social media handles</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <span className="bg-primary text-primary-foreground rounded-full w-7 h-7 flex items-center justify-center flex-shrink-0 mt-0.5" style={{ fontSize: '14px', fontWeight: 'var(--font-weight-medium)' }}>
                      4
                    </span>
                    <div>
                      <strong className="text-foreground">Appropriate content only:</strong>
                      <span className="text-muted-foreground"> No medical procedures, nudity, or sensitive content</span>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          ) : (
            /* Two Column Layout - After Upload */
            <div className="grid grid-cols-[400px_1fr] gap-8 mb-8">
              {/* Left: Compact Media Preview */}
              <div>
                {uploadedMedia.map((media) => (
                  <CompactMediaPreview
                    key={media.id}
                    media={media}
                    onRemove={() => removeMedia(media.id)}
                  />
                ))}
              </div>

              {/* Right: AI Analysis Results */}
              <div>
                {uploadedMedia.map((media) => (
                  <AIAnalysisPanel key={media.id} media={media} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Status Bar */}
      {approvedCount > 0 && (
        <div className="border-t border-border bg-muted/30">
          <div className="max-w-[1600px] mx-auto px-8 py-4">
            <p className="text-muted-foreground" style={{ fontSize: '15px' }}>
              {approvedCount} item{approvedCount !== 1 ? 's' : ''} ready to publish
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

interface StatCardProps {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  count: number;
  color: string;
  spinning?: boolean;
}

function StatCard({ icon: Icon, label, count, color, spinning }: StatCardProps) {
  return (
    <div className="bg-muted rounded-[var(--radius)] p-4 flex items-center gap-3">
      <Icon size={24} className={`${color} ${spinning ? 'animate-spin' : ''}`} />
      <div>
        <div className="text-2xl font-bold">{count}</div>
        <div className="text-muted-foreground" style={{ fontSize: '12px' }}>
          {label}
        </div>
      </div>
    </div>
  );
}

interface MediaCardProps {
  media: UploadedMedia;
  onRemove: () => void;
}

function MediaCard({ media, onRemove }: MediaCardProps) {
  return (
    <div className="relative bg-muted rounded-[var(--radius)] overflow-hidden group">
      {/* Media Preview */}
      <div className="aspect-[9/16] bg-muted-foreground/10 flex items-center justify-center relative">
        {media.type === 'image' ? (
          <img src={media.url} alt="Upload preview" className="w-full h-full object-cover" />
        ) : (
          <video src={media.url} className="w-full h-full object-cover" muted />
        )}

        {/* Type indicator */}
        <div className="absolute top-2 left-2 bg-background/90 rounded px-2 py-1 flex items-center gap-1">
          {media.type === 'image' ? (
            <ImageIcon size={14} />
          ) : (
            <Video size={14} />
          )}
          <span style={{ fontSize: '12px' }}>{media.type}</span>
        </div>

        {/* Remove button */}
        <button
          onClick={onRemove}
          className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <X size={16} />
        </button>

        {/* Status overlay */}
        {media.status === 'analyzing' && (
          <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center">
            <Loader2 className="animate-spin mb-2 text-primary" size={32} />
            <span style={{ fontSize: '14px' }}>Analyzing...</span>
          </div>
        )}

        {media.status === 'rejected' && (
          <div className="absolute inset-0 bg-destructive/80 flex flex-col items-center justify-center text-destructive-foreground p-4 text-center">
            <AlertCircle size={32} className="mb-2" />
            <span style={{ fontSize: '12px' }}>Content Rejected</span>
          </div>
        )}
      </div>

      {/* AI Analysis Info */}
      {media.status === 'approved' && media.aiAnalysis && (
        <div className="p-3 bg-card">
          <div className="flex items-center gap-1 mb-2">
            <CheckCircle2 size={14} className="text-chart-2" />
            <span className="text-chart-2" style={{ fontSize: '12px', fontWeight: 'var(--font-weight-medium)' }}>
              Approved
            </span>
          </div>
          <div className="text-foreground mb-1" style={{ fontSize: '12px', fontWeight: 'var(--font-weight-medium)' }}>
            {media.aiAnalysis.contentType[0]}
          </div>
          <div className="flex flex-wrap gap-1">
            {media.aiAnalysis.tags.slice(0, 2).map((tag, i) => (
              <span
                key={i}
                className="bg-primary/10 text-primary px-2 py-0.5 rounded-[var(--radius-label)]"
                style={{ fontSize: '10px' }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {media.status === 'rejected' && media.aiAnalysis?.moderationReasons && (
        <div className="p-3 bg-card">
          <div className="text-destructive" style={{ fontSize: '12px' }}>
            {media.aiAnalysis.moderationReasons[0]}
          </div>
        </div>
      )}
    </div>
  );
}

// New Component: Compact Media Preview
interface CompactMediaPreviewProps {
  media: UploadedMedia;
  onRemove: () => void;
}

function CompactMediaPreview({ media, onRemove }: CompactMediaPreviewProps) {
  return (
    <div className="relative bg-card border border-border rounded-[var(--radius)] overflow-hidden group">
      {/* Media Preview */}
      <div className="aspect-[9/16] max-h-[400px] bg-muted-foreground/10 flex items-center justify-center relative">
        {media.type === 'image' ? (
          <img src={media.url} alt="Upload preview" className="w-full h-full object-contain" />
        ) : (
          <video src={media.url} className="w-full h-full object-contain" muted />
        )}

        {/* Type indicator */}
        <div className="absolute top-3 left-3 bg-background/90 rounded-[var(--radius)] px-3 py-1.5 flex items-center gap-2">
          {media.type === 'image' ? (
            <ImageIcon size={16} />
          ) : (
            <Video size={16} />
          )}
          <span style={{ fontSize: '13px', fontWeight: 'var(--font-weight-medium)' }}>
            {media.type === 'image' ? 'Image' : 'Video'}
          </span>
        </div>

        {/* Remove button */}
        <button
          onClick={onRemove}
          className="absolute top-3 right-3 bg-destructive text-destructive-foreground rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <X size={18} />
        </button>

        {/* Status overlay */}
        {media.status === 'analyzing' && (
          <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center">
            <Loader2 className="animate-spin mb-3 text-primary" size={40} />
            <span style={{ fontSize: '16px', fontWeight: 'var(--font-weight-medium)' }}>Analyzing...</span>
          </div>
        )}

        {media.status === 'rejected' && (
          <div className="absolute inset-0 bg-destructive/90 flex flex-col items-center justify-center text-destructive-foreground p-6 text-center">
            <AlertCircle size={48} className="mb-3" />
            <span style={{ fontSize: '16px', fontWeight: 'var(--font-weight-medium)' }}>Content Rejected</span>
          </div>
        )}
      </div>
    </div>
  );
}

// New Component: AI Analysis Panel
interface AIAnalysisPanelProps {
  media: UploadedMedia;
}

function AIAnalysisPanel({ media }: AIAnalysisPanelProps) {
  if (media.status === 'analyzing') {
    return (
      <div className="bg-card border border-border rounded-[var(--radius)] p-8 min-h-[400px] flex flex-col items-center justify-center">
        <Loader2 className="animate-spin mb-4 text-primary" size={48} />
        <h4 className="mb-2" style={{ fontSize: '18px', fontWeight: 'var(--font-weight-medium)' }}>
          AI Analysis in Progress
        </h4>
        <p className="text-muted-foreground text-center" style={{ fontSize: '15px', lineHeight: '1.6' }}>
          Our AI is analyzing your content to ensure it meets our guidelines and to identify the best audience for your story.
        </p>
      </div>
    );
  }

  if (media.status === 'rejected' && media.aiAnalysis) {
    return (
      <div className="bg-card border border-destructive/50 rounded-[var(--radius)] p-8">
        {/* Error Header */}
        <div className="flex items-start gap-4 mb-6">
          <div className="w-12 h-12 bg-destructive/20 rounded-full flex items-center justify-center flex-shrink-0">
            <AlertCircle size={24} className="text-destructive" />
          </div>
          <div>
            <h4 className="text-destructive mb-1" style={{ fontSize: '20px', fontWeight: 'var(--font-weight-medium)' }}>
              Content Not Approved
            </h4>
            <p className="text-muted-foreground" style={{ fontSize: '15px', lineHeight: '1.6' }}>
              Our AI detected issues with your uploaded content.
            </p>
          </div>
        </div>

        {/* Rejection Reasons */}
        <div className="bg-destructive/10 border border-destructive/30 rounded-[var(--radius-lg)] p-5 mb-6">
          <h4 className="text-foreground mb-3" style={{ fontSize: '16px', fontWeight: 'var(--font-weight-medium)' }}>
            Rejection Reasons:
          </h4>
          <ul className="space-y-2">
            {media.aiAnalysis.moderationReasons?.map((reason, index) => (
              <li key={index} className="flex items-start gap-3 text-muted-foreground" style={{ fontSize: '15px', lineHeight: '1.6' }}>
                <span className="text-destructive mt-1" style={{ fontSize: '18px' }}>•</span>
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Action Card */}
        <div className="bg-muted/50 rounded-[var(--radius)] p-5">
          <p className="text-foreground" style={{ fontSize: '15px', lineHeight: '1.6' }}>
            Please remove this content and upload a different picture or video that meets our guidelines.
          </p>
        </div>
      </div>
    );
  }

  if (media.status === 'approved' && media.aiAnalysis) {
    return (
      <div className="bg-card border border-border rounded-[var(--radius)] p-8">
        {/* Success Header */}
        <div className="flex items-start gap-4 mb-6">
          <div className="w-12 h-12 bg-chart-2/20 rounded-full flex items-center justify-center flex-shrink-0">
            <CheckCircle2 size={24} className="text-chart-2" />
          </div>
          <div>
            <h4 className="text-chart-2 mb-1" style={{ fontSize: '20px', fontWeight: 'var(--font-weight-medium)' }}>
              Content Approved
            </h4>
            <p className="text-muted-foreground" style={{ fontSize: '15px', lineHeight: '1.6' }}>
              Your content passed all our checks and is ready to publish!
            </p>
          </div>
        </div>

        {/* AI Analysis Details */}
        <div className="space-y-6">
          {/* Content Type */}
          <div>
            <div className="text-muted-foreground mb-2" style={{ fontSize: '12px', fontWeight: 'var(--font-weight-medium)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Content Type Detected
            </div>
            <div className="bg-primary/10 border border-primary/20 rounded-[var(--radius)] px-4 py-3">
              <span className="text-primary" style={{ fontSize: '16px', fontWeight: 'var(--font-weight-medium)' }}>
                {media.aiAnalysis.contentType[0]}
              </span>
            </div>
          </div>

          {/* Tags */}
          <div>
            <div className="text-muted-foreground mb-2" style={{ fontSize: '12px', fontWeight: 'var(--font-weight-medium)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              AI-Generated Tags
            </div>
            <div className="flex flex-wrap gap-2">
              {media.aiAnalysis.tags.map((tag, i) => (
                <span
                  key={i}
                  className="bg-muted text-foreground px-3 py-2 rounded-[var(--radius)]"
                  style={{ fontSize: '14px', fontWeight: 'var(--font-weight-medium)' }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Confidence Score */}
          
        </div>
      </div>
    );
  }

  return null;
}

// New Component: AI Benefits Card
function AIBenefitsCard() {
  return (
    <div className="bg-primary/10 border-2 border-primary/30 rounded-[var(--radius-lg)] p-5">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
          <Sparkles size={20} className="text-primary" />
        </div>
        <div>
          <h4 className="text-foreground mb-1" style={{ fontSize: '16px', fontWeight: 'var(--font-weight-medium)' }}>
            AI-Powered Customer Matching
          </h4>
          <p className="text-muted-foreground" style={{ fontSize: '14px', lineHeight: '1.5' }}>
            Your stories will be shown to customers most likely to book your services.
          </p>
        </div>
      </div>
      <div className="bg-card/50 rounded-[var(--radius)] p-3 mt-3">
        <p className="text-foreground" style={{ fontSize: '13px', lineHeight: '1.5' }}>
          <span style={{ fontWeight: 'var(--font-weight-medium)' }}>Reach new customers</span> based on their preferences, location, and booking history.
        </p>
      </div>
    </div>
  );
}

// New Component: Content Status Card
interface ContentStatusCardProps {
  media: UploadedMedia;
}

function ContentStatusCard({ media }: ContentStatusCardProps) {
  return (
    <div className="bg-card border border-border rounded-[var(--radius)] p-5">
      <div className="text-muted-foreground mb-3" style={{ fontSize: '12px', fontWeight: 'var(--font-weight-medium)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        Content Status
      </div>
      <div className="flex items-center justify-between bg-muted/50 rounded-[var(--radius)] p-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-chart-2/20 flex items-center justify-center">
            <span className="text-chart-2" style={{ fontSize: '12px', fontWeight: 'var(--font-weight-medium)' }}>
              1
            </span>
          </div>
          <span style={{ fontSize: '14px', fontWeight: 'var(--font-weight-medium)' }}>
            {media.aiAnalysis?.contentType[0] || 'Content'}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-chart-2">
          <div className="w-1.5 h-1.5 rounded-full bg-chart-2"></div>
          <span style={{ fontSize: '12px', fontWeight: 'var(--font-weight-medium)' }}>
            Approved
          </span>
        </div>
      </div>
    </div>
  );
}