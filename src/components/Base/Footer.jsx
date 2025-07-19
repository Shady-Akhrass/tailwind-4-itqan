import React from 'react';

const Footer = () => {
  return (
    <footer
      className="bg-emerald-900 dark:bg-gray-900 text-emerald-100 dark:text-gray-100 w-full mt-auto border-t dark:border-yellow-500/20 min-h-[400px] h-auto"
      dir="rtl"
      style={{
        contain: 'content',
        height: 'auto'
      }}
    >
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8 flex flex-col h-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 flex-grow min-h-[200px]">
          {/* Company Info */}
          <div className="text-right flex flex-col min-h-[150px] flex-grow-0 flex-shrink-0 basis-auto">
            <h3 className="text-xl font-bold mb-4 font-arabic text-white">عن الدار</h3>
            <p className="text-sm text-emerald-200 dark:text-gray-300 line-clamp-4 overflow-hidden">
              دار الإتقان لتعليم القرآن هي مؤسسة تعليمية متخصصة في تعليم القرآن الكريم وعلومه، نسعى لتقديم أفضل الخدمات التعليمية لطلابنا.
            </p>
          </div>

          {/* Quick Links */}
          <div className="text-right flex flex-col min-h-[150px] flex-grow-0 flex-shrink-0 basis-auto">
            <h3 className="text-xl font-bold mb-4 font-arabic text-white">روابط سريعة</h3>
            <ul className="space-y-2">
              <li><a href="/" className="text-sm text-emerald-200 dark:text-gray-300 hover:text-white dark:hover:text-yellow-400 transition-colors">الرئيسية</a></li>
              <li><a href="/course" className="text-sm text-emerald-200 dark:text-gray-300 hover:text-white dark:hover:text-yellow-400 transition-colors">قسم الدورات والتجويد والأسانيد</a></li>
              <li><a href="/clues" className="text-sm text-emerald-200 dark:text-gray-300 hover:text-white dark:hover:text-yellow-400 transition-colors">أدلة الدار</a></li>
              <li><a href="/speech" className="text-sm text-emerald-200 dark:text-gray-300 hover:text-white dark:hover:text-yellow-400 transition-colors">كلمة رئيس الدار</a></li>
              <li><a href="/contact-us" className="text-sm text-emerald-200 dark:text-gray-300 hover:text-white dark:hover:text-yellow-400 transition-colors">تواصل معنا</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="text-right flex flex-col min-h-[150px] flex-grow-0 flex-shrink-0 basis-auto">
            <div className="contact-information mb-4">
              <h4 className="text-xl font-bold font-arabic text-white mb-2">معلومات التواصل</h4>
              <p className="phone text-sm text-emerald-200 dark:text-gray-300"> 59-288-9891 972+</p>
              <p className="email text-sm text-emerald-200 dark:text-gray-300">daretqan@gmail.com</p>
              <p className="location-in text-sm text-emerald-200 dark:text-gray-300">المقر - فلسطين - قطاع غزة</p>
            </div>
            <div className="social-buttons flex flex-row-reverse gap-4 mt-2">
              <a href="https://www.facebook.com/dar.etqan.gaza" target="_blank" rel="noopener noreferrer" className="social-button social-button--facebook text-emerald-200 dark:text-gray-300 hover:text-white dark:hover:text-yellow-400 transition-colors w-6 h-6 flex items-center justify-center" aria-label="Facebook">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="https://www.youtube.com/@user-pd4pk8ex4z" target="_blank" rel="noopener noreferrer" className="social-button social-button--youtube text-emerald-200 dark:text-gray-300 hover:text-white dark:hover:text-yellow-400 transition-colors w-6 h-6 flex items-center justify-center" aria-label="Youtube">
                <i className="fab fa-youtube"></i>
              </a>
              <a href="https://twitter.com/dar_etqan" target="_blank" rel="noopener noreferrer" className="social-button social-button--twitter text-emerald-200 dark:text-gray-300 hover:text-white dark:hover:text-yellow-400 transition-colors w-6 h-6 flex items-center justify-center" aria-label="Twitter">
                <i className="fab fa-twitter"></i>
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-emerald-800 dark:border-yellow-500/20 mt-8 pt-4 text-center text-sm text-emerald-200 dark:text-gray-300 min-h-[24px]">
          <p className="min-h-[24px]">جميع الحقوق محفوظة  لدار الإتقان لتعليم القرآن  {new Date().getFullYear()} © </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;