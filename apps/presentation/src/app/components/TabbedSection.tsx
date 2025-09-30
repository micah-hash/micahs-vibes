'use client';

import { useState } from 'react';
import Image from 'next/image';

interface Screenshot {
  src: string;
  alt: string;
  thumb: string;
}

interface TabSection {
  id: string;
  name: string;
  screenshots: Screenshot[];
}

interface TabbedSectionProps {
  sections: TabSection[];
  isExpanded: boolean;
}

export default function TabbedSection({ sections, isExpanded }: TabbedSectionProps) {
  const [activeTab, setActiveTab] = useState(sections[0]?.id || '');

  const handleImageClick = (src: string, alt: string, clickedIndex: number) => {
    const activeSection = sections.find(section => section.id === activeTab);
    if (!activeSection) return;

    const lightbox = document.getElementById('lightbox');
    
    if (lightbox) {
      const event = new CustomEvent('openLightbox', {
        detail: { 
          src, 
          alt, 
          screenshots: activeSection.screenshots,
          index: clickedIndex
        }
      });
      window.dispatchEvent(event);
      
      lightbox.hidden = false;
      
      requestAnimationFrame(() => {
        lightbox.classList.add('open');
      });
    }
  };

  const activeSection = sections.find(section => section.id === activeTab);

  return (
    <div className="tabbed-section" style={{ marginTop: '20px' }}>
      {/* Apple-style Tab Navigation */}
      <div className="tab-nav" style={{ 
        display: 'flex',
        justifyContent: 'center',
        marginBottom: '24px',
        background: 'rgba(255, 255, 255, 0.08)',
        borderRadius: '12px',
        padding: '4px',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        maxWidth: '400px',
        margin: '0 auto 24px'
      }}>
        {sections.map((section) => (
          <button
            key={section.id}
            className={`tab-button ${activeTab === section.id ? 'active' : ''}`}
            onClick={() => setActiveTab(section.id)}
            style={{
              flex: 1,
              background: activeTab === section.id ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.05)',
              border: activeTab === section.id ? '1px solid rgba(255, 255, 255, 0.3)' : '1px solid rgba(255, 255, 255, 0.1)',
              color: activeTab === section.id ? '#ffffff' : 'rgba(255, 255, 255, 0.8)',
              padding: '12px 20px',
              borderRadius: '8px',
              fontSize: '15px',
              fontWeight: '500',
              cursor: 'pointer',
              minHeight: '44px',
              transition: 'all 0.3s ease'
            }}
          >
            {section.name}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeSection && (
          <div className="shots" style={{ marginTop: '20px' }}>
            {activeSection.screenshots.length > 0 ? (
              activeSection.screenshots.map((screenshot, index) => (
                <Image
                  key={index}
                  className="thumb apple-thumb"
                  src={screenshot.thumb}
                  alt={screenshot.alt}
                  width={320}
                  height={200}
                  loading="lazy"
                  onClick={() => handleImageClick(screenshot.src, screenshot.alt, index)}
                  style={{
                    cursor: 'pointer',
                    opacity: 1,
                    transform: 'scale(1)',
                    display: 'block',
                    animation: isExpanded ? `appleReveal 0.6s ease-out ${index * 0.1}s forwards` : 'none'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.02)';
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)';
                  }}
                />
              ))
            ) : (
              <div style={{ 
                textAlign: 'center', 
                padding: '40px 20px', 
                color: 'var(--muted)',
                fontSize: '15px'
              }}>
                Screenshots coming soon for {activeSection.name.toLowerCase()}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
