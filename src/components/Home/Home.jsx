import React, { Suspense, useEffect } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { useQueryClient } from '@tanstack/react-query';

// Eagerly load critical components
import SliderSection from './SliderSection';
import NewsSection from './NewsSection';
import MessageSection from './MessageSection';

// Lazy load non-critical sections with prefetching
const YouTubeSection = React.lazy(() => import('./YouTubeSection'));
const GeniusesSection = React.lazy(() => import('./GeniusesSection'));
const ProjectsSection = React.lazy(() => import('./ProjectsSection'));
const SoundSection = React.lazy(() => import('./SoundSection'));
const AchievementsSection = React.lazy(() => import('./AchievementsSection'));
const OurProjectsSection = React.lazy(() => import('./OurProjectsSection'));

// Optimized section wrapper with content-visibility
const SectionWrapper = ({ children, priority = 'low', id }) => (
  <section
    id={id}
    className="section-wrapper w-full relative min-h-[500px]"
    style={{
      contentVisibility: priority === 'low' ? 'auto' : 'visible',
      containIntrinsicSize: priority === 'low' ? '0 500px' : undefined
    }}
  >
    {children}
  </section>
);

// Optimized loader with reduced layout shifts
const SectionLoader = () => (
  <div className="w-full h-[500px] flex items-center justify-center bg-gray-100 dark:bg-gray-800" aria-hidden="true">
    <div className="w-8 h-8 border-4 border-green-500 dark:border-yellow-400 border-t-transparent rounded-full animate-spin" />
  </div>
);

const ErrorFallback = ({ error }) => (
  <div role="alert" className="text-center py-8 px-4">
    <h2 className="text-lg font-semibold text-red-600">Something went wrong</h2>
    <p className="text-sm text-gray-600">{error.message}</p>
  </div>
);

const Home = () => {
  const queryClient = useQueryClient();
  const sections = [
    { Component: NewsSection, id: 'news', priority: 'high' },
    { Component: MessageSection, id: 'message', priority: 'high' },
    { Component: YouTubeSection, id: 'youtube' },
    { Component: AchievementsSection, id: 'achievements' },
    { Component: GeniusesSection, id: 'geniuses' },
    { Component: ProjectsSection, id: 'projects' },
    { Component: SoundSection, id: 'sound' }
  ];

  // Prefetch data for critical sections
  useEffect(() => {
    const prefetchCriticalData = async () => {
      await Promise.all([
        queryClient.prefetchQuery(['home']),
        queryClient.prefetchQuery(['news']),
        queryClient.prefetchQuery(['message'])
      ]);
    };
    prefetchCriticalData();
  }, [queryClient]);

  // Lazy prefetch non-critical sections
  useEffect(() => {
    const timer = setTimeout(() => {
      const prefetchNonCritical = async () => {
        await Promise.all([
          queryClient.prefetchQuery(['youtube']),
          queryClient.prefetchQuery(['achievements']),
          queryClient.prefetchQuery(['geniuses'])
        ]);
      };
      prefetchNonCritical();
    }, 3000);

    return () => clearTimeout(timer);
  }, [queryClient]);

  // Use IntersectionObserver for dynamic imports
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const sectionId = entry.target.id;
          // Dynamically import section when it comes into view
          import(`./sections/${sectionId}`).catch(console.error);
        }
      });
    }, { rootMargin: '50px' });

    sections.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <title>الصفحة الرئيسية - دار الإتقان</title>
      {/* Critical Meta Tags */}
      <meta name="description" content="دار الإتقان لتعليم القرآن - مركز تعليمي رائد في قطاع غزة" />
      <link rel="preconnect" href="https://ditq.org" />
      <link rel="dns-prefetch" href="https://ditq.org" />
      <meta name="theme-color" content="#ffffff" />

      <main className="flex-grow relative z-10">
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          {/* Critical sections rendered immediately */}
          <SectionWrapper priority="high">
            <SliderSection />
          </SectionWrapper>

          {/* Other sections with optimized loading */}
          <div className="flex flex-col">
            {sections.map(({ Component, id, priority }) => (
              <div key={id} className="mb-8">
                <SectionWrapper priority={priority} id={id}>
                  <Suspense fallback={<SectionLoader />}>
                    <ErrorBoundary FallbackComponent={ErrorFallback}>
                      <Component />
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