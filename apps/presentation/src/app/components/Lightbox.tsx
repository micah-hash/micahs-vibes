'use client';

import { useEffect, useState, useRef } from 'react';

interface Screenshot {
  src: string;
  alt: string;
  thumb: string;
}

export default function Lightbox() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [screenshots, setScreenshots] = useState<Screenshot[]>([]);
  
  // Use refs to store current values for event handlers
  const screenshotsRef = useRef<Screenshot[]>([]);
  const currentIndexRef = useRef(0);

  // Update refs when state changes
  useEffect(() => {
    screenshotsRef.current = screenshots;
  }, [screenshots]);

  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  const goToNext = () => {
    const currentScreenshots = screenshotsRef.current;
    const currentIdx = currentIndexRef.current;
    
    if (currentScreenshots.length > 1) {
      const nextIndex = (currentIdx + 1) % currentScreenshots.length;
      setCurrentIndex(nextIndex);
      setImageSrc(currentScreenshots[nextIndex].src);
    }
  };

  const goToPrevious = () => {
    const currentScreenshots = screenshotsRef.current;
    const currentIdx = currentIndexRef.current;
    
    if (currentScreenshots.length > 1) {
      const prevIndex = (currentIdx - 1 + currentScreenshots.length) % currentScreenshots.length;
      setCurrentIndex(prevIndex);
      setImageSrc(currentScreenshots[prevIndex].src);
    }
  };

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const lightbox = document.getElementById('lightbox');
      const lightboxImg = lightbox?.querySelector('img');
      const closeButton = lightbox?.querySelector('.close');

      // Close lightbox when clicking background or close button
      if (target === lightbox || target === closeButton) {
        lightbox?.classList.remove('open');
        setTimeout(() => {
          if (lightbox) {
            lightbox.hidden = true;
            setImageSrc(null);
          }
        }, 200);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const lightbox = document.getElementById('lightbox');
      
      // Only handle keys when lightbox is open
      if (lightbox && !lightbox.hidden) {
        if (e.key === 'Escape') {
          lightbox.classList.remove('open');
          setTimeout(() => {
            lightbox.hidden = true;
            setImageSrc(null);
          }, 200);
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          goToNext();
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          goToPrevious();
        }
      }
    };

    document.addEventListener('click', handleClick);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('click', handleClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Listen for lightbox events from TeamMember
  useEffect(() => {
    const handleLightboxOpen = (event: CustomEvent) => {
      const { src, alt, screenshots: teamScreenshots, index } = event.detail;
      setImageSrc(src);
      setCurrentIndex(index);
      setScreenshots(teamScreenshots || []);
    };

    window.addEventListener('openLightbox', handleLightboxOpen as EventListener);
    
    return () => {
      window.removeEventListener('openLightbox', handleLightboxOpen as EventListener);
    };
  }, []);

  return (
    <div id="lightbox" className="lightbox" aria-hidden="true" hidden>
      <button className="close" aria-label="Close">
        Close
      </button>
      
      {/* Navigation arrows */}
      {screenshots.length > 1 && (
        <>
          <button 
            className="nav-arrow nav-arrow-left"
            onClick={goToPrevious}
            aria-label="Previous image"
            style={{
              position: 'absolute',
              left: '20px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'rgba(0, 0, 0, 0.5)',
              border: 'none',
              color: 'white',
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              cursor: 'pointer',
              fontSize: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background-color 0.3s ease',
              zIndex: 1001
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0, 0, 0, 0.7)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(0, 0, 0, 0.5)'}
          >
            ←
          </button>
          
          <button 
            className="nav-arrow nav-arrow-right"
            onClick={goToNext}
            aria-label="Next image"
            style={{
              position: 'absolute',
              right: '20px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'rgba(0, 0, 0, 0.5)',
              border: 'none',
              color: 'white',
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              cursor: 'pointer',
              fontSize: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background-color 0.3s ease',
              zIndex: 1001
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0, 0, 0, 0.7)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(0, 0, 0, 0.5)'}
          >
            →
          </button>
        </>
      )}
      
      {imageSrc && <img alt="Expanded screenshot" src={imageSrc} />}
      
      {/* Image counter */}
      {screenshots.length > 1 && (
        <div style={{
          position: 'absolute',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(0, 0, 0, 0.7)',
          color: 'white',
          padding: '8px 16px',
          borderRadius: '20px',
          fontSize: '14px',
          zIndex: 1001
        }}>
          {currentIndex + 1} / {screenshots.length}
        </div>
      )}
    </div>
  );
}
