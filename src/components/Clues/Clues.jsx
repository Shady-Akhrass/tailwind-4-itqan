import React, { useState, useEffect } from 'react';
import { apiClient } from '../../api/queries';
import { Link } from 'react-router-dom';
import { Facebook, Home, ChevronLeft } from 'lucide-react';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';

const CluesSkeleton = () => (
  <div className="animate-pulse">
    <div className="h-8 w-48 bg-gray-200 rounded mb-8 mx-auto" /> {/* Title skeleton */}
    {[1].map((item) => (
      <div key={item} className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
        <div className="w-full h-[800px] bg-gray-200" />
      </div>
    ))}
  </div>
);

const Clue = () => {
  const [clues, setClues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    apiClient.get('/clues/API')
      .then(response => {
        // Handle the nested structure of the response
        const clueData = response.data.clues || [];
        setClues(clueData);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching clues:', error);
        setError('Failed to load clues');
        setLoading(false);
      });
  }, []);

  if (loading) return (
    <div className="min-h-screen py-24 px-4 sm:px-6 lg:px-8">
      {/* Navigation Path */}
      <div className="max-w-7xl mx-auto mb-6" dir="rtl">
        <nav className="flex items-center text-gray-600 text-sm">
          <Link to="/" className="flex items-center hover:text-green-600">
            <Home className="w-4 h-4 ml-1" />
            الرئيسية
          </Link>
          <ChevronLeft className="w-4 h-4 mx-2" />
          <span className="text-green-600">
            أدلة الدار
          </span>
        </nav>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Facebook Section */}
        <div className="lg:col-span-1 order-2 lg:order-1">
          <div className="sticky top-4">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="h-6 w-24 bg-gray-200 rounded animate-pulse" />
                  <Facebook className="w-5 h-5 text-gray-200" />
                </div>
              </div>
              <div className="p-4">
                <div className="h-[500px] bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          </div>
        </div>

        {/* Clues Content Skeleton */}
        <div className="lg:col-span-3 order-1 lg:order-2">
          <CluesSkeleton />
        </div>
      </div>
    </div>
  );

  if (error) return <div>{error}</div>;
  if (!clues?.length) return <div>No clues found</div>;

  return (
    <div className="min-h-screen py-24 px-4 sm:px-6 lg:px-8">
      {/* Navigation Path */}
      <div className="max-w-7xl mx-auto mb-6" dir="rtl">
        <nav className="flex items-center text-gray-600 text-sm">
          <Link to="/" className="flex items-center hover:text-green-600">
            <Home className="w-4 h-4 ml-1" />
            الرئيسية
          </Link>
          <ChevronLeft className="w-4 h-4 mx-2" />
          <span className="text-green-600">
            أدلة الدار
          </span>
        </nav>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Facebook Section */}
        <div className="lg:col-span-1 order-2 lg:order-1">
          <div className="sticky top-4">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-gray-900">آخر المنشورات</h2>
                  <Facebook className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <div className="p-4">
                <div
                  className="fb-page"
                  data-href="https://www.facebook.com/dar.etqan.gaza"
                  data-tabs="timeline"
                  data-width="450"
                  data-height="500"
                  data-small-header="true"
                  data-adapt-container-width="true"
                  data-hide-cover="false"
                  data-show-facepile="false"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Clues Content */}
        <div className="lg:col-span-3 order-1 lg:order-2">
          <h2 className="text-3xl font-bold mb-8 text-center">أدلة الدار</h2>
          {clues.map(clue => (
            <div key={clue.id} className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
              {clue.pdf && (
                <iframe
                  src={`https://api.ditq.org/storage/${clue.pdf}`}
                  className="w-full h-[800px]"
                  title={`Clue PDF ${clue.id}`}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Clue;
