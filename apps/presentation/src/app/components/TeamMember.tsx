'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface Screenshot {
  src: string;
  alt: string;
  thumb: string;
}

interface TeamMemberProps {
  id: string;
  name: string;
  role: string;
  description?: string;
  screenshots?: Screenshot[];
  placeholders?: number;
  isExpanded: boolean;
  onToggle: () => void;
}

export default function TeamMember({ 
  id, 
  name, 
  role, 
  description, 
  screenshots = [], 
  placeholders = 0,
  isExpanded,
  onToggle
}: TeamMemberProps) {

  const handleImageClick = (src: string, alt: string, clickedIndex: number) => {
    const lightbox = document.getElementById('lightbox');
    
    if (lightbox) {
      // Emit custom event to update image with full screenshot data
      const event = new CustomEvent('openLightbox', {
        detail: { 
          src, 
          alt, 
          screenshots,
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

  return (
    <div className="team-member reveal expandable" id={id}>
      <button 
        className="name-btn" 
        aria-expanded={isExpanded}
        onClick={onToggle}
      >
        <div className="name">{name}</div>
        <div className="role">{role}</div>
      </button>
      
      <div 
        className={`details ${isExpanded ? 'open' : ''}`}
        id={`${id}Details`}
        hidden={!isExpanded}
        style={{ 
          maxHeight: isExpanded ? '1000px' : '0px',
          opacity: isExpanded ? 1 : 0
        }}
      >
        {description && (
          <>
            <p>Focus areas</p>
            <p style={{ 
              maxWidth: '700px', 
              margin: '8px auto 0', 
              color: 'var(--muted)' 
            }}>
              {description}
            </p>
          </>
        )}
        
        <div className="shots" style={{ marginTop: description ? '16px' : '0' }}>
          {screenshots.map((screenshot, index) => (
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
                transform: 'scale(0.95)',
                opacity: 0,
                animation: isExpanded ? `appleReveal 0.6s ease-out ${index * 0.1}s forwards` : 'none',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease'
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
          ))}
          
          {Array.from({ length: placeholders }).map((_, index) => (
            <div key={`placeholder-${index}`} className="shot">
              Screenshot placeholder
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
