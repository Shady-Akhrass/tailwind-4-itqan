import React from 'react';
import { useLocation, Link } from 'react-router-dom';

const SearchResults = () => {
    const location = useLocation();
    const { results = [], query = '' } = location.state || {};

    return (
        <div>
            <title>نتائج البحث - {query}</title>
            <meta name="description" content={`نتائج البحث عن: ${query}`} />

            <section className="py-24 bg-gradient-to-b from-green-50 to-white min-h-screen" dir="rtl">
                <div className="container mx-auto px-4">
                    <h1 className="text-3xl font-bold mb-8">نتائج البحث عن: {query}</h1>

                    {results.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-xl text-gray-600">لم يتم العثور على نتائج</p>
                        </div>
                    ) : (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {results.map((item) => (
                                <Link
                                    to={item.url}
                                    key={item.id}
                                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                                >
                                    {item.image && (
                                        <img
                                            src={item.image}
                                            alt={item.title}
                                            className="w-full h-48 object-cover"
                                        />
                                    )}
                                    <div className="p-4">
                                        <h2 className="text-xl font-semibold mb-2">{item.title}</h2>
                                        <p className="text-gray-600 mb-4">{item.excerpt}</p>
                                        <div className="text-sm text-gray-500">{item.date}</div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default SearchResults;
