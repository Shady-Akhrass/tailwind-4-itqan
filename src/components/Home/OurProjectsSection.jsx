import React from 'react';
import { ExternalLink, Sparkles } from 'lucide-react';

const ProjectsBanner = ({ isDarkMode }) => {
    const projects = [
        {
            title: "برنامج حفظ القرآن",
            description: "منهج متكامل لحفظ القرآن الكريم مع التجويد والتفسير",
            tags: ["تحفيظ", "تجويد", "تفسير"],
            link: "#",
            gradient: "from-emerald-500 to-teal-500"
        },
        {
            title: "الدورات التعليمية",
            description: "دورات متخصصة في العلوم الشرعية واللغة العربية",
            tags: ["تعليم", "تدريب", "تطوير"],
            link: "#",
            gradient: "from-emerald-400 to-cyan-500"
        },
        {
            title: "المنصة الإلكترونية",
            description: "منصة تفاعلية للتعلم عن بعد وإدارة العملية التعليمية",
            tags: ["تقنية", "تعلم عن بعد"],
            link: "#",
            gradient: "from-teal-500 to-emerald-400"
        }
    ];

    return (
        <section
            className={`relative w-full py-32 overflow-hidden ${isDarkMode
                    ? 'bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-950'
                    : 'bg-gradient-to-br from-emerald-50 via-white to-emerald-50'
                }`}
        >
            {/* Modern geometric decorative elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-1/2 -right-1/2 w-full h-full rotate-12 bg-gradient-to-b from-emerald-500/5 to-transparent"></div>
                <div className="absolute -bottom-1/2 -left-1/2 w-full h-full -rotate-12 bg-gradient-to-t from-emerald-500/5 to-transparent"></div>
            </div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Modern Header */}
                <div className="text-center mb-20 max-w-3xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full mb-8 backdrop-blur-sm border border-emerald-500/20 bg-emerald-500/5">
                        <Sparkles className={isDarkMode ? "text-emerald-400" : "text-emerald-600"} size={20} />
                        <span className={`text-sm font-medium ${isDarkMode ? "text-emerald-300" : "text-emerald-600"}`}>
                            اكتشف مشاريعنا
                        </span>
                    </div>
                    <h2 className={`text-5xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-emerald-900'
                        } font-tajwal tracking-tight`}>
                        مشاريعنا المميزة
                    </h2>
                    <div className="relative h-1 w-24 mx-auto mb-8">
                        <div className={`absolute inset-0 rounded-full ${isDarkMode ? 'bg-emerald-400' : 'bg-emerald-500'
                            }`}></div>
                        <div className={`absolute inset-0 rounded-full animate-pulse ${isDarkMode ? 'bg-emerald-300' : 'bg-emerald-400'
                            } blur-sm`}></div>
                    </div>
                    <p className={`text-xl ${isDarkMode ? 'text-emerald-100' : 'text-emerald-700'
                        }`}>
                        اكتشف أحدث مشاريعنا التي تساهم في تطوير التعليم وخدمة المجتمع
                    </p>
                </div>

                {/* Modern Projects Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 rtl perspective-1000">
                    {projects.map((project, index) => (
                        <div
                            key={index}
                            className={`group relative rounded-2xl p-8 transition-all duration-500 hover:-translate-y-2 hover:translate-x-1 hover:rotate-1 ${isDarkMode
                                    ? 'bg-gradient-to-br from-emerald-800/40 to-emerald-900/40 hover:from-emerald-700/50 hover:to-emerald-800/50'
                                    : 'bg-white/80 hover:bg-white/90'
                                } backdrop-blur-xl border border-emerald-500/10 shadow-lg shadow-emerald-500/5 hover:shadow-xl hover:shadow-emerald-500/10`}
                        >
                            {/* Gradient Border Effect */}
                            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br opacity-0 group-hover:opacity-20 transition-opacity duration-500 -z-10"></div>

                            <div className="flex justify-between items-start mb-6">
                                <h3 className={`text-2xl font-semibold ${isDarkMode ? 'text-white' : 'text-emerald-900'
                                    }`}>
                                    {project.title}
                                </h3>
                                <a
                                    href={project.link}
                                    className={`p-3 rounded-xl transition-all duration-300 transform group-hover:scale-110 group-hover:rotate-12 ${isDarkMode
                                            ? 'bg-emerald-700/50 hover:bg-emerald-600 text-emerald-300'
                                            : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-600'
                                        }`}
                                    aria-label="تفاصيل المشروع"
                                >
                                    <ExternalLink size={18} className="transform transition-transform group-hover:scale-110" />
                                </a>
                            </div>

                            <p className={`mb-8 text-lg leading-relaxed ${isDarkMode ? 'text-emerald-100' : 'text-emerald-600'
                                }`}>
                                {project.description}
                            </p>

                            <div className="flex flex-wrap gap-2">
                                {project.tags.map((tag, tagIndex) => (
                                    <span
                                        key={tagIndex}
                                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 hover:scale-105 ${isDarkMode
                                                ? 'bg-emerald-800/50 text-emerald-100 hover:bg-emerald-700/60'
                                                : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                                            }`}
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default ProjectsBanner;