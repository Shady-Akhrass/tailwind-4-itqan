// Web Worker for achievements calculations
self.addEventListener('message', (e) => {
    const { achievements } = e.data;

    if (!achievements || achievements.length === 0) {
        self.postMessage({ stats: [] });
        return;
    }

    const stats = [
        { key: 'student_number', label: "عدد الطلاب" },
        { key: 'teacher_number', label: "عدد المعلمين" },
        { key: 'course_number', label: "عدد الدورات" },
        { key: 'memorizing_number', label: "عدد الحفاظ" },
        { key: 'contest_number', label: "عدد المسابقات" },
        { key: 'camp_number', label: "عدد المخيمات" },
        { key: 'lesson_number', label: "عدد الدروس" },
        { key: 'celebration_number', label: "عدد الحفلات" }
    ].map(({ key, label }) => ({
        value: achievements[0][key],
        label,
        normalized: (parseInt(achievements[0][key]) / 1000) * 100
    }));

    self.postMessage({ stats });
});