'use client';

import { useEffect, useState } from 'react';
import Lightbox from './components/Lightbox';

export default function Home() {
  const [expandedMember, setExpandedMember] = useState<string | null>(null);
  const [kevinActiveTab, setKevinActiveTab] = useState('mobile');
  const [robActiveTab, setRobActiveTab] = useState('data');
  const [chaseActiveTab, setChaseActiveTab] = useState('infra');
  const [benActiveTab, setBenActiveTab] = useState('finance');

  const handleMemberToggle = (memberId: string) => {
    setExpandedMember(prev => prev === memberId ? null : memberId);
  };

  useEffect(() => {
    // Intersection Observer for reveal animations
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.2 }
    );

    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

    // Set current year
    const yearElement = document.getElementById('year');
    if (yearElement) {
      yearElement.textContent = new Date().getFullYear().toString();
    }

    // Parallax effect for hero section
    const handleScroll = () => {
      const scrolled = window.pageYOffset;
      const heroSection = document.querySelector('section:first-child') as HTMLElement;
      if (heroSection) {
        const rate = scrolled * -0.3;
        heroSection.style.transform = `translateY(${rate}px)`;
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <>
      <section className="reveal">
        <div className="section-container">
          <h1>Human eyes for trusted data</h1>
          <p>Automation does the work. People ensure the win.</p>
        </div>
      </section>

      <section className="reveal">
        <div className="section-container">
          <h2>The team</h2>
        
        {/* Chase with Tabbed Interface */}
        <div className="team-member reveal expandable" id="chase">
          <button 
            className="name-btn" 
            aria-expanded={expandedMember === "chase"}
            onClick={() => handleMemberToggle("chase")}
          >
            <div className="name">Chase</div>
            <div className="role" style={{
              opacity: expandedMember === "chase" ? 0 : 1,
              transform: expandedMember === "chase" ? 'translateY(-10px)' : 'translateY(0)',
              transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
            }}>
              Infra and Fairshare
            </div>
          </button>
          <div className={`details ${expandedMember === "chase" ? 'open' : ''}`} id="chaseDetails" hidden={expandedMember !== "chase"} style={{ maxHeight: expandedMember === "chase" ? '1200px' : '0', overflow: 'visible', padding: expandedMember === "chase" ? '8px 0' : '0' }}>
            {/* Chase's Tabbed Interface */}
            <div style={{ marginTop: '0px' }}>
              {/* Tab Navigation */}
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                marginBottom: '24px',
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.08) 100%)',
                borderRadius: '16px',
                padding: '6px',
                border: '1px solid rgba(255, 255, 255, 0.18)',
                maxWidth: '320px',
                margin: '0 auto 24px',
                backdropFilter: 'blur(20px)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
                position: 'relative',
                opacity: expandedMember === "chase" ? 1 : 0,
                transform: expandedMember === "chase" ? 'translateY(0) scale(1)' : 'translateY(-20px) scale(0.95)',
                transition: 'all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                transitionDelay: expandedMember === "chase" ? '0.2s' : '0s'
              }}>
                <button 
                  onClick={() => setChaseActiveTab('infra')}
                  style={{
                    flex: 1,
                    background: chaseActiveTab === 'infra' 
                      ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.15) 100%)' 
                      : 'transparent',
                    border: 'none',
                    color: chaseActiveTab === 'infra' ? '#ffffff' : 'rgba(255, 255, 255, 0.75)',
                    padding: '14px 18px',
                    borderRadius: '12px',
                    fontSize: '15px',
                    fontWeight: chaseActiveTab === 'infra' ? '600' : '500',
                    cursor: 'pointer',
                    minHeight: '48px',
                    transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                    position: 'relative',
                    overflow: 'hidden',
                    letterSpacing: '-0.01em',
                    boxShadow: chaseActiveTab === 'infra' 
                      ? '0 2px 8px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.2)' 
                      : 'none',
                    backdropFilter: chaseActiveTab === 'infra' ? 'blur(10px)' : 'none'
                  }}>
                  Infra
                </button>
                <button 
                  onClick={() => setChaseActiveTab('fairshare')}
                  style={{
                    flex: 1,
                    background: chaseActiveTab === 'fairshare' 
                      ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.15) 100%)' 
                      : 'transparent',
                    border: 'none',
                    color: chaseActiveTab === 'fairshare' ? '#ffffff' : 'rgba(255, 255, 255, 0.75)',
                    padding: '14px 18px',
                    borderRadius: '12px',
                    fontSize: '15px',
                    fontWeight: chaseActiveTab === 'fairshare' ? '600' : '500',
                    cursor: 'pointer',
                    minHeight: '48px',
                    marginLeft: '2px',
                    transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                    position: 'relative',
                    overflow: 'hidden',
                    letterSpacing: '-0.01em',
                    boxShadow: chaseActiveTab === 'fairshare' 
                      ? '0 2px 8px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.2)' 
                      : 'none',
                    backdropFilter: chaseActiveTab === 'fairshare' ? 'blur(10px)' : 'none'
                  }}>
                  Fairshare
                </button>
              </div>

              {/* Tab Content Placeholder */}
              <div className="tab-content" style={{ marginTop: '20px', minHeight: '200px' }}>
                {chaseActiveTab === 'infra' && (
                  <div>
                    {/* Infrastructure Monitoring Description */}
                    <div style={{
                      marginBottom: '24px',
                      textAlign: 'center',
                      maxWidth: '600px',
                      margin: '0 auto 24px'
                    }}>
                      <h3 style={{
                        fontSize: '18px',
                        fontWeight: '600',
                        marginBottom: '16px',
                        color: 'rgba(255, 255, 255, 0.95)',
                        letterSpacing: '-0.02em'
                      }}>Infrastructure Monitoring</h3>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', textAlign: 'left' }}>
                        <div style={{ display: 'flex', alignItems: 'start', gap: '12px' }}>
                          <span style={{ 
                            fontSize: '20px', 
                            lineHeight: '1.4',
                            minWidth: '24px'
                          }}>📧</span>
                          <div>
                            <div style={{ fontWeight: '500', marginBottom: '4px', color: 'rgba(255, 255, 255, 0.9)' }}>
                              Email Server Monitoring
                            </div>
                            <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.65)', lineHeight: '1.5' }}>
                              Check MFA email server for bounced email rates to ensure deliverability
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'start', gap: '12px' }}>
                          <span style={{ 
                            fontSize: '20px', 
                            lineHeight: '1.4',
                            minWidth: '24px'
                          }}>📊</span>
                          <div>
                            <div style={{ fontWeight: '500', marginBottom: '4px', color: 'rgba(255, 255, 255, 0.9)' }}>
                              Engagement Tracking
                            </div>
                            <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.65)', lineHeight: '1.5' }}>
                              Monitor opened email rates to track user engagement and delivery success
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Screenshots */}
                    <div className="shots">
                      <img 
                      src="/team/Chase/MFA2.png"
                      alt="Multi-factor authentication system interface"
                      width="320"
                      height="200"
                      className="thumb"
                      onClick={() => {
                        const lightbox = document.getElementById('lightbox');
                        if (lightbox) {
                          const event = new CustomEvent('openLightbox', {
                            detail: { 
                              src: "/team/Chase/MFA2.png", 
                              alt: "Multi-factor authentication system interface", 
                              screenshots: [
                                {
                                  src: "/team/Chase/MFA2.png",
                                  alt: "Multi-factor authentication system interface",
                                  thumb: "/team/Chase/MFA2.png"
                                },
                                {
                                  src: "/team/Chase/backend-insights.png",
                                  alt: "Backend insights dashboard showing API latency and metrics",
                                  thumb: "/team/Chase/backend-insights.png"
                                }
                              ],
                              index: 0
                            }
                          });
                          window.dispatchEvent(event);
                          lightbox.hidden = false;
                          requestAnimationFrame(() => {
                            lightbox.classList.add('open');
                          });
                        }
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
                    <img 
                      src="/team/Chase/backend-insights.png"
                      alt="Backend insights dashboard showing API latency and metrics"
                      width="320"
                      height="200"
                      className="thumb"
                      onClick={() => {
                        const lightbox = document.getElementById('lightbox');
                        if (lightbox) {
                          const event = new CustomEvent('openLightbox', {
                            detail: { 
                              src: "/team/Chase/backend-insights.png", 
                              alt: "Backend insights dashboard showing API latency and metrics", 
                              screenshots: [
                                {
                                  src: "/team/Chase/MFA2.png",
                                  alt: "Multi-factor authentication system interface",
                                  thumb: "/team/Chase/MFA2.png"
                                },
                                {
                                  src: "/team/Chase/backend-insights.png",
                                  alt: "Backend insights dashboard showing API latency and metrics",
                                  thumb: "/team/Chase/backend-insights.png"
                                }
                              ],
                              index: 1
                            }
                          });
                          window.dispatchEvent(event);
                          lightbox.hidden = false;
                          requestAnimationFrame(() => {
                            lightbox.classList.add('open');
                          });
                        }
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
                    </div>
                  </div>
                )}
                {chaseActiveTab === 'fairshare' && (
                  <div>
                    {/* Fair Share Monitoring Description */}
                    <div style={{
                      marginBottom: '24px',
                      textAlign: 'center',
                      maxWidth: '600px',
                      margin: '0 auto 24px'
                    }}>
                      <h3 style={{
                        fontSize: '18px',
                        fontWeight: '600',
                        marginBottom: '16px',
                        color: 'rgba(255, 255, 255, 0.95)',
                        letterSpacing: '-0.02em'
                      }}>Fair Share Verification</h3>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', textAlign: 'left' }}>
                        <div style={{ display: 'flex', alignItems: 'start', gap: '12px' }}>
                          <span style={{ 
                            fontSize: '20px', 
                            lineHeight: '1.4',
                            minWidth: '24px'
                          }}>📋</span>
                          <div>
                            <div style={{ fontWeight: '500', marginBottom: '4px', color: 'rgba(255, 255, 255, 0.9)' }}>
                              Daily Order Review
                            </div>
                            <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.65)', lineHeight: '1.5' }}>
                              Review all orders for Zallevo and Thermomix from the previous day
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'start', gap: '12px' }}>
                          <span style={{ 
                            fontSize: '20px', 
                            lineHeight: '1.4',
                            minWidth: '24px'
                          }}>🗺️</span>
                          <div>
                            <div style={{ fontWeight: '500', marginBottom: '4px', color: 'rgba(255, 255, 255, 0.9)' }}>
                              Order Journey Tracking
                            </div>
                            <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.65)', lineHeight: '1.5' }}>
                              Check order journey for each transaction to ensure proper flow and attribution
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'start', gap: '12px' }}>
                          <span style={{ 
                            fontSize: '20px', 
                            lineHeight: '1.4',
                            minWidth: '24px'
                          }}>✓</span>
                          <div>
                            <div style={{ fontWeight: '500', marginBottom: '4px', color: 'rgba(255, 255, 255, 0.9)' }}>
                              Sponsor Verification
                            </div>
                            <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.65)', lineHeight: '1.5' }}>
                              Verify that sponsors are correctly set to customers for accurate commission tracking
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Screenshots */}
                    <div className="shots">
                      <img 
                      src="/team/Chase/order-journey.png"
                      alt="Order Journey Details showing customer activity timeline"
                      className="thumb"
                      onClick={() => {
                        const lightbox = document.getElementById('lightbox');
                        if (lightbox) {
                          const event = new CustomEvent('openLightbox', {
                            detail: { 
                              src: "/team/Chase/order-journey.png", 
                              alt: "Order Journey Details showing customer activity timeline", 
                              screenshots: [
                                {
                                  src: "/team/Chase/order-journey.png",
                                  alt: "Order Journey Details showing customer activity timeline",
                                  thumb: "/team/Chase/order-journey.png"
                                },
                                {
                                  src: "/team/Chase/fairshare-interface.png",
                                  alt: "Fluid Fair Share™ interface showing credit and rep information",
                                  thumb: "/team/Chase/fairshare-interface.png"
                                }
                              ],
                              index: 0
                            }
                          });
                          window.dispatchEvent(event);
                          lightbox.hidden = false;
                          requestAnimationFrame(() => {
                            lightbox.classList.add('open');
                          });
                        }
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
                    <img 
                      src="/team/Chase/fairshare-interface.png"
                      alt="Fluid Fair Share™ interface showing credit and rep information"
                      className="thumb"
                      onClick={() => {
                        const lightbox = document.getElementById('lightbox');
                        if (lightbox) {
                          const event = new CustomEvent('openLightbox', {
                            detail: { 
                              src: "/team/Chase/fairshare-interface.png", 
                              alt: "Fluid Fair Share™ interface showing credit and rep information", 
                              screenshots: [
                                {
                                  src: "/team/Chase/order-journey.png",
                                  alt: "Order Journey Details showing customer activity timeline",
                                  thumb: "/team/Chase/order-journey.png"
                                },
                                {
                                  src: "/team/Chase/fairshare-interface.png",
                                  alt: "Fluid Fair Share™ interface showing credit and rep information",
                                  thumb: "/team/Chase/fairshare-interface.png"
                                }
                              ],
                              index: 1
                            }
                          });
                          window.dispatchEvent(event);
                          lightbox.hidden = false;
                          requestAnimationFrame(() => {
                            lightbox.classList.add('open');
                          });
                        }
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
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Rob with Tabbed Interface */}
        <div className="team-member reveal expandable" id="rob">
          <button 
            className="name-btn" 
            aria-expanded={expandedMember === "rob"}
            onClick={() => handleMemberToggle("rob")}
          >
            <div className="name">Rob</div>
            <div className="role" style={{
              opacity: expandedMember === "rob" ? 0 : 1,
              transform: expandedMember === "rob" ? 'translateY(-10px)' : 'translateY(0)',
              transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
            }}>
              Data and Droplets
            </div>
          </button>
          <div className={`details ${expandedMember === "rob" ? 'open' : ''}`} id="robDetails" hidden={expandedMember !== "rob"} style={{ maxHeight: expandedMember === "rob" ? '1200px' : '0', overflow: 'visible', padding: expandedMember === "rob" ? '8px 0' : '0' }}>
            {/* Rob's Tabbed Interface */}
            <div style={{ marginTop: '0px' }}>
              {/* Tab Navigation */}
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                marginBottom: '24px',
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.08) 100%)',
                borderRadius: '16px',
                padding: '6px',
                border: '1px solid rgba(255, 255, 255, 0.18)',
                maxWidth: '320px',
                margin: '0 auto 24px',
                backdropFilter: 'blur(20px)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
                position: 'relative',
                opacity: expandedMember === "rob" ? 1 : 0,
                transform: expandedMember === "rob" ? 'translateY(0) scale(1)' : 'translateY(-20px) scale(0.95)',
                transition: 'all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                transitionDelay: expandedMember === "rob" ? '0.2s' : '0s'
              }}>
                <button 
                  onClick={() => setRobActiveTab('data')}
                  style={{
                    flex: 1,
                    background: robActiveTab === 'data' 
                      ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.15) 100%)' 
                      : 'transparent',
                    border: 'none',
                    color: robActiveTab === 'data' ? '#ffffff' : 'rgba(255, 255, 255, 0.75)',
                    padding: '14px 18px',
                    borderRadius: '12px',
                    fontSize: '15px',
                    fontWeight: robActiveTab === 'data' ? '600' : '500',
                    cursor: 'pointer',
                    minHeight: '48px',
                    transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                    position: 'relative',
                    overflow: 'hidden',
                    letterSpacing: '-0.01em',
                    boxShadow: robActiveTab === 'data' 
                      ? '0 2px 8px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.2)' 
                      : 'none',
                    backdropFilter: robActiveTab === 'data' ? 'blur(10px)' : 'none'
                  }}>
                  Data
                </button>
                <button 
                  onClick={() => setRobActiveTab('droplets')}
                  style={{
                    flex: 1,
                    background: robActiveTab === 'droplets' 
                      ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.15) 100%)' 
                      : 'transparent',
                    border: 'none',
                    color: robActiveTab === 'droplets' ? '#ffffff' : 'rgba(255, 255, 255, 0.75)',
                    padding: '14px 18px',
                    borderRadius: '12px',
                    fontSize: '15px',
                    fontWeight: robActiveTab === 'droplets' ? '600' : '500',
                    cursor: 'pointer',
                    minHeight: '48px',
                    marginLeft: '2px',
                    transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                    position: 'relative',
                    overflow: 'hidden',
                    letterSpacing: '-0.01em',
                    boxShadow: robActiveTab === 'droplets' 
                      ? '0 2px 8px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.2)' 
                      : 'none',
                    backdropFilter: robActiveTab === 'droplets' ? 'blur(10px)' : 'none'
                  }}>
                  Droplets
                </button>
              </div>

              {/* Tab Content Placeholder */}
              <div className="tab-content" style={{ marginTop: '20px', minHeight: '200px' }}>
                {robActiveTab === 'data' && (
                  <div>
                    {/* Data Integrity Workflow Description */}
                    <div style={{
                      marginBottom: '24px',
                      textAlign: 'center',
                      maxWidth: '600px',
                      margin: '0 auto 24px'
                    }}>
                      <h3 style={{
                        fontSize: '18px',
                        fontWeight: '600',
                        marginBottom: '16px',
                        color: 'rgba(255, 255, 255, 0.95)',
                        letterSpacing: '-0.02em'
                      }}>Data Integrity Workflow</h3>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', textAlign: 'left' }}>
                        <div style={{ display: 'flex', alignItems: 'start', gap: '12px' }}>
                          <span style={{ 
                            fontSize: '20px', 
                            lineHeight: '1.4',
                            minWidth: '24px'
                          }}>🔍</span>
                          <div>
                            <div style={{ fontWeight: '500', marginBottom: '4px', color: 'rgba(255, 255, 255, 0.9)' }}>
                              Sentry Monitoring
                            </div>
                            <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.65)', lineHeight: '1.5' }}>
                              Check Sentry for failed syncing jobs to identify integration issues early
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'start', gap: '12px' }}>
                          <span style={{ 
                            fontSize: '20px', 
                            lineHeight: '1.4',
                            minWidth: '24px'
                          }}>✓</span>
                          <div>
                            <div style={{ fontWeight: '500', marginBottom: '4px', color: 'rgba(255, 255, 255, 0.9)' }}>
                              Random Order Testing
                            </div>
                            <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.65)', lineHeight: '1.5' }}>
                              Perform random testing for orders in Fluid and cross-reference with back office to ensure proper synchronization
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'start', gap: '12px' }}>
                          <span style={{ 
                            fontSize: '20px', 
                            lineHeight: '1.4',
                            minWidth: '24px'
                          }}>⚙️</span>
                          <div>
                            <div style={{ fontWeight: '500', marginBottom: '4px', color: 'rgba(255, 255, 255, 0.9)' }}>
                              Alert Refinement
                              <span style={{
                                marginLeft: '8px',
                                fontSize: '11px',
                                fontWeight: '600',
                                background: 'linear-gradient(135deg, rgba(234, 179, 8, 0.5), rgba(249, 115, 22, 0.5))',
                                padding: '2px 8px',
                                borderRadius: '6px',
                                color: 'rgba(255, 255, 255, 0.95)',
                                border: '1px solid rgba(255, 255, 255, 0.2)'
                              }}>REFINING</span>
                            </div>
                            <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.65)', lineHeight: '1.5' }}>
                              While Sentry has caught several issues, some alerts didn&apos;t trigger as expected. Reviewing Sentry placements with Chris to refine the alert system and catch edge cases
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Screenshots */}
                    <div className="shots">
                      <img 
                      src="/team/Rob/Data/Order_list_in_fluid.png"
                      alt="Order list view in Fluid system with comprehensive order tracking"
                      width="320"
                      height="200"
                      className="thumb"
                      onClick={() => {
                        const lightbox = document.getElementById('lightbox');
                        if (lightbox) {
                          const event = new CustomEvent('openLightbox', {
                            detail: { 
                              src: "/team/Rob/Data/Order_list_in_fluid.png", 
                              alt: "Order list view in Fluid system with comprehensive order tracking", 
                              screenshots: [
                                {
                                  src: "/team/Rob/Data/Order_list_in_fluid.png",
                                  alt: "Order list view in Fluid system with comprehensive order tracking",
                                  thumb: "/team/Rob/Data/Order_list_in_fluid.png"
                                },
                                {
                                  src: "/team/Rob/Data/Order_in_fluid.png",
                                  alt: "Order interface in Fluid system showing order management",
                                  thumb: "/team/Rob/Data/Order_in_fluid.png"
                                },
                                {
                                  src: "/team/Rob/Data/Order_matched_Exigo_final.png",
                                  alt: "Final order matching interface with Exigo integration",
                                  thumb: "/team/Rob/Data/Order_matched_Exigo_final.png"
                                },
                                {
                                  src: "/team/Rob/Data/Order_matched_exigo.png",
                                  alt: "Order matching system showing Exigo synchronization",
                                  thumb: "/team/Rob/Data/Order_matched_exigo.png"
                                }
                              ],
                              index: 0
                            }
                          });
                          window.dispatchEvent(event);
                          lightbox.hidden = false;
                          requestAnimationFrame(() => {
                            lightbox.classList.add('open');
                          });
                        }
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
                    <img 
                      src="/team/Rob/Data/Order_in_fluid.png"
                      alt="Order interface in Fluid system showing order management"
                      width="320"
                      height="200"
                      className="thumb"
                      onClick={() => {
                        const lightbox = document.getElementById('lightbox');
                        if (lightbox) {
                          const event = new CustomEvent('openLightbox', {
                            detail: { 
                              src: "/team/Rob/Data/Order_in_fluid.png", 
                              alt: "Order interface in Fluid system showing order management", 
                              screenshots: [
                                {
                                  src: "/team/Rob/Data/Order_list_in_fluid.png",
                                  alt: "Order list view in Fluid system with comprehensive order tracking",
                                  thumb: "/team/Rob/Data/Order_list_in_fluid.png"
                                },
                                {
                                  src: "/team/Rob/Data/Order_in_fluid.png",
                                  alt: "Order interface in Fluid system showing order management",
                                  thumb: "/team/Rob/Data/Order_in_fluid.png"
                                },
                                {
                                  src: "/team/Rob/Data/Order_matched_Exigo_final.png",
                                  alt: "Final order matching interface with Exigo integration",
                                  thumb: "/team/Rob/Data/Order_matched_Exigo_final.png"
                                },
                                {
                                  src: "/team/Rob/Data/Order_matched_exigo.png",
                                  alt: "Order matching system showing Exigo synchronization",
                                  thumb: "/team/Rob/Data/Order_matched_exigo.png"
                                }
                              ],
                              index: 1
                            }
                          });
                          window.dispatchEvent(event);
                          lightbox.hidden = false;
                          requestAnimationFrame(() => {
                            lightbox.classList.add('open');
                          });
                        }
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
                    <img 
                      src="/team/Rob/Data/Order_matched_Exigo_final.png"
                      alt="Final order matching interface with Exigo integration"
                      width="320"
                      height="200"
                      className="thumb"
                      onClick={() => {
                        const lightbox = document.getElementById('lightbox');
                        if (lightbox) {
                          const event = new CustomEvent('openLightbox', {
                            detail: { 
                              src: "/team/Rob/Data/Order_matched_Exigo_final.png", 
                              alt: "Final order matching interface with Exigo integration", 
                              screenshots: [
                                {
                                  src: "/team/Rob/Data/Order_list_in_fluid.png",
                                  alt: "Order list view in Fluid system with comprehensive order tracking",
                                  thumb: "/team/Rob/Data/Order_list_in_fluid.png"
                                },
                                {
                                  src: "/team/Rob/Data/Order_in_fluid.png",
                                  alt: "Order interface in Fluid system showing order management",
                                  thumb: "/team/Rob/Data/Order_in_fluid.png"
                                },
                                {
                                  src: "/team/Rob/Data/Order_matched_Exigo_final.png",
                                  alt: "Final order matching interface with Exigo integration",
                                  thumb: "/team/Rob/Data/Order_matched_Exigo_final.png"
                                },
                                {
                                  src: "/team/Rob/Data/Order_matched_exigo.png",
                                  alt: "Order matching system showing Exigo synchronization",
                                  thumb: "/team/Rob/Data/Order_matched_exigo.png"
                                }
                              ],
                              index: 2
                            }
                          });
                          window.dispatchEvent(event);
                          lightbox.hidden = false;
                          requestAnimationFrame(() => {
                            lightbox.classList.add('open');
                          });
                        }
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
                    <img 
                      src="/team/Rob/Data/Order_matched_exigo.png"
                      alt="Order matching system showing Exigo synchronization"
                      width="320"
                      height="200"
                      className="thumb"
                      onClick={() => {
                        const lightbox = document.getElementById('lightbox');
                        if (lightbox) {
                          const event = new CustomEvent('openLightbox', {
                            detail: { 
                              src: "/team/Rob/Data/Order_matched_exigo.png", 
                              alt: "Order matching system showing Exigo synchronization", 
                              screenshots: [
                                {
                                  src: "/team/Rob/Data/Order_list_in_fluid.png",
                                  alt: "Order list view in Fluid system with comprehensive order tracking",
                                  thumb: "/team/Rob/Data/Order_list_in_fluid.png"
                                },
                                {
                                  src: "/team/Rob/Data/Order_in_fluid.png",
                                  alt: "Order interface in Fluid system showing order management",
                                  thumb: "/team/Rob/Data/Order_in_fluid.png"
                                },
                                {
                                  src: "/team/Rob/Data/Order_matched_Exigo_final.png",
                                  alt: "Final order matching interface with Exigo integration",
                                  thumb: "/team/Rob/Data/Order_matched_Exigo_final.png"
                                },
                                {
                                  src: "/team/Rob/Data/Order_matched_exigo.png",
                                  alt: "Order matching system showing Exigo synchronization",
                                  thumb: "/team/Rob/Data/Order_matched_exigo.png"
                                }
                              ],
                              index: 3
                            }
                          });
                          window.dispatchEvent(event);
                          lightbox.hidden = false;
                          requestAnimationFrame(() => {
                            lightbox.classList.add('open');
                          });
                        }
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
                    </div>
                  </div>
                )}
                {robActiveTab === 'droplets' && (
                  <div>
                    {/* Daily Monitoring Workflow Description */}
                    <div style={{
                      marginBottom: '24px',
                      textAlign: 'center',
                      maxWidth: '600px',
                      margin: '0 auto 24px'
                    }}>
                      <h3 style={{
                        fontSize: '18px',
                        fontWeight: '600',
                        marginBottom: '16px',
                        color: 'rgba(255, 255, 255, 0.95)',
                        letterSpacing: '-0.02em'
                      }}>Daily Monitoring Workflow</h3>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', textAlign: 'left' }}>
                        <div style={{ display: 'flex', alignItems: 'start', gap: '12px' }}>
                          <span style={{ 
                            fontSize: '20px', 
                            lineHeight: '1.4',
                            minWidth: '24px'
                          }}>🔍</span>
                          <div>
                            <div style={{ fontWeight: '500', marginBottom: '4px', color: 'rgba(255, 255, 255, 0.9)' }}>
                              Sentry Monitoring
                            </div>
                            <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.65)', lineHeight: '1.5' }}>
                              Check Sentry for timed-out API calls to catch issues before they impact users
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'start', gap: '12px' }}>
                          <span style={{ 
                            fontSize: '20px', 
                            lineHeight: '1.4',
                            minWidth: '24px'
                          }}>⚡</span>
                          <div>
                            <div style={{ fontWeight: '500', marginBottom: '4px', color: 'rgba(255, 255, 255, 0.9)' }}>
                              Health Checks
                              <span style={{
                                marginLeft: '8px',
                                fontSize: '11px',
                                fontWeight: '600',
                                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.5), rgba(147, 51, 234, 0.5))',
                                padding: '2px 8px',
                                borderRadius: '6px',
                                color: 'rgba(255, 255, 255, 0.95)',
                                border: '1px solid rgba(255, 255, 255, 0.2)'
                              }}>IN PROGRESS</span>
                            </div>
                            <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.65)', lineHeight: '1.5' }}>
                              Building a system to proactively ping API endpoints and test endpoint health
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'start', gap: '12px' }}>
                          <span style={{ 
                            fontSize: '20px', 
                            lineHeight: '1.4',
                            minWidth: '24px'
                          }}>🛡️</span>
                          <div>
                            <div style={{ fontWeight: '500', marginBottom: '4px', color: 'rgba(255, 255, 255, 0.9)' }}>
                              Marketplace Patrol
                            </div>
                            <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.65)', lineHeight: '1.5' }}>
                              Check marketplace to ensure there are no shell droplets affecting the system
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Screenshot */}
                    <div className="shots">
                      <img 
                        src="/team/Rob/Droplets/Sentrybot_droplets.png"
                        alt="Sentrybot droplets monitoring and management interface"
                        width="320"
                        height="200"
                        className="thumb"
                        onClick={() => {
                          const lightbox = document.getElementById('lightbox');
                          if (lightbox) {
                            const event = new CustomEvent('openLightbox', {
                              detail: { 
                                src: "/team/Rob/Droplets/Sentrybot_droplets.png", 
                                alt: "Sentrybot droplets monitoring and management interface", 
                                screenshots: [
                                  {
                                    src: "/team/Rob/Droplets/Sentrybot_droplets.png",
                                    alt: "Sentrybot droplets monitoring and management interface",
                                    thumb: "/team/Rob/Droplets/Sentrybot_droplets.png"
                                  }
                                ],
                                index: 0
                              }
                            });
                            window.dispatchEvent(event);
                            lightbox.hidden = false;
                            requestAnimationFrame(() => {
                              lightbox.classList.add('open');
                            });
                          }
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
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Kevin with Simple Tabbed Interface - Testing */}
        <div className="team-member reveal expandable" id="kevin">
          <button 
            className="name-btn" 
            aria-expanded={expandedMember === "kevin"}
            onClick={() => handleMemberToggle("kevin")}
          >
            <div className="name">Kevin</div>
            <div className="role" style={{
              opacity: expandedMember === "kevin" ? 0 : 1,
              transform: expandedMember === "kevin" ? 'translateY(-10px)' : 'translateY(0)',
              transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
            }}>
              Mobile, Desktop, and Themes
            </div>
          </button>
          <div className={`details ${expandedMember === "kevin" ? 'open' : ''}`} id="kevinDetails" hidden={expandedMember !== "kevin"} style={{ maxHeight: expandedMember === "kevin" ? '1200px' : '0', overflow: 'visible', padding: expandedMember === "kevin" ? '8px 0' : '0' }}>

            {/* Simple Direct Implementation - No External Component */}
            <div style={{ marginTop: '0px' }}>
              {/* Visible Tab Navigation */}
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                marginBottom: '24px',
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.08) 100%)',
                borderRadius: '16px',
                padding: '6px',
                border: '1px solid rgba(255, 255, 255, 0.18)',
                maxWidth: '420px',
                margin: '0 auto 24px',
                backdropFilter: 'blur(20px)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
                position: 'relative',
                opacity: expandedMember === "kevin" ? 1 : 0,
                transform: expandedMember === "kevin" ? 'translateY(0) scale(1)' : 'translateY(-20px) scale(0.95)',
                transition: 'all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                transitionDelay: expandedMember === "kevin" ? '0.2s' : '0s'
              }}>
                <button 
                  onClick={() => setKevinActiveTab('mobile')}
                  style={{
                    flex: 1,
                    background: kevinActiveTab === 'mobile' 
                      ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.15) 100%)' 
                      : 'transparent',
                    border: 'none',
                    color: kevinActiveTab === 'mobile' ? '#ffffff' : 'rgba(255, 255, 255, 0.75)',
                    padding: '14px 18px',
                    borderRadius: '12px',
                    fontSize: '15px',
                    fontWeight: kevinActiveTab === 'mobile' ? '600' : '500',
                    cursor: 'pointer',
                    minHeight: '48px',
                    transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                    position: 'relative',
                    overflow: 'hidden',
                    letterSpacing: '-0.01em',
                    boxShadow: kevinActiveTab === 'mobile' 
                      ? '0 2px 8px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.2)' 
                      : 'none',
                    backdropFilter: kevinActiveTab === 'mobile' ? 'blur(10px)' : 'none'
                  }}
                  onMouseEnter={(e) => {
                    if (kevinActiveTab !== 'mobile') {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                      e.currentTarget.style.color = 'rgba(255, 255, 255, 0.9)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (kevinActiveTab !== 'mobile') {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = 'rgba(255, 255, 255, 0.75)';
                    }
                  }}>
                  Mobile
                </button>
                <button 
                  onClick={() => setKevinActiveTab('desktop')}
                  style={{
                    flex: 1,
                    background: kevinActiveTab === 'desktop' 
                      ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.15) 100%)' 
                      : 'transparent',
                    border: 'none',
                    color: kevinActiveTab === 'desktop' ? '#ffffff' : 'rgba(255, 255, 255, 0.75)',
                    padding: '14px 18px',
                    borderRadius: '12px',
                    fontSize: '15px',
                    fontWeight: kevinActiveTab === 'desktop' ? '600' : '500',
                    cursor: 'pointer',
                    minHeight: '48px',
                    marginLeft: '2px',
                    transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                    position: 'relative',
                    overflow: 'hidden',
                    letterSpacing: '-0.01em',
                    boxShadow: kevinActiveTab === 'desktop' 
                      ? '0 2px 8px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.2)' 
                      : 'none',
                    backdropFilter: kevinActiveTab === 'desktop' ? 'blur(10px)' : 'none'
                  }}
                  onMouseEnter={(e) => {
                    if (kevinActiveTab !== 'desktop') {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                      e.currentTarget.style.color = 'rgba(255, 255, 255, 0.9)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (kevinActiveTab !== 'desktop') {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = 'rgba(255, 255, 255, 0.75)';
                    }
                  }}>
                  Desktop
                </button>
                <button 
                  onClick={() => setKevinActiveTab('themes')}
                  style={{
                    flex: 1,
                    background: kevinActiveTab === 'themes' 
                      ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.15) 100%)' 
                      : 'transparent',
                    border: 'none',
                    color: kevinActiveTab === 'themes' ? '#ffffff' : 'rgba(255, 255, 255, 0.75)',
                    padding: '14px 18px',
                    borderRadius: '12px',
                    fontSize: '15px',
                    fontWeight: kevinActiveTab === 'themes' ? '600' : '500',
                    cursor: 'pointer',
                    minHeight: '48px',
                    marginLeft: '2px',
                    transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                    position: 'relative',
                    overflow: 'hidden',
                    letterSpacing: '-0.01em',
                    boxShadow: kevinActiveTab === 'themes' 
                      ? '0 2px 8px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.2)' 
                      : 'none',
                    backdropFilter: kevinActiveTab === 'themes' ? 'blur(10px)' : 'none'
                  }}
                  onMouseEnter={(e) => {
                    if (kevinActiveTab !== 'themes') {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                      e.currentTarget.style.color = 'rgba(255, 255, 255, 0.9)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (kevinActiveTab !== 'themes') {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = 'rgba(255, 255, 255, 0.75)';
                    }
                  }}>
                  Themes
                </button>
              </div>

              {/* Tab Content */}
              <div className="tab-content" style={{ marginTop: '20px', minHeight: '200px' }}>
                {kevinActiveTab === 'mobile' && (
                  <div>
                    {/* Mobile Analytics & Monitoring Description */}
                    <div style={{
                      marginBottom: '24px',
                      textAlign: 'center',
                      maxWidth: '600px',
                      margin: '0 auto 24px'
                    }}>
                      <h3 style={{
                        fontSize: '18px',
                        fontWeight: '600',
                        marginBottom: '16px',
                        color: 'rgba(255, 255, 255, 0.95)',
                        letterSpacing: '-0.02em'
                      }}>Mobile Analytics & Error Monitoring</h3>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', textAlign: 'left' }}>
                        <div style={{ display: 'flex', alignItems: 'start', gap: '12px' }}>
                          <span style={{ 
                            fontSize: '20px', 
                            lineHeight: '1.4',
                            minWidth: '24px'
                          }}>📊</span>
                          <div>
                            <div style={{ fontWeight: '500', marginBottom: '4px', color: 'rgba(255, 255, 255, 0.9)' }}>
                              PostHog Analytics
                            </div>
                            <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.65)', lineHeight: '1.5' }}>
                              Track daily user counts, monthly unique users, and platform analytics (Android vs iOS) to understand app usage patterns
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'start', gap: '12px' }}>
                          <span style={{ 
                            fontSize: '20px', 
                            lineHeight: '1.4',
                            minWidth: '24px'
                          }}>🔍</span>
                          <div>
                            <div style={{ fontWeight: '500', marginBottom: '4px', color: 'rgba(255, 255, 255, 0.9)' }}>
                              Sentry Error Reporting
                            </div>
                            <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.65)', lineHeight: '1.5' }}>
                              Comprehensive error tracking with frequency analysis, first occurrence timestamps, and critical bug detection
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'start', gap: '12px' }}>
                          <span style={{ 
                            fontSize: '20px', 
                            lineHeight: '1.4',
                            minWidth: '24px'
                          }}>🎫</span>
                          <div>
                            <div style={{ fontWeight: '500', marginBottom: '4px', color: 'rgba(255, 255, 255, 0.9)' }}>
                              Bug Triage
                            </div>
                            <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.65)', lineHeight: '1.5' }}>
                              Frequently occurring errors are ticketed for investigation to determine if they&apos;re false alarms or require fixes
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Screenshots */}
                    <div className="shots">
                      <img 
                      src="/team/Kevin/Mobile/Errors_and_Outages.png"
                      alt="Mobile error handling and outage management interface"
                      width="320"
                      height="200"
                      className="thumb"
                      onClick={() => {
                        const lightbox = document.getElementById('lightbox');
                        if (lightbox) {
                          const event = new CustomEvent('openLightbox', {
                            detail: { 
                              src: "/team/Kevin/Mobile/Errors_and_Outages.png", 
                              alt: "Mobile error handling and outage management interface", 
                              screenshots: [
                                {
                                  src: "/team/Kevin/Mobile/Errors_and_Outages.png",
                                  alt: "Mobile error handling and outage management interface",
                                  thumb: "/team/Kevin/Mobile/Errors_and_Outages.png"
                                },
                                {
                                  src: "/team/Kevin/Mobile/Fluid_Mobile .png",
                                  alt: "Fluid mobile application interface",
                                  thumb: "/team/Kevin/Mobile/Fluid_Mobile .png"
                                }
                              ],
                              index: 0
                            }
                          });
                          window.dispatchEvent(event);
                          lightbox.hidden = false;
                          requestAnimationFrame(() => {
                            lightbox.classList.add('open');
                          });
                        }
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
                    <img 
                      src="/team/Kevin/Mobile/Fluid_Mobile .png"
                      alt="Fluid mobile application interface"
                      width="320"
                      height="200"
                      className="thumb"
                      onClick={() => {
                        const lightbox = document.getElementById('lightbox');
                        if (lightbox) {
                          const event = new CustomEvent('openLightbox', {
                            detail: { 
                              src: "/team/Kevin/Mobile/Fluid_Mobile .png", 
                              alt: "Fluid mobile application interface", 
                              screenshots: [
                                {
                                  src: "/team/Kevin/Mobile/Errors_and_Outages.png",
                                  alt: "Mobile error handling and outage management interface",
                                  thumb: "/team/Kevin/Mobile/Errors_and_Outages.png"
                                },
                                {
                                  src: "/team/Kevin/Mobile/Fluid_Mobile .png",
                                  alt: "Fluid mobile application interface",
                                  thumb: "/team/Kevin/Mobile/Fluid_Mobile .png"
                                }
                              ],
                              index: 1
                            }
                          });
                          window.dispatchEvent(event);
                          lightbox.hidden = false;
                          requestAnimationFrame(() => {
                            lightbox.classList.add('open');
                          });
                        }
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
                    </div>
                  </div>
                )}

                {kevinActiveTab === 'desktop' && (
                  <div>
                    {/* Desktop Testing Description */}
                    <div style={{
                      marginBottom: '24px',
                      textAlign: 'center',
                      maxWidth: '600px',
                      margin: '0 auto 24px'
                    }}>
                      <h3 style={{
                        fontSize: '18px',
                        fontWeight: '600',
                        marginBottom: '16px',
                        color: 'rgba(255, 255, 255, 0.95)',
                        letterSpacing: '-0.02em'
                      }}>Desktop Application Testing</h3>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', textAlign: 'left' }}>
                        <div style={{ display: 'flex', alignItems: 'start', gap: '12px' }}>
                          <span style={{ 
                            fontSize: '20px', 
                            lineHeight: '1.4',
                            minWidth: '24px'
                          }}>👤</span>
                          <div>
                            <div style={{ fontWeight: '500', marginBottom: '4px', color: 'rgba(255, 255, 255, 0.9)' }}>
                              Manual Human Testing
                            </div>
                            <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.65)', lineHeight: '1.5' }}>
                              No PostHog analytics setup - testing relies on hands-on verification
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'start', gap: '12px' }}>
                          <span style={{ 
                            fontSize: '20px', 
                            lineHeight: '1.4',
                            minWidth: '24px'
                          }}>🔐</span>
                          <div>
                            <div style={{ fontWeight: '500', marginBottom: '4px', color: 'rgba(255, 255, 255, 0.9)' }}>
                              Sign-In Flow Testing
                            </div>
                            <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.65)', lineHeight: '1.5' }}>
                              Verify authentication and login processes work correctly
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'start', gap: '12px' }}>
                          <span style={{ 
                            fontSize: '20px', 
                            lineHeight: '1.4',
                            minWidth: '24px'
                          }}>✓</span>
                          <div>
                            <div style={{ fontWeight: '500', marginBottom: '4px', color: 'rgba(255, 255, 255, 0.9)' }}>
                              Full Flow Verification
                            </div>
                            <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.65)', lineHeight: '1.5' }}>
                              Check all user flows and functionality to ensure everything works as expected
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div style={{ 
                      textAlign: 'center', 
                      padding: '20px', 
                      color: 'var(--muted)',
                      fontSize: '15px'
                    }}>
                      Screenshots coming soon for desktop applications
                    </div>
                  </div>
                )}

                {kevinActiveTab === 'themes' && (
                  <div>
                    {/* Theme Performance Monitoring Description */}
                    <div style={{
                      marginBottom: '24px',
                      textAlign: 'center',
                      maxWidth: '600px',
                      margin: '0 auto 24px'
                    }}>
                      <h3 style={{
                        fontSize: '18px',
                        fontWeight: '600',
                        marginBottom: '16px',
                        color: 'rgba(255, 255, 255, 0.95)',
                        letterSpacing: '-0.02em'
                      }}>Theme Performance & Quality</h3>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', textAlign: 'left' }}>
                        <div style={{ display: 'flex', alignItems: 'start', gap: '12px' }}>
                          <span style={{ 
                            fontSize: '20px', 
                            lineHeight: '1.4',
                            minWidth: '24px'
                          }}>⚡</span>
                          <div>
                            <div style={{ fontWeight: '500', marginBottom: '4px', color: 'rgba(255, 255, 255, 0.9)' }}>
                              Document Delivery Time
                            </div>
                            <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.65)', lineHeight: '1.5' }}>
                              Monitor backend performance including database queries, code assembly from sections, and function execution times
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'start', gap: '12px' }}>
                          <span style={{ 
                            fontSize: '20px', 
                            lineHeight: '1.4',
                            minWidth: '24px'
                          }}>🎯</span>
                          <div>
                            <div style={{ fontWeight: '500', marginBottom: '4px', color: 'rgba(255, 255, 255, 0.9)' }}>
                              Lighthouse Scores
                            </div>
                            <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.65)', lineHeight: '1.5' }}>
                              Track performance, SEO, and accessibility metrics to identify improvement opportunities
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'start', gap: '12px' }}>
                          <span style={{ 
                            fontSize: '20px', 
                            lineHeight: '1.4',
                            minWidth: '24px'
                          }}>🎨</span>
                          <div>
                            <div style={{ fontWeight: '500', marginBottom: '4px', color: 'rgba(255, 255, 255, 0.9)' }}>
                              Visual Regression Testing
                            </div>
                            <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.65)', lineHeight: '1.5' }}>
                              Ensure code changes don&apos;t break existing theme styles (e.g., prevented issues like the Thermomix page break)
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Screenshots */}
                    <div className="shots">
                      <img 
                      src="/team/Kevin/Themes/Google_cloud_themes.png"
                      alt="Google Cloud themes interface showing customization options"
                      width="320"
                      height="200"
                      className="thumb"
                      onClick={() => {
                        const lightbox = document.getElementById('lightbox');
                        if (lightbox) {
                          const event = new CustomEvent('openLightbox', {
                            detail: { 
                              src: "/team/Kevin/Themes/Google_cloud_themes.png", 
                              alt: "Google Cloud themes interface showing customization options", 
                              screenshots: [
                                {
                                  src: "/team/Kevin/Themes/Google_cloud_themes.png",
                                  alt: "Google Cloud themes interface showing customization options",
                                  thumb: "/team/Kevin/Themes/Google_cloud_themes.png"
                                },
                                {
                                  src: "/team/Kevin/Themes/Lighthouse_themes.png",
                                  alt: "Lighthouse themes configuration and performance metrics",
                                  thumb: "/team/Kevin/Themes/Lighthouse_themes.png"
                                },
                                {
                                  src: "/team/Kevin/Themes/Uptime Monitors.png",
                                  alt: "Uptime monitoring dashboard with theme customization",
                                  thumb: "/team/Kevin/Themes/Uptime Monitors.png"
                                }
                              ],
                              index: 0
                            }
                          });
                          window.dispatchEvent(event);
                          lightbox.hidden = false;
                          requestAnimationFrame(() => {
                            lightbox.classList.add('open');
                          });
                        }
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
                    <img 
                      src="/team/Kevin/Themes/Lighthouse_themes.png"
                      alt="Lighthouse themes configuration and performance metrics"
                      width="320"
                      height="200"
                      className="thumb"
                      onClick={() => {
                        const lightbox = document.getElementById('lightbox');
                        if (lightbox) {
                          const event = new CustomEvent('openLightbox', {
                            detail: { 
                              src: "/team/Kevin/Themes/Lighthouse_themes.png", 
                              alt: "Lighthouse themes configuration and performance metrics", 
                              screenshots: [
                                {
                                  src: "/team/Kevin/Themes/Google_cloud_themes.png",
                                  alt: "Google Cloud themes interface showing customization options",
                                  thumb: "/team/Kevin/Themes/Google_cloud_themes.png"
                                },
                                {
                                  src: "/team/Kevin/Themes/Lighthouse_themes.png",
                                  alt: "Lighthouse themes configuration and performance metrics",
                                  thumb: "/team/Kevin/Themes/Lighthouse_themes.png"
                                },
                                {
                                  src: "/team/Kevin/Themes/Uptime Monitors.png",
                                  alt: "Uptime monitoring dashboard with theme customization",
                                  thumb: "/team/Kevin/Themes/Uptime Monitors.png"
                                }
                              ],
                              index: 1
                            }
                          });
                          window.dispatchEvent(event);
                          lightbox.hidden = false;
                          requestAnimationFrame(() => {
                            lightbox.classList.add('open');
                          });
                        }
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
                    <img 
                      src="/team/Kevin/Themes/Uptime Monitors.png"
                      alt="Uptime monitoring dashboard with theme customization"
                      width="320"
                      height="200"
                      className="thumb"
                      onClick={() => {
                        const lightbox = document.getElementById('lightbox');
                        if (lightbox) {
                          const event = new CustomEvent('openLightbox', {
                            detail: { 
                              src: "/team/Kevin/Themes/Uptime Monitors.png", 
                              alt: "Uptime monitoring dashboard with theme customization", 
                              screenshots: [
                                {
                                  src: "/team/Kevin/Themes/Google_cloud_themes.png",
                                  alt: "Google Cloud themes interface showing customization options",
                                  thumb: "/team/Kevin/Themes/Google_cloud_themes.png"
                                },
                                {
                                  src: "/team/Kevin/Themes/Lighthouse_themes.png",
                                  alt: "Lighthouse themes configuration and performance metrics",
                                  thumb: "/team/Kevin/Themes/Lighthouse_themes.png"
                                },
                                {
                                  src: "/team/Kevin/Themes/Uptime Monitors.png",
                                  alt: "Uptime monitoring dashboard with theme customization",
                                  thumb: "/team/Kevin/Themes/Uptime Monitors.png"
                                }
                              ],
                              index: 2
                            }
                          });
                          window.dispatchEvent(event);
                          lightbox.hidden = false;
                          requestAnimationFrame(() => {
                            lightbox.classList.add('open');
                          });
                        }
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
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Ben with Tabbed Interface */}
        <div className="team-member reveal expandable" id="ben">
          <button 
            className="name-btn" 
            aria-expanded={expandedMember === "ben"}
            onClick={() => handleMemberToggle("ben")}
          >
            <div className="name">Ben</div>
            <div className="role" style={{
              opacity: expandedMember === "ben" ? 0 : 1,
              transform: expandedMember === "ben" ? 'translateY(-10px)' : 'translateY(0)',
              transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
            }}>
              Finance and Checkout
            </div>
          </button>
          <div className={`details ${expandedMember === "ben" ? 'open' : ''}`} id="benDetails" hidden={expandedMember !== "ben"} style={{ maxHeight: expandedMember === "ben" ? '1200px' : '0', overflow: 'visible', padding: expandedMember === "ben" ? '8px 0' : '0' }}>
            {/* Ben's Tabbed Interface */}
            <div style={{ marginTop: '0px' }}>
              {/* Tab Navigation */}
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                marginBottom: '24px',
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.08) 100%)',
                borderRadius: '16px',
                padding: '6px',
                border: '1px solid rgba(255, 255, 255, 0.18)',
                maxWidth: '320px',
                margin: '0 auto 24px',
                backdropFilter: 'blur(20px)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
                position: 'relative',
                opacity: expandedMember === "ben" ? 1 : 0,
                transform: expandedMember === "ben" ? 'translateY(0) scale(1)' : 'translateY(-20px) scale(0.95)',
                transition: 'all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                transitionDelay: expandedMember === "ben" ? '0.2s' : '0s'
              }}>
                <button 
                  onClick={() => setBenActiveTab('finance')}
                  style={{
                    flex: 1,
                    background: benActiveTab === 'finance' 
                      ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.15) 100%)' 
                      : 'transparent',
                    border: 'none',
                    color: benActiveTab === 'finance' ? '#ffffff' : 'rgba(255, 255, 255, 0.75)',
                    padding: '14px 18px',
                    borderRadius: '12px',
                    fontSize: '15px',
                    fontWeight: benActiveTab === 'finance' ? '600' : '500',
                    cursor: 'pointer',
                    minHeight: '48px',
                    transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                    position: 'relative',
                    overflow: 'hidden',
                    letterSpacing: '-0.01em',
                    boxShadow: benActiveTab === 'finance' 
                      ? '0 2px 8px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.2)' 
                      : 'none',
                    backdropFilter: benActiveTab === 'finance' ? 'blur(10px)' : 'none'
                  }}>
                  Finance
                </button>
                <button 
                  onClick={() => setBenActiveTab('checkout')}
                  style={{
                    flex: 1,
                    background: benActiveTab === 'checkout' 
                      ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.15) 100%)' 
                      : 'transparent',
                    border: 'none',
                    color: benActiveTab === 'checkout' ? '#ffffff' : 'rgba(255, 255, 255, 0.75)',
                    padding: '14px 18px',
                    borderRadius: '12px',
                    fontSize: '15px',
                    fontWeight: benActiveTab === 'checkout' ? '600' : '500',
                    cursor: 'pointer',
                    minHeight: '48px',
                    marginLeft: '2px',
                    transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                    position: 'relative',
                    overflow: 'hidden',
                    letterSpacing: '-0.01em',
                    boxShadow: benActiveTab === 'checkout' 
                      ? '0 2px 8px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.2)' 
                      : 'none',
                    backdropFilter: benActiveTab === 'checkout' ? 'blur(10px)' : 'none'
                  }}>
                  Checkout
                </button>
              </div>

              {/* Tab Content */}
              <div className="tab-content" style={{ marginTop: '20px', minHeight: '200px' }}>
                {benActiveTab === 'finance' && (
                  <div>
                    {/* Payment Gateway Monitoring Description */}
                    <div style={{
                      marginBottom: '24px',
                      textAlign: 'center',
                      maxWidth: '600px',
                      margin: '0 auto 24px'
                    }}>
                      <h3 style={{
                        fontSize: '18px',
                        fontWeight: '600',
                        marginBottom: '16px',
                        color: 'rgba(255, 255, 255, 0.95)',
                        letterSpacing: '-0.02em'
                      }}>Payment Gateway & Transaction Monitoring</h3>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', textAlign: 'left' }}>
                        <div style={{ display: 'flex', alignItems: 'start', gap: '12px' }}>
                          <span style={{ 
                            fontSize: '20px', 
                            lineHeight: '1.4',
                            minWidth: '24px'
                          }}>💳</span>
                          <div>
                            <div style={{ fontWeight: '500', marginBottom: '4px', color: 'rgba(255, 255, 255, 0.9)' }}>
                              Gateway Decline Monitoring
                            </div>
                            <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.65)', lineHeight: '1.5' }}>
                              Track declined credit card transactions across all live gateways (including upcoming launches like Worldpay for Rain)
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'start', gap: '12px' }}>
                          <span style={{ 
                            fontSize: '20px', 
                            lineHeight: '1.4',
                            minWidth: '24px'
                          }}>🔄</span>
                          <div>
                            <div style={{ fontWeight: '500', marginBottom: '4px', color: 'rgba(255, 255, 255, 0.9)' }}>
                              Alternative Payment Methods
                            </div>
                            <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.65)', lineHeight: '1.5' }}>
                              Monitor declined APM transactions (primarily Bread for Thermomix) to ensure payment flexibility
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'start', gap: '12px' }}>
                          <span style={{ 
                            fontSize: '20px', 
                            lineHeight: '1.4',
                            minWidth: '24px'
                          }}>⚠️</span>
                          <div>
                            <div style={{ fontWeight: '500', marginBottom: '4px', color: 'rgba(255, 255, 255, 0.9)' }}>
                              Order Creation Verification
                            </div>
                            <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.65)', lineHeight: '1.5' }}>
                              Catch instances where customers are charged but orders aren&apos;t created in Fluid (rare now, mainly Bread authorization edge cases)
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'start', gap: '12px' }}>
                          <span style={{ 
                            fontSize: '20px', 
                            lineHeight: '1.4',
                            minWidth: '24px'
                          }}>🎯</span>
                          <div>
                            <div style={{ fontWeight: '500', marginBottom: '4px', color: 'rgba(255, 255, 255, 0.9)' }}>
                              Primary Focus
                            </div>
                            <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.65)', lineHeight: '1.5' }}>
                              Ensure live gateways and APMs aren&apos;t blocking legitimate transactions and verify orders are successfully created in Fluid
                            </div>
                          </div>
                        </div>

                        <div style={{ 
                          marginTop: '8px',
                          padding: '12px',
                          background: 'rgba(59, 130, 246, 0.1)',
                          borderRadius: '8px',
                          border: '1px solid rgba(59, 130, 246, 0.2)'
                        }}>
                          <div style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.7)', lineHeight: '1.5' }}>
                            <strong style={{ color: 'rgba(255, 255, 255, 0.85)' }}>Future monitoring goals:</strong> API performance on checkout, failed subscription orders, abandoned cart rates, and email delivery success rates
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Screenshots */}
                    <div className="shots">
                      <img 
                      src="/team/Ben/Transation History.png"
                      alt="Transaction history and financial tracking interface"
                      className="thumb"
                      onClick={() => {
                        const lightbox = document.getElementById('lightbox');
                        if (lightbox) {
                          const event = new CustomEvent('openLightbox', {
                            detail: { 
                              src: "/team/Ben/Transation History.png", 
                              alt: "Transaction history and financial tracking interface", 
                              screenshots: [
                                {
                                  src: "/team/Ben/Transation History.png",
                                  alt: "Transaction history and financial tracking interface",
                                  thumb: "/team/Ben/Transation History.png"
                                }
                              ],
                              index: 0
                            }
                          });
                          window.dispatchEvent(event);
                          lightbox.hidden = false;
                          requestAnimationFrame(() => {
                            lightbox.classList.add('open');
                          });
                        }
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
                    </div>
                  </div>
                )}

                {benActiveTab === 'checkout' && (
                  <div className="shots">
                    <div>Checkout screenshots will go here...</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        </div>
      </section>

      <section className="reveal">
        <div className="section-container">
          <h2>Simple. Clear. Measurable.</h2>
        </div>
      </section>

      <footer className="reveal" style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--muted)' }}>
        © <span id="year"></span> Micah Baird
      </footer>

      <Lightbox />
    </>
  );
}