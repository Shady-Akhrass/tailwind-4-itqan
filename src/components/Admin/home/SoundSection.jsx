import React from 'react';

const SoundSection = ({ formData, handleSoundChange, handleSectionSubmit, saving }) => {
    return (
        <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">المكتبة الصوتية</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        رابط SoundCloud
                    </label>
                    <input
                        type="text"
                        name="main"
                        value={formData.sound.main}
                        onChange={handleSoundChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="رابط المقطع الصوتي على SoundCloud"
                        dir="ltr"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        اسم المقطع
                    </label>
                    <input
                        type="text"
                        name="name"
                        value={formData.sound.name}
                        onChange={handleSoundChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="اسم المقطع الصوتي"
                        dir="rtl"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        الرابط الخارجي
                    </label>
                    <input
                        type="text"
                        name="link"
                        value={formData.sound.link}
                        onChange={handleSoundChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="رابط خارجي (اختياري)"
                        dir="ltr"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        العنوان
                    </label>
                    <input
                        type="text"
                        name="title"
                        value={formData.sound.title}
                        onChange={handleSoundChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="عنوان المقطع"
                        dir="rtl"
                    />
                </div>
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        قائمة التشغيل
                    </label>
                    <input
                        type="text"
                        name="playlist"
                        value={formData.sound.playlist}
                        onChange={handleSoundChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="رابط قائمة التشغيل (اختياري)"
                        dir="ltr"
                    />
                </div>
            </div>

            {/* Section Submit Button */}
            <div className="flex justify-end pt-4">
                <button
                    type="button"
                    onClick={() => handleSectionSubmit('المكتبة الصوتية', {
                        sound: [formData.sound]
                    })}
                    disabled={saving}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    {saving ? 'جاري الحفظ...' : 'حفظ المكتبة الصوتية'}
                </button>
            </div>
        </div>
    );
};

export default SoundSection; 