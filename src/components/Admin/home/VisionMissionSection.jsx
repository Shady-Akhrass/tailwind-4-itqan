import React from 'react';

const VisionMissionSection = ({ formData, handleInputChange, handleAchievementChange, handleSectionSubmit, saving }) => {
    return (
        <div className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        رؤيتنا
                    </label>
                    <textarea
                        name="vision"
                        value={formData.vision}
                        onChange={handleInputChange}
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        dir="rtl"
                    ></textarea>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        رسالتنا
                    </label>
                    <textarea
                        name="mission"
                        value={formData.mission}
                        onChange={handleInputChange}
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        dir="rtl"
                    ></textarea>
                </div>
            </div>

            {/* Numbers Section */}
            <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-6">الإنجازات</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            عدد الطلاب
                        </label>
                        <input
                            type="number"
                            name="student_number"
                            value={formData.achievements.student_number}
                            onChange={handleAchievementChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            عدد المعلمين
                        </label>
                        <input
                            type="number"
                            name="teacher_number"
                            value={formData.achievements.teacher_number}
                            onChange={handleAchievementChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            عدد الدورات
                        </label>
                        <input
                            type="number"
                            name="course_number"
                            value={formData.achievements.course_number}
                            onChange={handleAchievementChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            عدد الحفظ
                        </label>
                        <input
                            type="number"
                            name="memorizing_number"
                            value={formData.achievements.memorizing_number}
                            onChange={handleAchievementChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            عدد المسابقات
                        </label>
                        <input
                            type="number"
                            name="contest_number"
                            value={formData.achievements.contest_number}
                            onChange={handleAchievementChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            عدد المخيمات
                        </label>
                        <input
                            type="number"
                            name="camp_number"
                            value={formData.achievements.camp_number}
                            onChange={handleAchievementChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            عدد الدروس
                        </label>
                        <input
                            type="number"
                            name="lesson_number"
                            value={formData.achievements.lesson_number}
                            onChange={handleAchievementChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            عدد الاحتفالات
                        </label>
                        <input
                            type="number"
                            name="celebration_number"
                            value={formData.achievements.celebration_number}
                            onChange={handleAchievementChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                    </div>
                </div>
            </div>

            {/* Section Submit Button */}
            <div className="flex justify-end pt-4">
                <button
                    type="button"
                    onClick={() => handleSectionSubmit('الرؤية والرسالة والإنجازات', {
                        vision: formData.vision,
                        mission: formData.mission,
                        achievements: formData.achievements
                    })}
                    disabled={saving}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    {saving ? 'جاري الحفظ...' : 'حفظ الرؤية والرسالة والإنجازات'}
                </button>
            </div>
        </div>
    );
};

export default VisionMissionSection; 