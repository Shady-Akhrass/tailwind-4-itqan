import React, { Suspense, useEffect } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

// Eagerly load the SliderSection as it's above the fold
import SliderSection from './SliderSection';

// Lazy load all other sections with proper error handling
const NewsSection = React.lazy(() =>
  import('./NewsSection')
    .then(module => ({ default: module.default }))
    .catch(error => {
      console.error('Error loading NewsSection:', error);
      return { default: () => <div>Failed to load news section</div> };
    })
);

const MessageSection = React.lazy(() =>
  import('./MessageSection')
    .then(module => ({ default: module.default }))
);

const YouTubeSection = React.lazy(() =>
  import('./YouTubeSection')
    .then(module => ({ default: module.default }))
);

const GeniusesSection = React.lazy(() => import('./GeniusesSection').catch(error => {
  console.error('Error loading GeniusesSection:', error);
  return { default: () => <div>Failed to load geniuses section</div> };
}));

const ProjectsSection = React.lazy(() =>
  import('./ProjectsSection')
    .then(module => ({ default: module.default }))
);

const SoundSection = React.lazy(() =>
  import('./SoundSection')
    .then(module => ({ default: module.default }))
);

const AchievementsSection = React.lazy(() =>
  import('./AchievementsSection')
    .then(module => ({ default: module.default }))
);

const OurProjectsSection = React.lazy(() =>
  import('./OurProjectsSection')
    .then(module => ({ default: module.default }))
);

// Section wrapper component
const SectionWrapper = ({ children, priority = 'low' }) => (
  <section
    className="section-wrapper w-full relative min-h-[500px]"
    style={{
      contentVisibility: priority === 'low' ? 'auto' : 'visible',
      containIntrinsicSize: priority === 'low' ? '0 500px' : undefined,
      height: 'auto',
      minHeight: '500px'
    }}
  >
    <div className="h-full w-full">
      {children}
    </div>
  </section>
);

// Improved loader component
const SectionLoader = () => (
  <div className="w-full h-[500px] flex items-center justify-center bg-gray-100 dark:bg-gray-800">
    <div className="w-8 h-8 border-4 border-green-500 dark:border-yellow-400 border-t-transparent rounded-full animate-spin" />
  </div>
);

// Error fallback component
const ErrorFallback = ({ error }) => (
  <div className="text-center py-8 px-4">
    <h2 className="text-lg font-semibold text-red-600">Something went wrong</h2>
    <p className="text-sm text-gray-600">{error.message}</p>
  </div>
);

// Main Home component
const Home = () => {
  // Define sections configuration
  const sections = [
    { Component: NewsSection, id: 'news', priority: 'high' },
    { Component: MessageSection, id: 'message', priority: 'high' },
    // { Component: OurProjectsSection, id: 'our-projects', priority: 'high' }, // Moved up and set to high priority
    { Component: YouTubeSection, id: 'youtube' },
    { Component: AchievementsSection, id: 'achievements' },
    { Component: GeniusesSection, id: 'geniuses' },
    { Component: ProjectsSection, id: 'projects' },
    { Component: SoundSection, id: 'sound' }
  ];

  // Get system dark mode preference
  const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const [isDarkMode, setIsDarkMode] = React.useState(prefersDarkMode);

  // Listen for system dark mode changes
  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => setIsDarkMode(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return (
    <div className="min-h-screen flex flex-col" >
      <title>الصفحة الرئيسية - دار الإتقان</title>
      <meta name="description" content="دار الإتقان لتعليم القرآن - مركز تعليمي رائد في  قطاع غزة لتعليم القرآن الكريم وعلومه" />
      <meta name="keywords" content=" تحفيظ القرآن،لتعليم القرآن الكريم وعلومه,دار الإتقان, تعليم, تدريب, غزة" />
      <meta property="og:title" content="الصفحة الرئيسية - دار الإتقان" />
      <meta property="og:description" content="دار الإتقان لتعليم القرآن - مركز تعليمي رائد في  قطاع غزة لتعليم القرآن الكريم وعلومه" />
      <meta name="description" content=" الصفحة الرئيسية لدار الإتقان - مركز قرآني رائد" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="preconnect" href="https://ditq.org" />
      <link rel="dns-prefetch" href="https://ditq.org" />
      <meta name="theme-color" content="#ffffff" />

      {/* Decorative elements container */}
      <div className="decorative-container" aria-hidden="true">
        <div className="decorative-blob-top" />
        <div className="decorative-blob-bottom" />
      </div>

      <main className="flex-grow relative z-10">
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          {/* Hero section - always visible */}
          <SectionWrapper priority="high">
            <SliderSection isDarkMode={isDarkMode} />
          </SectionWrapper>

          {/* Other sections */}
          <div className="flex flex-col">
            {sections.map(({ Component, id, priority }) => (
              <div key={id} className="mb-8">
                <SectionWrapper priority={priority}>
                  <Suspense fallback={<SectionLoader />}>
                    <ErrorBoundary FallbackComponent={ErrorFallback}>
                      <Component isDarkMode={isDarkMode} />
                    </ErrorBoundary>
                  </Suspense>
                </SectionWrapper>
              </div>
            ))}
          </div>
        </ErrorBoundary>
      </main>
    </div>
  );
};

export default Home;