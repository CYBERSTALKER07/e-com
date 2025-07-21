import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShoppingBag, 
  Truck, 
  Shield, 
  CreditCard, 
  ArrowRight, 
  Star, 
  Users, 
  Gift, 
  Heart, 
  ShoppingCart,
  Award,
  Package,
  Target,
  Zap,
  Instagram,
  Facebook,
  Twitter,
  Play,
  Palette,
  CheckCircle,
  TrendingUp,
  Clock,
  Verified,
  Globe
} from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Layout from '../components/Layout/Layout';
import { getAllProducts, Product } from '../services/api/products';
import { useCart } from '../context/CartContext';
import LoadingSpinner from '../components/UI/LoadingSpinner';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

// Enhanced hero images with professional WebP support and proper aspect ratios
const heroImages = [
  {
    webp: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?ixlib=rb-4.0.3&auto=format&fit=crop&w=1400&q=90&fm=webp',
    jpg: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?ixlib=rb-4.0.3&auto=format&fit=crop&w=1400&q=90',
    alt: 'Luxury Fashion Collection - Premium Designer Wear',
    title: 'Spring Collection 2025'
  },
  {
    webp: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1400&q=90&fm=webp',
    jpg: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1400&q=90',
    alt: 'Designer Accessories - Handcrafted Excellence',
    title: 'Artisan Collection'
  },
  {
    webp: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1400&q=90&fm=webp',
    jpg: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1400&q=90',
    alt: 'Premium Handbags - Timeless Elegance',
    title: 'Signature Series'
  },
];

// Enhanced hero features with better UX copy and professional colors
const heroFeatures = [
  { 
    icon: Verified, 
    text: '98% Customer Satisfaction', 
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200'
  },
  { 
    icon: Shield, 
    text: 'Secure & Verified', 
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200'
  },
  { 
    icon: Globe, 
    text: 'Worldwide Shipping', 
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200'
  }
];

// Enhanced categories with professional structure and your colors
const categories = [
  {
    id: 'luxury-handbags',
    name: 'Luxury Handbags',
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    count: '250+',
    color: 'from-rose-400 via-pink-500 to-fuchsia-600',
    description: 'Premium designer collections',
    badge: 'Trending',
    badgeColor: 'bg-rose-500'
  },
  {
    id: 'fashion-accessories',
    name: 'Fashion Accessories',
    image: 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    count: '180+',
    color: 'from-blue-400 via-indigo-500 to-purple-600',
    description: 'Curated style essentials',
    badge: 'Popular',
    badgeColor: 'bg-indigo-500'
  },
  {
    id: 'designer-wallets',
    name: 'Designer Wallets',
    image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    count: '120+',
    color: 'from-emerald-400 via-green-500 to-teal-600',
    description: 'Crafted with precision',
    badge: 'Premium',
    badgeColor: 'bg-emerald-500'
  },
  {
    id: 'premium-jewelry',
    name: 'Premium Jewelry',
    image: 'https://images.unsplash.com/photo-1617375407336-08783a50797d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    count: '90+',
    color: 'from-purple-400 via-violet-500 to-indigo-600',
    description: 'Timeless elegance',
    badge: 'Luxury',
    badgeColor: 'bg-violet-500'
  }
];

const processSteps = [
  {
    icon: Target,
    title: 'Curated Selection',
    description: 'Hand-picked items from top designers and emerging talents worldwide',
    color: 'from-blue-500 to-indigo-600'
  },
  {
    icon: Palette,
    title: 'Quality Assurance',
    description: 'Rigorous quality control ensuring every product meets our high standards',
    color: 'from-purple-500 to-pink-600'
  },
  {
    icon: Package,
    title: 'Premium Packaging',
    description: 'Luxurious packaging that makes every delivery feel like a special gift',
    color: 'from-green-500 to-emerald-600'
  },
  {
    icon: Zap,
    title: 'Express Delivery',
    description: 'Swift and secure shipping to bring your fashion dreams to your doorstep',
    color: 'from-yellow-500 to-orange-600'
  }
];

const awards = [
  { name: 'Best E-commerce Platform 2024', organization: 'Fashion Tech Awards', year: '2024' },
  { name: 'Customer Excellence Award', organization: 'Retail Innovation Summit', year: '2024' },
  { name: 'Sustainable Fashion Leader', organization: 'Green Commerce Council', year: '2023' },
  { name: 'Digital Innovation Award', organization: 'Tech Fashion Week', year: '2023' }
];

const testimonials = [
  {
    id: 1,
    name: 'Sarah Johnson',
    role: 'Fashion Blogger',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
    content: 'Absolutely love the quality and unique designs. Every purchase has exceeded my expectations!',
    rating: 5
  },
  {
    id: 2,
    name: 'Michael Chen',
    role: 'Business Executive',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
    content: 'Professional service and premium products. The perfect blend of style and functionality.',
    rating: 5
  },
  {
    id: 3,
    name: 'Emma Williams',
    role: 'Interior Designer',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
    content: 'The attention to detail is remarkable. Each piece tells a story of craftsmanship.',
    rating: 5
  }
];

const HomePage: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentHeroImage, setCurrentHeroImage] = useState(0);
  const [isHeroImageLoaded, setIsHeroImageLoaded] = useState(false);
  const { addToCart } = useCart();

  // Performance optimization: Memoized refs
  const heroRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const categoriesRef = useRef<HTMLDivElement>(null);
  const brandStoryRef = useRef<HTMLDivElement>(null);
  const processRef = useRef<HTMLDivElement>(null);
  const productsRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLDivElement>(null);
  const awardsRef = useRef<HTMLDivElement>(null);
  const socialProofRef = useRef<HTMLDivElement>(null);
  const testimonialsRef = useRef<HTMLDivElement>(null);
  const communityRef = useRef<HTMLDivElement>(null);
  const newsletterRef = useRef<HTMLDivElement>(null);

  // Optimized product fetching with error handling
  const fetchProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      const products = await getAllProducts();
      
      // Enhanced data processing - removed rating sorting since rating doesn't exist on Product type
      const featuredProducts = products
        .filter(p => p.stock_quantity > 0)
        .slice(0, 8);
      
      const newArrivals = products
        .filter(p => p.stock_quantity > 0)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 6);

      setFeaturedProducts(featuredProducts);
      setNewArrivals(newArrivals);
    } catch (error) {
      console.error('Error fetching products:', error);
      // Implement proper error handling/toast notifications
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Enhanced hero image rotation with preloading - REMOVED SWITCHING
  useEffect(() => {
    // Preload images for better performance
    heroImages.forEach(image => {
      const img = new Image();
      img.src = image.jpg;
    });
  }, []);

  // Optimized GSAP animations with performance considerations
  useEffect(() => {
    if (isLoading) return;

    const ctx = gsap.context(() => {
      // Hero entrance animation with enhanced timing
      const heroContent = heroRef.current?.querySelector('.hero-content');
      if (heroContent) {
        const elements = {
          badge: heroContent.querySelector('.hero-badge'),
          title: heroContent.querySelector('h1'),
          subtitle: heroContent.querySelector('.hero-subtitle'),
          features: heroContent.querySelector('.hero-features'),
          buttons: heroContent.querySelector('.hero-buttons'),
          stats: heroContent.querySelector('.hero-stats')
        };

        const tl = gsap.timeline();
        
        // Staggered entrance animation
        Object.values(elements).forEach((element, index) => {
          if (element) {
            tl.fromTo(element, {
              opacity: 0,
              y: 60,
              scale: 0.95,
            }, {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 0.8,
              ease: 'power3.out',
            }, index * 0.15);
          }
        });
      }

      // Enhanced hero image animation
      const heroImageContainer = heroRef.current?.querySelector('.hero-image-container');
      if (heroImageContainer) {
        gsap.fromTo(heroImageContainer, {
          opacity: 0,
          scale: 0.9,
          rotation: -5,
        }, {
          opacity: 1,
          scale: 1,
          rotation: 0,
          duration: 1.2,
          ease: 'power3.out',
          delay: 0.3
        });
      }

      // Performance-optimized scroll animations
      const observerOptions = {
        rootMargin: '0px 0px -10% 0px',
        threshold: 0.1
      };

      // Categories animation with intersection observer
      const categoryCards = categoriesRef.current?.querySelectorAll('.category-card');
      if (categoryCards && categoryCards.length > 0) {
        gsap.fromTo(Array.from(categoryCards), {
          opacity: 0,
          y: 100,
          scale: 0.8,
        }, {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          ease: 'power2.out',
          stagger: 0.1,
          scrollTrigger: {
            trigger: categoriesRef.current,
            start: 'top 80%',
            end: 'bottom 20%',
            toggleActions: 'play none none reverse',
          },
        });

        // Enhanced hover effects
        categoryCards.forEach(card => {
          if (card instanceof HTMLElement) {
            card.addEventListener('mouseenter', () => {
              gsap.to(card, { 
                scale: 1.05, 
                y: -10,
                duration: 0.3, 
                ease: 'power2.out' 
              });
            });
            
            card.addEventListener('mouseleave', () => {
              gsap.to(card, { 
                scale: 1, 
                y: 0,
                duration: 0.3, 
                ease: 'power2.out' 
              });
            });
          }
        });
      }

      // Enhanced process steps animation
      const processCards = processRef.current?.querySelectorAll('.process-step');
      if (processCards && processCards.length > 0) {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: processRef.current,
            start: 'top 70%',
            end: 'bottom 30%',
            toggleActions: 'play none none reverse',
          }
        });

        Array.from(processCards).forEach((card, index) => {
          tl.fromTo(card, {
            opacity: 0,
            y: 80,
            rotationX: 45,
          }, {
            opacity: 1,
            y: 0,
            rotationX: 0,
            duration: 0.8,
            ease: 'back.out(1.7)',
          }, index * 0.15);
        });
      }

      // Video Section with reveal animation
      const videoSection = videoRef.current;
      if (videoSection) {
        const videoContainer = videoSection.querySelector('.video-container');
        if (videoContainer) {
          gsap.fromTo(videoContainer, {
            scale: 0.8,
            opacity: 0,
            rotationX: -15,
          }, {
            scale: 1,
            opacity: 1,
            rotationX: 0,
            duration: 1.5,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: videoSection,
              start: 'top 70%',
              toggleActions: 'play reverse play reverse',
            },
          });
        }
      }

      // Awards Section with bounce effect
      const awardItems = awardsRef.current?.querySelectorAll('.award-item');
      if (awardItems && awardItems.length > 0) {
        gsap.fromTo(Array.from(awardItems), {
          opacity: 0,
          y: 100,
          scale: 0.5,
        }, {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          ease: 'bounce.out',
          stagger: 0.15,
          scrollTrigger: {
            trigger: awardsRef.current,
            start: 'top 80%',
            toggleActions: 'play reverse play reverse',
          },
        });
      }

      // Social Proof with counter animation
      const countersElements = socialProofRef.current?.querySelectorAll('.counter-number');
      if (countersElements && countersElements.length > 0) {
        const counterValues = [15000, 5000, 98, 25];
        
        Array.from(countersElements).forEach((counter, index) => {
          if (counter instanceof HTMLElement) {
            const counterObj = { value: 0 };
            gsap.to(counterObj, {
              value: counterValues[index],
              duration: 2,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: socialProofRef.current,
                start: 'top 70%',
                toggleActions: 'play none none reverse',
              },
              onUpdate: function() {
                const value = Math.round(counterObj.value);
                counter.textContent = value.toLocaleString() + (index === 2 ? '%' : '+');
              }
            });
          }
        });
      }

      // Features Section with morphing icons
      const featureCards = featuresRef.current?.querySelectorAll('.feature-card');
      if (featureCards && featureCards.length > 0) {
        gsap.fromTo(Array.from(featureCards), {
          opacity: 0,
          y: 80,
          rotationX: 45,
          scale: 0.8,
        }, {
          opacity: 1,
          y: 0,
          rotationX: 0,
          scale: 1,
          duration: 1,
          ease: 'power2.out',
          stagger: 0.2,
          scrollTrigger: {
            trigger: featuresRef.current,
            start: 'top 80%',
            end: 'bottom 20%',
            toggleActions: 'play reverse play reverse',
            scrub: 1,
          },
        });

        // Add pulsing animation to icons
        featureCards.forEach(card => {
          const icon = card.querySelector('svg');
          if (icon) {
            gsap.to(icon, {
              scale: 1.1,
              duration: 2,
              repeat: -1,
              yoyo: true,
              ease: 'power2.inOut',
              delay: Math.random() * 2,
            });
          }
        });
      }

      // Products with 3D rotation effect
      const productCards = productsRef.current?.querySelectorAll('.product-card');
      if (productCards && productCards.length > 0) {
        gsap.fromTo(Array.from(productCards), {
          opacity: 0,
          rotationY: -90,
          z: -200,
          scale: 0.5,
        }, {
          opacity: 1,
          rotationY: 0,
          z: 0,
          scale: 1,
          duration: 1.2,
          ease: 'power3.out',
          stagger: 0.1,
          scrollTrigger: {
            trigger: productsRef.current,
            start: 'top 75%',
            end: 'bottom 25%',
            toggleActions: 'play reverse play reverse',
            scrub: 0.5,
          },
        });
      }

      // New Arrivals with wave effect
      const newArrivalCards = productsRef.current?.querySelectorAll('.new-arrival-card');
      if (newArrivalCards && newArrivalCards.length > 0) {
        gsap.fromTo(Array.from(newArrivalCards), {
          opacity: 0,
          x: -100,
          rotation: -15,
        }, {
          opacity: 1,
          x: 0,
          rotation: 0,
          duration: 1,
          ease: 'elastic.out(1, 0.5)',
          stagger: {
            amount: 0.8,
            from: 'start',
            ease: 'power2.inOut'
          },
          scrollTrigger: {
            trigger: productsRef.current?.querySelector('.new-arrivals-section'),
            start: 'top 70%',
            end: 'bottom 30%',
            toggleActions: 'play reverse play reverse',
            scrub: 1,
          },
        });
      }

      // Testimonials with slide effect
      const testimonialCards = testimonialsRef.current?.querySelectorAll('.testimonial-card');
      if (testimonialCards && testimonialCards.length > 0) {
        gsap.fromTo(Array.from(testimonialCards), {
          opacity: 0,
          x: 200,
          rotationX: 30,
        }, {
          opacity: 1,
          x: 0,
          rotationX: 0,
          duration: 1.2,
          ease: 'power3.out',
          stagger: 0.2,
          scrollTrigger: {
            trigger: testimonialsRef.current,
            start: 'top 80%',
            end: 'bottom 20%',
            toggleActions: 'play reverse play reverse',
            scrub: 0.8,
          },
        });
      }

      // Community Stats with magnetic attraction
      const communityStats = communityRef.current?.querySelectorAll('.community-stat');
      if (communityStats && communityStats.length > 0) {
        gsap.fromTo(Array.from(communityStats), {
          opacity: 0,
          scale: 0,
          rotation: 180,
        }, {
          opacity: 1,
          scale: 1,
          rotation: 0,
          duration: 1.5,
          ease: 'elastic.out(1, 0.3)',
          stagger: 0.2,
          scrollTrigger: {
            trigger: communityRef.current,
            start: 'top 70%',
            end: 'bottom 30%',
            toggleActions: 'play reverse play reverse',
            scrub: 1.2,
          },
        });
      }

      // Newsletter with bounce entry
      const newsletterContent = newsletterRef.current?.querySelector('.newsletter-content');
      if (newsletterContent) {
        gsap.fromTo(newsletterContent, {
          opacity: 0,
          y: 100,
          scale: 0.8,
          rotation: -5,
        }, {
          opacity: 1,
          y: 0,
          scale: 1,
          rotation: 0,
          duration: 1.5,
          ease: 'bounce.out',
          scrollTrigger: {
            trigger: newsletterRef.current,
            start: 'top 80%',
            end: 'bottom 20%',
            toggleActions: 'play reverse play reverse',
            scrub: 1,
          },
        });
      }

      // Parallax effects
      const heroBackgrounds = document.querySelectorAll('.hero-bg');
      if (heroBackgrounds.length > 0) {
        gsap.to(Array.from(heroBackgrounds), {
          yPercent: -50,
          ease: 'none',
          scrollTrigger: {
            trigger: heroRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        });
      }

      // Floating elements
      const floatingElements = document.querySelectorAll('.floating-element');
      if (floatingElements.length > 0) {
        gsap.to(Array.from(floatingElements), {
          y: -30,
          duration: 3,
          repeat: -1,
          yoyo: true,
          ease: 'power2.inOut',
          stagger: 0.5,
        });
      }

    });

    return () => ctx.revert();
  }, [isLoading]);

  // Memoized handlers for better performance
  const handleAddToCart = useCallback((product: Product) => {
    const cartProduct = {
      ...product,
      specifications: {},
    };
    addToCart(cartProduct, 1);
  }, [addToCart]);

  // Memoized components for better performance
  const heroSection = useMemo(() => (
    <section ref={heroRef} className="relative min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 overflow-hidden">
      {/* Enhanced Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/5 via-transparent to-purple-900/5" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgb(99 102 241 / 0.15) 1px, transparent 0)`,
          backgroundSize: '20px 20px'
        }}></div>
      </div>
      
      {/* Animated gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/5 via-transparent to-purple-900/5 animate-pulse"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center min-h-[80vh]">
          
          {/* Left Column - Enhanced Content */}
          <div className="hero-content order-2 lg:order-1 text-center lg:text-left space-y-6 lg:space-y-8">
            {/* Enhanced Badge - Mobile Friendly */}
            <div className="hero-badge inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 rounded-full bg-gradient-to-r from-indigo-100 via-purple-100 to-pink-100 border border-indigo-200/50 text-indigo-700 text-xs sm:text-sm font-semibold shadow-lg backdrop-blur-sm">
              <Zap className="h-3 w-3 sm:h-4 sm:w-4 mr-2 animate-pulse" />
              <span className="hidden sm:inline">New Collection 2025 • Limited Edition</span>
              <span className="sm:hidden">New Collection 2025</span>
            </div>

            {/* Enhanced Main Title */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-extrabold leading-tight">
              <span className="block bg-gradient-to-r from-gray-900 via-indigo-900 to-purple-900 bg-clip-text text-transparent">
                Discover Your
              </span>
              <span className="block bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Perfect Style
              </span>
            </h1>

            {/* Enhanced Subtitle */}
            <p className="hero-subtitle text-lg sm:text-xl lg:text-2xl text-gray-600 leading-relaxed max-w-2xl font-light">
              Experience fashion redefined. Curated collections from world-renowned designers, 
              delivered with <span className="font-semibold text-indigo-600">premium service</span> and 
              <span className="font-semibold text-purple-600"> unmatched quality</span>.
            </p>

            {/* Enhanced Features List - Mobile Responsive */}
            <div className="hero-features flex flex-wrap justify-center lg:justify-start gap-3 sm:gap-4 lg:gap-8">
              {heroFeatures.map((feature, index) => (
                <div key={index} className="flex items-center space-x-2 sm:space-x-3 bg-white/60 backdrop-blur-sm rounded-full px-3 sm:px-4 py-2 shadow-lg border border-white/20">
                  <feature.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${feature.color}`} />
                  <span className="text-xs sm:text-sm font-medium text-gray-700">{feature.text}</span>
                </div>
              ))}
            </div>

            {/* Enhanced CTA Buttons - Mobile First */}
            <div className="hero-buttons flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
              <Link
                to="/products"
                className="group relative inline-flex items-center justify-center px-8 sm:px-10 py-4 sm:py-5 text-base sm:text-lg font-semibold text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl overflow-hidden transition-all duration-500 transform hover:scale-105 shadow-2xl hover:shadow-indigo-500/25 w-full sm:w-auto"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-indigo-700 via-purple-700 to-pink-700 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
                <span className="relative flex items-center">
                  Shop Collection
                  <ArrowRight className="ml-2 sm:ml-3 h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform duration-300" />
                </span>
              </Link>
              
              <Link
                to="/gallery"
                className="group inline-flex items-center justify-center px-8 sm:px-10 py-4 sm:py-5 text-base sm:text-lg font-semibold text-gray-700 bg-white/80 backdrop-blur-sm border-2 border-gray-200 rounded-2xl hover:border-indigo-300 hover:text-indigo-700 hover:bg-white transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl w-full sm:w-auto"
              >
                <Play className="mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 group-hover:scale-110 transition-transform duration-300" />
                <span className="hidden sm:inline">Watch Our Story</span>
                <span className="sm:hidden">Our Story</span>
              </Link>
            </div>

            {/* Enhanced Stats - Mobile Grid */}
            <div className="hero-stats grid grid-cols-3 gap-4 sm:flex sm:justify-center lg:justify-start sm:space-x-12 pt-4">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">50K+</div>
                <div className="text-xs sm:text-sm font-medium text-gray-600">Happy Customers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">5K+</div>
                <div className="text-xs sm:text-sm font-medium text-gray-600">Premium Products</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-pink-600 to-indigo-600 bg-clip-text text-transparent">98%</div>
                <div className="text-xs sm:text-sm font-medium text-gray-600">Satisfaction Rate</div>
              </div>
            </div>
          </div>

          {/* Right Column - Floating Images */}
          <div className="order-1 lg:order-2 relative">
            <div className="hero-image-container relative h-96 lg:h-[600px]">
              {/* Floating Images with more space */}
              {heroImages.map((image, index) => (
                <div
                  key={index}
                  className={`absolute floating-image-${index} transition-all duration-1000 ease-in-out transform hover:scale-110 hover:z-30 cursor-pointer group`}
                  style={{
                    transform: `translate(${
                      index === 0 ? '-10%, -5%' : 
                      index === 1 ? '100%, -10%' : 
                      '25%, 75%'
                    }) rotate(${
                      index === 0 ? '-8deg' : 
                      index === 1 ? '12deg' : 
                      '-4deg'
                    })`,
                    zIndex: 10 + index
                  }}
                >
                  <div className="relative w-44 h-56 lg:w-52 lg:h-64 rounded-2xl overflow-hidden shadow-2xl border-4 border-white group-hover:shadow-3xl transition-all duration-500">
                    <picture>
                      <source srcSet={image.webp} type="image/webp" />
                      <img
                        src={image.jpg}
                        alt={image.alt}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        loading={index === 0 ? "eager" : "lazy"}
                      />
                    </picture>
                    
                    {/* Image overlay with gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    {/* Image title overlay */}
                    <div className="absolute bottom-4 left-4 right-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                      <h3 className="text-white font-semibold text-sm drop-shadow-lg">
                        {image.title}
                      </h3>
                    </div>

                    {/* Floating heart icon */}
                    <div className="absolute top-3 right-3 w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <Heart className="h-4 w-4 text-white" />
                    </div>
                  </div>

                  {/* Small decorative elements around each image */}
                  <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full blur-sm ${
                    index === 0 ? 'bg-gradient-to-br from-yellow-400/60 to-orange-500/60' :
                    index === 1 ? 'bg-gradient-to-br from-pink-400/60 to-red-500/60' :
                    'bg-gradient-to-br from-cyan-400/60 to-blue-500/60'
                  }`}></div>
                </div>
              ))}

              {/* Quality badge */}
              {/* <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg z-30">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium text-gray-900">Premium Quality</span>
                </div>
              </div> */}

              {/* Trending indicator */}
              <div className="absolute bottom-4 right-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full px-3 py-1 text-sm font-medium shadow-lg z-30">
                <div className="flex items-center space-x-1">
                  <TrendingUp className="h-3 w-3" />
                  <span>Trending</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-gray-400 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  ), [currentHeroImage, isHeroImageLoaded]);

  return (
    <Layout>
      {heroSection}

      {/* Enhanced Categories Section */}
      <section ref={categoriesRef} className="py-16 sm:py-24 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6 bg-gradient-to-r from-gray-900 to-indigo-900 bg-clip-text text-transparent">
              Shop by Category
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
              Explore our carefully curated collections designed for the modern fashion enthusiast
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {categories.map((category, index) => (
              <div key={category.name} className="category-card group relative cursor-pointer">
                <div className="relative rounded-3xl overflow-hidden shadow-xl bg-white">
                  <div className="aspect-[4/5] overflow-hidden">
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      loading="lazy"
                    />
                    <div className={`absolute inset-0 bg-gradient-to-t ${category.color} opacity-60`}></div>
                  </div>
                  
                  <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-6 text-white">
                    <h3 className="text-lg sm:text-2xl font-bold mb-2">{category.name}</h3>
                    <p className="text-white/90 text-xs sm:text-sm mb-2">{category.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-white/80 text-xs sm:text-sm">{category.count}</span>
                      <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300"></div>
                </div>

                {/* Category badge */}
                <div className={`absolute top-3 sm:top-4 left-3 sm:left-4 rounded-full px-2 sm:px-3 py-1 text-xs font-semibold text-white ${category.badgeColor}`}>
                  {category.badge}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section ref={productsRef} className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">Featured Products</h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
              Discover our handpicked selection of premium fashion items
            </p>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
              {featuredProducts.slice(0, 8).map((product, index) => (
                <div key={product.id} className="product-card group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
                  <div className="relative aspect-[3/4] overflow-hidden">
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      loading="lazy"
                    />
                    <div className="absolute top-3 right-3">
                      <button className="w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors">
                        <Heart className="h-4 w-4 text-gray-600" />
                      </button>
                    </div>
                  </div>
                  <div className="p-4 sm:p-6">
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{product.name}</h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-lg sm:text-xl font-bold text-primary">${product.price}</span>
                      <button
                        onClick={() => handleAddToCart(product)}
                        className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm font-medium"
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link
              to="/products"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg font-semibold"
            >
              View All Products
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Enhanced Brand Story Section */}
      <section ref={brandStoryRef} className="py-24 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="brand-story-content">
              <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full text-indigo-700 text-sm font-medium mb-6">
                <Clock className="h-4 w-4 mr-2" />
                Our Journey
              </div>
              
              <h2 className="text-5xl font-bold text-gray-900 mb-8 leading-tight">
                Crafting Excellence Since 
                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"> 2020</span>
              </h2>
              
              <p className="text-xl text-gray-600 leading-relaxed mb-8">
                Born from a passion for exceptional craftsmanship and timeless design, Buyursin has been redefining 
                luxury fashion since our inception. Every piece in our collection tells a story of dedication, 
                artistry, and the relentless pursuit of perfection.
              </p>
              
              <div className="grid grid-cols-2 gap-8 mb-8">
                <div className="text-center p-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl">
                  <div className="text-4xl font-bold text-indigo-600 mb-2">500+</div>
                  <div className="text-gray-600 font-medium">Artisan Partners</div>
                </div>
                <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl">
                  <div className="text-4xl font-bold text-purple-600 mb-2">25+</div>
                  <div className="text-gray-600 font-medium">Countries Served</div>
                </div>
              </div>
              
              <Link
                to="/about"
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg font-semibold"
              >
                Discover Our Story
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
            
            <div className="brand-image relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                  alt="Craftsmanship"
                  className="w-full h-96 object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-900/20 to-transparent" />
              </div>
              
              <div className="absolute -top-8 -right-8 w-24 h-24 bg-gradient-to-br from-yellow-400/30 to-orange-500/30 rounded-full blur-xl"></div>
              <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-br from-pink-400/30 to-red-500/30 rounded-full blur-lg"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Process Steps Section */}
      <section ref={processRef} className="py-24 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-gray-900 mb-6">How We Create Magic</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              From concept to delivery, every step is designed to exceed your expectations and deliver excellence
            </p>
          </div>
          
          <div className="relative">
            {/* Enhanced connecting line */}
            <div className="hidden lg:block absolute top-1/2 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transform -translate-y-1/2 z-0 rounded-full shadow-lg"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
              {processSteps.map((step, index) => (
                <div key={step.title} className="process-step text-center group">
                  <div className="relative mb-6">
                    <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto shadow-2xl border-4 border-white group-hover:border-indigo-200 transition-colors duration-300">
                      <div className={`w-16 h-16 bg-gradient-to-br ${step.color} rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                        <step.icon className="h-8 w-8 text-white" />
                      </div>
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                      {index + 1}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-indigo-600 transition-colors duration-300">{step.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Video Showcase Section */}
      <section ref={videoRef} className="py-24 bg-gray-900 text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">Experience Our Craftsmanship</h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Watch how our artisans create masterpieces that define luxury and elegance
            </p>
          </div>
          
          <div className="video-container relative max-w-4xl mx-auto">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl aspect-video bg-gradient-to-br from-primary/20 to-purple-600/20 backdrop-blur-sm">
              <img
                src="https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
                alt="Craftsmanship Video"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <button className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-300 transform hover:scale-110">
                  <Play className="h-8 w-8 text-white ml-1" />
                </button>
              </div>
            </div>
            
            <div className="floating-element absolute -top-8 -left-8 w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full opacity-70" />
            <div className="floating-element absolute -bottom-6 -right-6 w-12 h-12 bg-gradient-to-br from-pink-400 to-red-500 rounded-full opacity-80" />
          </div>
        </div>
      </section>

      {/* Awards & Certifications */}
      <section ref={awardsRef} className="py-24 bg-gradient-to-br from-yellow-50 via-white to-orange-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Recognition & Awards</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our commitment to excellence has been recognized by industry leaders worldwide
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {awards.map((award, index) => (
              <div key={award.name} className="award-item bg-white p-6 rounded-2xl shadow-lg text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{award.name}</h3>
                <p className="text-sm text-gray-600">{award.organization}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section ref={socialProofRef} className="py-24 bg-primary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">Trusted by Thousands</h2>
            <p className="text-xl text-primary-light max-w-2xl mx-auto">
              Join our community of fashion enthusiasts who trust us for premium quality
            </p>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-5xl font-bold mb-2 counter-number">0</div>
              <div className="text-primary-light">Happy Customers</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold mb-2 counter-number">0</div>
              <div className="text-primary-light">Premium Products</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold mb-2 counter-number">0</div>
              <div className="text-primary-light">Satisfaction Rate</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold mb-2 counter-number">0</div>
              <div className="text-primary-light">Industry Awards</div>
            </div>
          </div>
          
          <div className="mt-16 flex justify-center space-x-8">
            <a href="#" className="text-primary-light hover:text-white transition-colors transform hover:scale-110">
              <Instagram className="h-8 w-8" />
            </a>
            <a href="#" className="text-primary-light hover:text-white transition-colors transform hover:scale-110">
              <Facebook className="h-8 w-8" />
            </a>
            <a href="#" className="text-primary-light hover:text-white transition-colors transform hover:scale-110">
              <Twitter className="h-8 w-8" />
            </a>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section ref={testimonialsRef} className="py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">What Our Customers Say</h2>
            <p className="text-xl text-gray-600">Read testimonials from our satisfied customers</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <div key={testimonial.id} className="testimonial-card bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
                <div className="flex items-center mb-4">
                  <div className="flex text-primary">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-current" />
                    ))}
                  </div>
                </div>
                <p className="text-gray-600 mb-6 text-lg">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                  <div className="ml-4">
                    <h4 className="font-medium text-gray-900">{testimonial.name}</h4>
                    <p className="text-gray-500 text-sm">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Community Section */}
      <section ref={communityRef} className="py-24 bg-gradient-to-br from-primary/5 to-purple-100/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Join Our Community</h2>
            <p className="text-xl text-gray-600">Be part of our growing fashion community</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="community-stat text-center">
              <div className="bg-gradient-to-br from-primary/20 to-purple-200/50 p-8 rounded-full w-32 h-32 mx-auto mb-6 flex items-center justify-center shadow-lg">
                <Users className="h-16 w-16 text-primary" />
              </div>
              <h3 className="text-3xl font-bold mb-4 text-primary">10K+</h3>
              <p className="text-gray-600 text-lg">Active Members</p>
            </div>
            <div className="community-stat text-center">
              <div className="bg-gradient-to-br from-primary/20 to-purple-200/50 p-8 rounded-full w-32 h-32 mx-auto mb-6 flex items-center justify-center shadow-lg">
                <Star className="h-16 w-16 text-primary" />
              </div>
              <h3 className="text-3xl font-bold mb-4 text-primary">4.8/5</h3>
              <p className="text-gray-600 text-lg">Customer Rating</p>
            </div>
            <div className="community-stat text-center">
              <div className="bg-gradient-to-br from-primary/20 to-purple-200/50 p-8 rounded-full w-32 h-32 mx-auto mb-6 flex items-center justify-center shadow-lg">
                <Gift className="h-16 w-16 text-primary" />
              </div>
              <h3 className="text-3xl font-bold mb-4 text-primary">15K+</h3>
              <p className="text-gray-600 text-lg">Products Delivered</p>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section ref={newsletterRef} className="py-24 bg-gradient-to-r from-primary to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="newsletter-content max-w-3xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-white mb-8">Stay Updated</h2>
            <p className="text-xl text-white/90 mb-8">
              Subscribe to our newsletter to receive updates about new products, special offers, and fashion tips.
            </p>
            <form className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-6 py-4 rounded-full border-0 focus:outline-none focus:ring-2 focus:ring-white/50 text-gray-900"
              />
              <button
                type="submit"
                className="px-8 py-4 bg-white text-primary rounded-full hover:bg-gray-100 transition-all duration-300 font-semibold transform hover:scale-105"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default HomePage;