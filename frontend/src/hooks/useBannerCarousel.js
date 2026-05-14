import { useState, useEffect } from 'react';

const useBannerCarousel = (banners) => {
  const [bannerIndex, setBannerIndex] = useState(0);

  const slides = [];
  if (banners.length > 0) {
    banners.forEach((banner) => {
      slides.push(null);
      slides.push(banner);
    });
  } else {
    slides.push(null);
  }

  useEffect(() => {
    if (slides.length <= 1) return;
    const interval = setInterval(() => {
      setBannerIndex(prev => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

  return {
    current: slides[bannerIndex] || null,
    bannerIndex,
    setBannerIndex,
    slides,
  };
};

export default useBannerCarousel;
