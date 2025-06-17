// Advanced Homepage Animations and Interactions
class ModernHomepage {
  constructor() {
    this.init();
  }

  init() {
    this.setupLoadingScreen();
    this.setupParticleSystem();
    this.setupScrollAnimations();
    this.setupHeaderEffects();
    this.setupNavigationEffects();
    this.setupCounterAnimations();
    this.setupInteractiveDemo();
    this.setupFeatureCardEffects();
    this.setupCTAEffects();
    this.setupResponsiveEffects();
  }

  // Loading Screen with Progress Animation
  setupLoadingScreen() {
    const loadingScreen = document.getElementById("loadingScreen");
    const progressBar = document.querySelector(".progress-bar");

    if (!loadingScreen) return;

    // Simulate loading progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 30;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);

        setTimeout(() => {
          loadingScreen.classList.add("hidden");
          document.body.style.overflow = "visible";
        }, 500);
      }
    }, 200);

    // Hide loading screen after maximum time
    setTimeout(() => {
      if (!loadingScreen.classList.contains("hidden")) {
        loadingScreen.classList.add("hidden");
        document.body.style.overflow = "visible";
      }
    }, 4000);
  }

  // Dynamic Particle Background System
  setupParticleSystem() {
    const particleContainer = document.getElementById("particles");
    if (!particleContainer) return;

    const createParticle = () => {
      const particle = document.createElement("div");
      particle.className = "particle";

      // Random positioning and properties
      particle.style.left = Math.random() * 100 + "%";
      particle.style.animationDuration = Math.random() * 15 + 10 + "s";
      particle.style.animationDelay = Math.random() * 5 + "s";
      particle.style.opacity = Math.random() * 0.5 + 0.2;

      // Random size
      const size = Math.random() * 4 + 2;
      particle.style.width = size + "px";
      particle.style.height = size + "px";

      particleContainer.appendChild(particle);

      // Remove particle after animation
      setTimeout(() => {
        if (particle.parentNode) {
          particle.parentNode.removeChild(particle);
        }
      }, 25000);
    };

    // Create initial particles
    for (let i = 0; i < 20; i++) {
      setTimeout(() => createParticle(), i * 100);
    }

    // Continuously create new particles
    setInterval(createParticle, 2000);
  }

  // Advanced Scroll Animations
  setupScrollAnimations() {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px",
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("animate");

          // Trigger counter animation for stats
          if (entry.target.classList.contains("hero-stats")) {
            this.animateCounters();
          }
        }
      });
    }, observerOptions);

    // Observe elements for animation
    document.querySelectorAll(".feature-card").forEach((card) => {
      observer.observe(card);
    });

    document.querySelectorAll(".hero-stats").forEach((stats) => {
      observer.observe(stats);
    });

    // Parallax scroll effect for hero background
    window.addEventListener("scroll", () => {
      const scrolled = window.pageYOffset;
      const heroOrbs = document.querySelectorAll(".hero-orb");

      heroOrbs.forEach((orb, index) => {
        const speed = 0.5 + index * 0.2;
        orb.style.transform = `translateY(${scrolled * speed}px)`;
      });
    });
  }

  // Dynamic Header Effects
  setupHeaderEffects() {
    const header = document.getElementById("header");
    if (!header) return;

    let lastScrollY = window.scrollY;
    let ticking = false;

    const updateHeader = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > 100) {
        header.classList.add("scrolled");
      } else {
        header.classList.remove("scrolled");
      }

      // Hide/show header on scroll direction
      if (currentScrollY > lastScrollY && currentScrollY > 200) {
        header.style.transform = "translateY(-100%)";
      } else {
        header.style.transform = "translateY(0)";
      }

      lastScrollY = currentScrollY;
      ticking = false;
    };

    window.addEventListener("scroll", () => {
      if (!ticking) {
        requestAnimationFrame(updateHeader);
        ticking = true;
      }
    });
  }

  // Enhanced Navigation Effects
  setupNavigationEffects() {
    // Hamburger menu animation
    const hamburger = document.getElementById("hamburger-btn");
    const mobileMenu = document.getElementById("mobile-menu");

    if (hamburger && mobileMenu) {
      hamburger.addEventListener("click", () => {
        hamburger.classList.toggle("active");
        mobileMenu.classList.toggle("active");
        document.body.classList.toggle("menu-open");
      });
    }

    // Close mobile menu when clicking on links
    const mobileNavLinks = document.querySelectorAll(".mobile-nav-link");
    mobileNavLinks.forEach((link) => {
      link.addEventListener("click", () => {
        hamburger?.classList.remove("active");
        mobileMenu?.classList.remove("active");
        document.body.classList.remove("menu-open");
      });
    });

    // Dropdown effects
    const dropdownToggle = document.querySelector(".dropdown-toggle");
    const dropdown = document.querySelector(".dropdown");

    if (dropdownToggle && dropdown) {
      dropdownToggle.addEventListener("click", (e) => {
        e.preventDefault();
        dropdown.classList.toggle("active");
      });

      // Close dropdown when clicking outside
      document.addEventListener("click", (e) => {
        if (!dropdown.contains(e.target)) {
          dropdown.classList.remove("active");
        }
      });
    }

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute("href"));
        if (target) {
          target.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      });
    });
  }

  // Animated Counter for Statistics
  animateCounters() {
    const counters = document.querySelectorAll(".stat-number");

    counters.forEach((counter) => {
      const target = parseInt(counter.getAttribute("data-target"));
      const duration = 2000; // 2 seconds
      const start = performance.now();

      const animate = (currentTime) => {
        const elapsed = currentTime - start;
        const progress = Math.min(elapsed / duration, 1);

        // Easing function for smooth animation
        const easeOutCubic = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(target * easeOutCubic);

        // Format number with commas
        counter.textContent = current.toLocaleString();

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          counter.textContent = target.toLocaleString();
        }
      };

      requestAnimationFrame(animate);
    });
  }

  // Interactive Demo Functionality
  setupInteractiveDemo() {
    const demoTabs = document.querySelectorAll(".demo-tab");
    const demoPanels = document.querySelectorAll(".demo-panel");

    demoTabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        const targetPanel = tab.getAttribute("data-demo");

        // Remove active class from all tabs and panels
        demoTabs.forEach((t) => t.classList.remove("active"));
        demoPanels.forEach((p) => p.classList.remove("active"));

        // Add active class to clicked tab and corresponding panel
        tab.classList.add("active");
        const targetPanelElement = document.querySelector(
          `[data-panel="${targetPanel}"]`,
        );
        if (targetPanelElement) {
          targetPanelElement.classList.add("active");
        }
      });
    });
  }

  // Advanced Feature Card Effects
  setupFeatureCardEffects() {
    const featureCards = document.querySelectorAll(".feature-card");

    featureCards.forEach((card) => {
      // Mouse move parallax effect
      card.addEventListener("mousemove", (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = (y - centerY) / 20;
        const rotateY = (centerX - x) / 20;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(20px)`;
      });

      card.addEventListener("mouseleave", () => {
        card.style.transform =
          "perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)";
      });

      // Card glow effect
      card.addEventListener("mouseenter", () => {
        const cardBackground = card.querySelector(".card-background");
        if (cardBackground) {
          cardBackground.style.opacity = "1";
        }
      });

      card.addEventListener("mouseleave", () => {
        const cardBackground = card.querySelector(".card-background");
        if (cardBackground) {
          cardBackground.style.opacity = "0";
        }
      });
    });
  }

  // Enhanced CTA Button Effects
  setupCTAEffects() {
    const ctaButtons = document.querySelectorAll(".main-cta, .secondary-cta");

    ctaButtons.forEach((button) => {
      // Ripple effect on click
      button.addEventListener("click", (e) => {
        const ripple = document.createElement("div");
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;

        ripple.style.cssText = `
          position: absolute;
          width: ${size}px;
          height: ${size}px;
          left: ${x}px;
          top: ${y}px;
          background: rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          transform: scale(0);
          animation: ripple 0.6s ease-out;
          pointer-events: none;
        `;

        button.appendChild(ripple);

        setTimeout(() => {
          ripple.remove();
        }, 600);
      });

      // Particle effect for main CTA
      if (button.classList.contains("main-cta")) {
        const createCTAParticle = () => {
          const particle = document.createElement("div");
          particle.style.cssText = `
            position: absolute;
            width: 4px;
            height: 4px;
            background: rgba(255, 255, 255, 0.8);
            border-radius: 50%;
            pointer-events: none;
            animation: ctaParticle 2s ease-out forwards;
          `;

          particle.style.left = Math.random() * 100 + "%";
          particle.style.top = Math.random() * 100 + "%";

          const particleContainer = button.querySelector(".cta-particles");
          if (particleContainer) {
            particleContainer.appendChild(particle);

            setTimeout(() => {
              particle.remove();
            }, 2000);
          }
        };

        button.addEventListener("mouseenter", () => {
          const interval = setInterval(createCTAParticle, 100);
          button.addEventListener(
            "mouseleave",
            () => {
              clearInterval(interval);
            },
            { once: true },
          );
        });
      }
    });

    // Add CSS for ripple and particle animations
    const style = document.createElement("style");
    style.textContent = `
      @keyframes ripple {
        to {
          transform: scale(2);
          opacity: 0;
        }
      }
      
      @keyframes ctaParticle {
        0% {
          transform: scale(0) translateY(0);
          opacity: 1;
        }
        100% {
          transform: scale(1) translateY(-20px);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
  }

  // Responsive Effect Adjustments
  setupResponsiveEffects() {
    const mediaQuery = window.matchMedia("(max-width: 768px)");

    const handleResponsiveChanges = (e) => {
      if (e.matches) {
        // Mobile optimizations
        this.reducedMotionForMobile();
      } else {
        // Desktop optimizations
        this.fullMotionForDesktop();
      }
    };

    mediaQuery.addListener(handleResponsiveChanges);
    handleResponsiveChanges(mediaQuery);
  }

  reducedMotionForMobile() {
    // Reduce animations for better mobile performance
    const style = document.createElement("style");
    style.id = "mobile-optimizations";
    style.textContent = `
      @media (max-width: 768px) {
        .particle {
          display: none;
        }
        
        .hero-orb {
          animation-duration: 30s;
        }
        
        .floating-shapes .shape {
          animation-duration: 20s;
        }
      }
    `;
    document.head.appendChild(style);
  }

  fullMotionForDesktop() {
    // Remove mobile optimizations
    const mobileStyles = document.getElementById("mobile-optimizations");
    if (mobileStyles) {
      mobileStyles.remove();
    }
  }

  // Advanced Intersection Observer for Performance
  setupAdvancedObserver() {
    if ("IntersectionObserver" in window) {
      const lazyElements = document.querySelectorAll(".lazy-animate");

      const lazyObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("animate");
              lazyObserver.unobserve(entry.target);
            }
          });
        },
        {
          rootMargin: "50px",
        },
      );

      lazyElements.forEach((element) => {
        lazyObserver.observe(element);
      });
    }
  }
}

// Initialize the modern homepage when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new ModernHomepage();
});

// Preload critical resources
document.addEventListener("DOMContentLoaded", () => {
  // Preload hero images and critical assets
  const preloadImages = ["Images/Logo.png"];

  preloadImages.forEach((src) => {
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "image";
    link.href = src;
    document.head.appendChild(link);
  });
});

// Performance monitoring
if ("performance" in window) {
  window.addEventListener("load", () => {
    const loadTime =
      performance.timing.loadEventEnd - performance.timing.navigationStart;
    console.log(`Page load time: ${loadTime}ms`);

    // Track Core Web Vitals
    if ("PerformanceObserver" in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === "largest-contentful-paint") {
            console.log("LCP:", entry.startTime);
          }
        }
      });

      observer.observe({ entryTypes: ["largest-contentful-paint"] });
    }
  });
}

// Service Worker for Performance (if available)
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    // Register service worker for caching (would need separate SW file)
    // navigator.serviceWorker.register('/sw.js');
  });
}
