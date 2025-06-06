import React from 'react';

const YouTubeSection = ({ formData, handleYouTubeChange, handleSectionSubmit, saving }) => {
    return (
        <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">المكتبة المرئية</h2>
            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        الفيديو الرئيسي
                    </label>
                    <input
                        type="text"
                        name="main"
                        value={formData.youtube.main}
                        onChange={handleYouTubeChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="رابط الفيديو على يوتيوب"
                        dir="ltr"
                    />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            الفيديو الفرعي الأول
                        </label>
                        <input
                            type="text"
                            name="secondary1"
                            value={formData.youtube.secondary1}
                            onChange={handleYouTubeChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                            placeholder="رابط الفيديو على يوتيوب"
                            dir="ltr"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            الفيديو الفرعي الثاني
                        </label>
                        <input
                            type="text"
                            name="secondary2"
                            value={formData.youtube.secondary2}
                            onChange={handleYouTubeChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                            placeholder="رابط الفيديو على يوتيوب"
                            dir="ltr"
                        />
                    </div>
                </div>
            </div>

            {/* Section Submit Button */}
            <div className="flex justify-end pt-4">
                <button
                    type="button"
                    onClick={() => handleSectionSubmit('المكتبة المرئية', {
                        youtube: formData.youtube
                    })}
                    disabled={saving}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    {saving ? 'جاري الحفظ...' : 'حفظ المكتبة المرئية'}
                </button>
            </div>
        </div>
    );
};

export default YouTubeSection; 