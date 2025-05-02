import React, { useState, useEffect } from 'react';
import { FaWhatsapp, FaArrowUp } from 'react-icons/fa';

const FloatingButtons = () => {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const whatsappNumber = '972592889891';
  const whatsappMessage = 'مرحباً، أود الاستفسار عن دوراتكم';

  return (
    <>
      <a
        href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed left-4 bottom-4 bg-green-400 hover:bg-green-500 text-white p-3 rounded-full shadow-lg transition-all duration-300 z-50"
      >
        <FaWhatsapp className="text-2xl" />
      </a>

      <button
        onClick={scrollToTop}
        className={`fixed right-4 bottom-4 bg-green-400 hover:bg-green-500 text-white p-3 rounded-full shadow-lg transition-all duration-300 z-50 ${showScrollTop ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
      >
        <FaArrowUp className="text-2xl" />
      </button>
    </>
  );
};

export default FloatingButtons;
