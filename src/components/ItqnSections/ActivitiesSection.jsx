// import React, { useEffect, useState } from 'react';
// import { apiClient } from '../../api/queries';
// import { Link } from 'react-router-dom';
// import { Carousel } from 'react-responsive-carousel';
// import { Facebook, Home, ChevronLeft } from 'lucide-react';
// import 'react-responsive-carousel/lib/styles/carousel.min.css';
// import SectionSkeleton from '../Skeleton/SectionSkeleton';
// import { checkApiUrl } from '../../hooks/checkApiUrl';
// const carouselStyles = `
//   .carousel .control-dots .dot {
//     background: #22c55e !important;
//     box-shadow: none !important;
//     width: 10px !important;
//     height: 10px !important;
//   }
//   .carousel .control-dots .dot.selected {
//     background: #16a34a !important;
//   }
//   .carousel .slide {
//     transition: opacity 0.5s ease-in-out !important;
//   }
// `;

// const ActivitiesSection = () => {
//     const [activities, setActivities] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);

//     useEffect(() => {
//         apiClient.get('/activity/API')
//             .then(response => {
//                 const activitiesData = Array.isArray(response.data) ? response.data : [response.data];
//                 setActivities(activitiesData);
//                 setLoading(false);
//             })
//             .catch(error => {
//                 console.error('There was an error fetching the activities!', error);
//                 setError('Failed to load activities');
//                 setLoading(false);
//             });
//         if (window.FB) {
//             window.FB.XFBML.parse();
//         } else {
//             const script = document.createElement('script');
//             script.src = "https://connect.facebook.net/ar_AR/sdk.js#xfbml=1&version=v18.0";
//             script.async = true;
//             script.defer = true;
//             script.crossOrigin = "anonymous";
//             document.body.appendChild(script);
//         }
//     }, []);

//     const getMetaDescription = () => {
//         if (activities?.length > 0 && activities[0]?.activities?.[0]?.about) {
//             return activities[0].activities[0].about.substring(0, 160) + '...';
//         }
//         return "قسم الأنشطة والمسابقات في دار الإتقان - فعاليات وأنشطة متنوعة";
//     };

//     if (loading) return <SectionSkeleton />;
//     if (error) return <div>{error}</div>;
//     if (!activities?.length) return <div>No activities found</div>;

//     const metaDescription = getMetaDescription();

//     return (
//         <div className="min-h-screen py-24 px-4 sm:px-6 lg:px-8">
//             <title>قسم الأنشطة والمسابقات - دار الإتقان</title>
//             <meta name="description" content="قسم الأنشطة والمسابقات في دار الإتقان" />
//             <meta name="keywords" content="أنشطة, دار الإتقان, فعاليات, مسابقات" />
//             <meta property="og:title" content="قسم الأنشطة والمسابقات - دار الإتقان" />
//             <meta property="og:description" content="قسم الأنشطة والمسابقات في دار الإتقان" />
//             {activities?.[0]?.activity_images?.[0]?.image && (
//                 <meta property="og:image" content={`https://api.ditq.org/storage/${activities[0].activity_images[0].image}`} />
//             )}
//             <style>{carouselStyles}</style>

//             {/* Navigation Path */}
//             <div className="max-w-7xl mx-auto mb-6" dir="rtl">
//                 <nav className="flex items-center text-gray-600 text-sm">
//                     <Link to="/" className="flex items-center hover:text-green-600">
//                         <Home className="w-4 h-4 ml-1" />
//                         الرئيسية
//                     </Link>
//                     <ChevronLeft className="w-4 h-4 mx-2" />
//                     <span className="text-green-600">
//                         قسم الأنشطة والمسابقات
//                     </span>
//                 </nav>
//             </div>

//             <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
//                 {/* Facebook Section */}
//                 <div className="lg:col-span-1 order-2 lg:order-1">
//                     <div className="sticky top-4">
//                         <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
//                             <div className="p-4 border-b border-gray-100 dark:border-gray-700">
//                                 <div className="flex items-center justify-between">
//                                     <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">آخر المنشورات</h2>
//                                     <Facebook className="w-5 h-5 text-blue-600" />
//                                 </div>
//                             </div>
//                             <div className="p-4 bg-white overflow-hidden">
//                                 <div id="fb-root"></div>
//                                 <div
//                                     className="fb-page"
//                                     data-href="https://www.facebook.com/dar.etqan.gaza"
//                                     data-tabs="timeline"
//                                     data-width="450"
//                                     data-height="500"
//                                     data-small-header="true"
//                                     data-adapt-container-width="true"
//                                     data-hide-cover="false"
//                                     data-show-facepile="false"
//                                 ></div>
//                             </div>
//                         </div>
//                     </div>
//                 </div>

//                 {/* Activities Content */}
//                 <div className="lg:col-span-3 order-1 lg:order-2">
//                     <h2 className="text-3xl font-bold mb-8 text-center">قسم الأنشطة والمسابقات</h2>
//                     {activities.map(activity => (
//                         <div key={activity.id} className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
//                             {activity?.activities_images?.length > 0 && (
//                                 <Carousel
//                                     showThumbs={false}
//                                     showStatus={false}
//                                     infiniteLoop
//                                     useKeyboardArrows
//                                     autoPlay
//                                     interval={5000}
//                                     transitionTime={500}
//                                     stopOnHover
//                                     swipeable
//                                     emulateTouch
//                                     className="aspect-video"
//                                 >
//                                     {activity.activities_images.map(image => (
//                                         <div key={image.id} className="relative aspect-video">
//                                             <img
//                                                 src={checkApiUrl(`https://api.ditq.org/storage/${image.image}`)}
//                                                 alt="Activity"
//                                                 className="w-full h-full object-cover"
//                                             />
//                                         </div>
//                                     ))}
//                                 </Carousel>
//                             )}
//                             <div className="p-6">
//                                 <p className="text-gray-800 text-right leading-relaxed">
//                                     {activity?.activities?.[0]?.about || 'No description available'}
//                                 </p>
//                             </div>
//                         </div>
//                     ))}
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default ActivitiesSection;
