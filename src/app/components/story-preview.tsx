import { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Heart, Share2, Sparkles, Smartphone, MapPin, ChevronUp, Loader2, CheckCircle, BarChart3 } from 'lucide-react';
import { Button } from './ui/button';
import type { UploadedMedia } from './story-upload-modal';

interface StoryPreviewProps {
  media: UploadedMedia[];
  onClose: () => void;
}

export function StoryPreview({ media, onClose }: StoryPreviewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPublishing, setIsPublishing] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  const currentMedia = media[currentIndex];

  useEffect(() => {
    // Auto-advance timer (5 seconds per story)
    const duration = 5000;
    const interval = 50;
    let elapsed = 0;

    const timer = setInterval(() => {
      elapsed += interval;
      setProgress((elapsed / duration) * 100);

      if (elapsed >= duration) {
        if (currentIndex < media.length - 1) {
          setCurrentIndex((prev) => prev + 1);
          setProgress(0);
          elapsed = 0;
        } else {
          clearInterval(timer);
        }
      }
    }, interval);

    return () => clearInterval(timer);
  }, [currentIndex, media.length]);

  const goToNext = () => {
    if (currentIndex < media.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setProgress(0);
    }
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setProgress(0);
    }
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    // Simulate publishing process
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsPublishing(false);
    setShowSuccessDialog(true);
  };

  const handleSuccessClose = () => {
    setShowSuccessDialog(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-muted z-[60] flex items-center justify-center p-4">
      {/* Success Dialog */}
      {showSuccessDialog && (
        <div className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-[var(--radius-card)] p-8 max-w-md w-full shadow-2xl">
            <div className="text-center">
              {/* Success Icon with Animation */}
              <div className="mx-auto mb-6 w-20 h-20 bg-chart-2/20 rounded-full flex items-center justify-center">
                <CheckCircle size={48} className="text-chart-2" />
              </div>
              
              {/* Exciting Message */}
              <h2 className="mb-3" style={{ fontSize: '24px', fontWeight: 'var(--font-weight-bold)' }}>
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
                    <h4 className="text-foreground mb-1.5" style={{ fontSize: '15px', fontWeight: 'var(--font-weight-bold)' }}>
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

      {/* Desktop: Info panel on left */}
      <div className="hidden lg:block w-[400px] h-full bg-card border border-border rounded-[var(--radius-card)] p-6 overflow-auto mr-6">
        <div className="flex items-center justify-between mb-6">
          <h3>Preview & Publish</h3>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6 pb-32">
          {/* Key Benefit - AI Matching */}
          <div className="bg-primary/10 border-2 border-primary/30 rounded-[var(--radius-lg)] p-5">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <Sparkles size={20} className="text-primary" />
              </div>
              <div>
                <h4 className="text-foreground mb-1" style={{ fontSize: '16px', fontWeight: 'var(--font-weight-bold)' }}>
                  AI-Powered Customer Matching
                </h4>
                <p className="text-muted-foreground" style={{ fontSize: '14px', lineHeight: '1.5' }}>
                  Your stories will be shown to customers most likely to book your services.
                </p>
              </div>
            </div>
            <div className="bg-card/50 rounded-[var(--radius)] p-3 mt-3">
              <p className="text-foreground" style={{ fontSize: '13px', lineHeight: '1.5' }}>
                <span style={{ fontWeight: 'var(--font-weight-bold)' }}>Reach new customers</span> based on their preferences, location, and booking history.
              </p>
            </div>
          </div>

          {/* Content Status */}
          <div>
            <div className="text-muted-foreground mb-3" style={{ fontSize: '12px', fontWeight: 'var(--font-weight-medium)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Content Status
            </div>
            <div className="space-y-2">
              {media.map((item, index) => (
                <div key={item.id} className="flex items-center justify-between bg-muted/50 rounded-[var(--radius)] p-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-chart-2/20 flex items-center justify-center">
                      <span className="text-chart-2" style={{ fontSize: '12px', fontWeight: 'var(--font-weight-bold)' }}>
                        {index + 1}
                      </span>
                    </div>
                    <span style={{ fontSize: '14px', fontWeight: 'var(--font-weight-medium)' }}>
                      {item.aiAnalysis?.contentType[0] || 'Content'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-chart-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-chart-2"></div>
                    <span style={{ fontSize: '12px', fontWeight: 'var(--font-weight-medium)' }}>
                      Approved
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mobile Preview Info */}
          <div className="bg-muted/50 rounded-[var(--radius)] p-4 flex items-start gap-3">
            <Smartphone size={18} className="text-muted-foreground flex-shrink-0 mt-0.5" />
            <p className="text-muted-foreground" style={{ fontSize: '13px', lineHeight: '1.5' }}>
              Preview shows how stories appear to customers on the Treatwell mobile app
            </p>
          </div>
        </div>

        {/* Sticky CTAs with T&C */}
        <div className="sticky bottom-0 bg-card border-t border-border p-6 -mx-6 -mb-6 mt-6">
          <div className="flex gap-2 mb-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Back to Edit
            </Button>
            <Button onClick={handlePublish} className="flex-1">
              {isPublishing ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                'Publish'
              )}
            </Button>
          </div>
          <p className="text-muted-foreground text-center" style={{ fontSize: '11px', lineHeight: '1.4' }}>
            By publishing, you agree to Treatwell's{' '}
            <a href="#" className="text-primary hover:underline">Terms & Conditions</a>
          </p>
        </div>
      </div>

      {/* Mobile Phone Frame */}
      <div className="relative">
        {/* Phone mockup container - iPhone 15 proportions (scaled down) */}
        <div className="relative w-[320px] h-[693px] bg-[#1a1a1a] rounded-[45px] shadow-2xl border-[3px] border-[#2c2c2c] overflow-hidden">
          {/* Dynamic Island (iPhone 15) */}
          <div className="absolute top-[12px] left-1/2 -translate-x-1/2 w-[103px] h-[30px] bg-black rounded-full z-50" />
          
          {/* Screen content */}
          <div className="relative w-full h-full bg-black rounded-[52px] overflow-hidden flex flex-col">
            {/* Progress bars */}
            <div className="absolute top-0 left-0 right-0 z-20 flex gap-1 p-3 pt-8">
              {media.map((_, index) => (
                <div key={index} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white transition-all duration-50"
                    style={{
                      width: index === currentIndex ? `${progress}%` : index < currentIndex ? '100%' : '0%',
                    }}
                  />
                </div>
              ))}
            </div>

            {/* Header with gradient background for visibility */}
            <div className="absolute top-10 left-0 right-0 z-20 px-4 pb-16 bg-gradient-to-b from-black/60 via-black/30 to-transparent">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center ring-2 ring-white/30">
                  <span className="text-primary-foreground" style={{ fontSize: '14px', fontWeight: 'var(--font-weight-bold)' }}>SS</span>
                </div>
                <div className="flex-1">
                  <div className="text-white" style={{ fontSize: '15px', fontWeight: 'var(--font-weight-bold)' }}>
                    Sarah's Secure Salon
                  </div>
                  <div className="flex items-center gap-1 text-white/90" style={{ fontSize: '12px' }}>
                    <MapPin size={12} />
                    <span>London, UK</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Story Content Area */}
            <div className="flex-1 relative bg-black mt-[72px]">
              {currentMedia.type === 'image' ? (
                <img
                  src={currentMedia.url}
                  alt="Story content"
                  className="w-full h-full object-contain bg-black"
                />
              ) : (
                <video
                  src={currentMedia.url}
                  className="w-full h-full object-contain bg-black"
                  autoPlay
                  muted
                  loop
                />
              )}

              {/* Navigation areas */}
              <button
                className="absolute left-0 top-0 bottom-0 w-1/3 z-10"
                onClick={goToPrevious}
                disabled={currentIndex === 0}
              />
              <button
                className="absolute right-0 top-0 bottom-0 w-1/3 z-10"
                onClick={goToNext}
                disabled={currentIndex === media.length - 1}
              />
            </div>

            {/* Book with Me CTA - Instagram swipe-up style */}
            <div className="absolute bottom-0 left-0 right-0 z-30 pb-6 pt-20 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
              <div className="px-6">
                <button className="w-full bg-white text-black rounded-full py-3.5 px-6 transition-all hover:bg-white/90 active:scale-95" style={{ fontSize: '15px', fontWeight: 'var(--font-weight-bold)' }}>
                  Book with Me
                </button>
                <div className="flex items-center justify-center gap-1 mt-3 text-white/60">
                  <ChevronUp size={16} />
                  <span style={{ fontSize: '11px', fontWeight: 'var(--font-weight-medium)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Swipe up to book</span>
                </div>
              </div>
            </div>

            {/* Right-side interaction buttons */}
            <div className="absolute bottom-40 right-3 z-20 flex flex-col gap-5">
              <button className="text-white hover:text-white/80 transition-all active:scale-90 flex flex-col items-center gap-1.5 drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)]">
                <Heart size={28} fill="none" strokeWidth={2.5} />
                <span style={{ fontSize: '11px', fontWeight: 'var(--font-weight-medium)' }}>123</span>
              </button>
              <button className="text-white hover:text-white/80 transition-all active:scale-90 flex flex-col items-center gap-1.5 drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)]">
                <Share2 size={28} strokeWidth={2.5} />
                <span style={{ fontSize: '11px', fontWeight: 'var(--font-weight-medium)' }}>Share</span>
              </button>
            </div>
          </div>
        </div>

        {/* Phone label - mobile only */}
        <div className="lg:hidden absolute -bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-2 text-muted-foreground">
          <Smartphone size={16} />
          <span style={{ fontSize: '14px' }}>Mobile App Preview</span>
        </div>

        {/* Navigation buttons for stories */}
        {currentIndex > 0 && (
          <button
            onClick={goToPrevious}
            className="absolute left-[-60px] top-1/2 -translate-y-1/2 bg-card hover:bg-muted rounded-full p-3 transition-colors border border-border hidden md:flex items-center justify-center"
          >
            <ChevronLeft size={24} className="text-foreground" />
          </button>
        )}
        {currentIndex < media.length - 1 && (
          <button
            onClick={goToNext}
            className="absolute right-[-60px] top-1/2 -translate-y-1/2 bg-card hover:bg-muted rounded-full p-3 transition-colors border border-border hidden md:flex items-center justify-center"
          >
            <ChevronRight size={24} className="text-foreground" />
          </button>
        )}
      </div>

      {/* Mobile: Close button and actions at bottom */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4">
        <div className="flex gap-2 max-w-md mx-auto">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Back to Edit
          </Button>
          <Button onClick={handlePublish} className="flex-1">
            {isPublishing ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              'Publish'
            )}
          </Button>
        </div>
      </div>

      {/* Mobile: Close button at top */}
      <button
        onClick={onClose}
        className="lg:hidden fixed top-4 right-4 bg-card hover:bg-muted rounded-full p-2 transition-colors border border-border z-50"
      >
        <X size={20} />
      </button>
    </div>
  );
}