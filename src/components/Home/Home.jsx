import React, { Suspense, useEffect } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { useQueryClient } from '@tanstack/react-query';
import { useIncrementVisitors } from '../../api/queries';

// Eagerly load only the most critical components
import SliderSection from './SliderSection';
import NewsSection from './NewsSection';
import { DribbbleIcon } from 'lucide-react';

// Dynamically import other sections with preload hints
const MessageSection = React.lazy(() => import('./MessageSection'));
const YouTubeSection = React.lazy(() => import('./YouTubeSection'));
const GeniusesSection = React.lazy(() => import('./GeniusesSection'));
const ProjectsSection = React.lazy(() => import('./ProjectsSection'));
const SoundSection = React.lazy(() => import('./SoundSection'));
const AchievementsSection = React.lazy(() => import('./AchievementsSection'));

// Optimized section wrapper with content-visibility and will-change
const SectionWrapper = ({ children, priority = 'low', id }) => (
  <section
    id={id}
    className="section-wrapper w-full relative min-h-[500px]"
    style={{
      contentVisibility: priority === 'low' ? 'auto' : 'visible',
      containIntrinsicSize: priority === 'low' ? '0 500px' : undefined,
      willChange: priority === 'high' ? 'transform, opacity' : 'auto'
    }}
  >
    {children}
  </section>
);

// Lightweight loader component
const SectionLoader = () => (
  <div className="w-full h-[500px] flex items-center justify-center bg-gray-50 dark:bg-gray-800"
    role="progressbar"
    aria-busy="true">
    <div className="w-8 h-8 border-4 border-green-500 dark:border-yellow-400 border-t-transparent rounded-full animate-spin" />
  </div>
);

const ErrorFallback = ({ error }) => (
  <div role="alert" className="text-center py-8 px-4 bg-red-50 dark:bg-red-900">
    <h2 className="text-lg font-semibold text-red-600 dark:text-red-400">Something went wrong</h2>
    <p className="text-sm text-gray-600 dark:text-gray-300">{error.message}</p>
  </div>
);

const Home = () => {
  const queryClient = useQueryClient();
  const { mutate: incrementVisitors } = useIncrementVisitors();

  // Increment visitor count on page load
  useEffect(() => {
    incrementVisitors();
  }, [incrementVisitors]);

  const sections = [
    { Component: NewsSection, id: 'news', priority: 'high', dir: 'rtl' },
    { Component: MessageSection, id: 'message', priority: 'high', dir: 'rtl' },
    { Component: YouTubeSection, id: 'youtube', priority: 'medium', dir: 'rtl' },
    { Component: AchievementsSection, id: 'achievements', priority: 'medium', dir: 'rtl' },
    { Component: GeniusesSection, id: 'geniuses', priority: 'low', dir: 'rtl' },
    { Component: ProjectsSection, id: 'projects', priority: 'low', dir: 'rtl' },
    { Component: SoundSection, id: 'sound', priority: 'low', dir: 'rtl' }
  ];

  // Prefetch critical data immediately
  useEffect(() => {
    const prefetchCriticalData = async () => {
      await Promise.all([
        queryClient.prefetchQuery(['news']),
        queryClient.prefetchQuery(['message'])
      ]);
    };
    prefetchCriticalData();
  }, [queryClient]);

  // Optimized intersection observer setup
  useEffect(() => {
    const observerCallback = (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const sectionId = entry.target.id;
          const section = sections.find(s => s.id === sectionId);

          if (section) {
            // Preload component when near viewport
            const component = section.Component;
            if (typeof component === 'function' && 'preload' in component) {
              component.preload();
            }

            // Also prefetch data if needed
            if (['achievements', 'geniuses'].includes(sectionId)) {
              queryClient.prefetchQuery([sectionId]);
            }

            // Stop observing after preloading
            observer.unobserve(entry.target);
          }
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, {
      rootMargin: '50px',
      threshold: 0.1
    });

    sections.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [sections, queryClient]);

  return (
    <div className="min-h-screen flex flex-col">
      <title>الصفحة الرئيسية - دار الإتقان</title>

      {/* Critical Meta Tags with preconnect */}
      <meta name="description" content="دار الإتقان لتعليم القرآن - مركز تعليمي رائد في قطاع غزة" />
      
      <link rel="preconnect" href="https://ditq.org" crossOrigin="anonymous" />
      <link rel="dns-prefetch" href="https://ditq.org" />
      <link rel="preconnect" href="https://api.ditq.org" crossOrigin="anonymous" />
      <meta name="theme-color" content="#ffffff" />

      <main className="flex-grow relative z-10" >
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          {/* Critical hero section with priority loading */}
          <SectionWrapper priority="high" dir='ltr'>
            <SliderSection />
          </SectionWrapper>

          {/* Progressive loading of other sections */}
          <div className="flex flex-col" dir='rtl' >
            {sections.map(({ Component, id, priority }) => (
              <div key={id} className="mb-8">
                <SectionWrapper priority={priority} id={id} >
                  <Suspense
                    fallback={<SectionLoader />}
                    unstable_expectedLoadTime={priority === 'high' ? 1000 : undefined}
                  >
                    <ErrorBoundary FallbackComponent={ErrorFallback}>
                      <Component />
                    </ErrorBoundary>
                  </Suspense>
                </SectionWrapper >
              </div>
            ))}
          </div>
        </ErrorBoundary>
      </main>
    </div>
  );
};

export default Home;