import { useState } from 'react';
import { Mail, MessageSquare, Clipboard, Smartphone, Image, Search, Settings, Bell, ChevronDown } from 'lucide-react';
import { StoryUploadModal } from './story-upload-modal';
import exampleImage from 'figma:asset/997401f2fbf2970ee04c7898891099db3c95b426.png';

export function CampaignPage() {
  const [isStoryModalOpen, setIsStoryModalOpen] = useState(false);

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-[220px] bg-card border-r border-border flex flex-col">
        {/* Logo/Header */}
        <div className="p-4 border-b border-border">
          <p className="text-foreground" style={{ fontSize: '14px', lineHeight: '1.4' }}>
            TEST - DO NOT BOOK |<br />
            Sarah's Secure Salon
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <div className="space-y-1">
            <NavItem icon={Mail} label="Campaigns" active />
            <NavItem icon={MessageSquare} label="Automated messaging" />
            <NavItem icon={Clipboard} label="Consultation forms" />
            <NavItem icon={Smartphone} label="Your client app" />
            <NavItem icon={Image} label="Facebook & Instagram" />
          </div>
        </nav>

        {/* Bottom items */}
        <div className="p-4 border-t border-border space-y-1">
          <NavItem icon={Settings} label="Refer a salon" />
          <NavItem icon={Bell} label="Partner Help Centre" />
          <NavItem icon={Search} label="What's new" />
        </div>

        {/* Chat support button */}
        <div className="p-4">
          <button className="w-full py-2 px-4 bg-muted text-muted-foreground rounded-[var(--radius-button)] hover:bg-muted/80 transition-colors">
            Chat support
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Nav Bar */}
        <div className="h-[60px] bg-[#1a253d] flex items-center justify-between px-6">
          <nav className="flex gap-8">
            <NavLink label="Calendar" />
            <NavLink label="Dashboard" />
            <NavLink label="Menu" />
            <NavLink label="Team" />
            <NavLink label="Products" />
            <NavLink label="Clients" />
            <NavLink label="Marketing" active />
            <NavLink label="Reports" />
          </nav>

          <div className="flex items-center gap-4">
            <button className="text-white hover:text-white/80">
              <Search size={20} />
            </button>
            <button className="text-white hover:text-white/80 relative">
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-destructive rounded-full" />
            </button>
            <button className="text-white hover:text-white/80">
              <Settings size={20} />
            </button>
            <button className="flex items-center gap-2 text-white hover:text-white/80">
              <div className="w-8 h-8 rounded-full bg-[#ff6b8a] flex items-center justify-center">
                <span>TW</span>
              </div>
              <ChevronDown size={16} />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto">
          <div className="max-w-[1200px] mx-auto p-8">
            <h1 className="mb-2">Choose your campaign</h1>
            <p className="text-muted-foreground mb-8" style={{ fontSize: '16px', lineHeight: '1.5' }}>
              Stay on your clients' radar with our unique marketing tool. You can send out handy, prebuilt
              emails to your customers, promoting your discounts and special offers, or encourage them to
              rebook you faster via the client app. Whatever the campaign, they'll love the personal touch.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Promotional offers card */}
              <CampaignCard
                title="Promotional offers"
                description="Encourage your clients to book by promoting discounts and any special offers."
                badge="AVAILABLE"
              />

              {/* Your Client App card */}
              <CampaignCard
                title="Your Client App"
                description="Get rebooked in 30 seconds with the Treatwell client app! Invite your clients to book you anytime, anywhere - commission free."
                badge="AVAILABLE"
              />

              {/* Story Showcase card - NEW */}
              <CampaignCard
                title="Story Showcase"
                description="Upload images and short video clips to showcase your work on Treatwell marketplace - just like Instagram stories. AI-powered algorithm that transforms your stories into bookings."
                badge="TRY FOR FREE"
                onClick={() => setIsStoryModalOpen(true)}
                isNew
              />
            </div>
          </div>
        </div>
      </div>

      {/* Story Upload Modal */}
      <StoryUploadModal 
        open={isStoryModalOpen} 
        onOpenChange={setIsStoryModalOpen}
      />
    </div>
  );
}

interface NavItemProps {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  active?: boolean;
}

function NavItem({ icon: Icon, label, active }: NavItemProps) {
  return (
    <button
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-[var(--radius)] text-left transition-colors ${
        active
          ? 'bg-primary/10 text-primary'
          : 'text-foreground hover:bg-muted'
      }`}
    >
      <Icon size={18} />
      <span style={{ fontSize: '14px', lineHeight: '1.4' }}>{label}</span>
    </button>
  );
}

interface NavLinkProps {
  label: string;
  active?: boolean;
}

function NavLink({ label, active }: NavLinkProps) {
  return (
    <button
      className={`px-1 py-1 transition-colors ${
        active
          ? 'text-white border-b-2 border-white'
          : 'text-white/70 hover:text-white'
      }`}
      style={{ fontSize: '14px' }}
    >
      {label}
    </button>
  );
}

interface CampaignCardProps {
  title: string;
  description: string;
  badge: string;
  onClick?: () => void;
  isNew?: boolean;
}

function CampaignCard({ title, description, badge, onClick, isNew }: CampaignCardProps) {
  return (
    <div
      className={`bg-card border border-border rounded-[var(--radius-card)] p-6 hover:shadow-[var(--shadow-elevation-sm)] transition-shadow ${
        onClick ? 'cursor-pointer' : ''
      }`}
      onClick={onClick}
    >
      <h3 className="mb-3">{title}</h3>
      <p className="text-muted-foreground mb-6" style={{ fontSize: '16px', lineHeight: '1.5', minHeight: '72px' }}>
        {description}
      </p>
      <span
        className={`inline-block px-3 py-1 rounded-[var(--radius-label)] ${
          isNew
            ? 'bg-green-600 text-white'
            : 'bg-primary text-primary-foreground'
        }`}
        style={{ fontSize: '12px', fontWeight: 'var(--font-weight-medium)' }}
      >
        {badge}
      </span>
    </div>
  );
}