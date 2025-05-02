import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { apiClient } from '../../api/queries';
import CountUp from 'react-countup';
import { useInView } from 'react-intersection-observer';
import {
    Users, Book, GraduationCap, Trophy,
    School, BookOpen, Calendar, UserCheck,
    TrendingUp, Award
} from 'lucide-react';
import { AchievementsSkeleton } from '../Skeleton/AchievementsSkeleton';

const ProgressCircle = ({ value, color }) => (
    <div className="relative w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
        <motion.div
            className={`absolute left-0 top-0 h-full ${color}`}
            initial={{ width: 0 }}
            animate={{ width: `${value}%` }}
            transition={{ duration: 1.5, ease: "easeOut" }}
        />
    </div>
);

const StatCard = ({ stat, index, yearlyGrowth }) => {
    const controls = useAnimation();
    const [cardRef, cardInView] = useInView({ threshold: 0.2, triggerOnce: true });

    useEffect(() => {
        if (cardInView) {
            controls.start("show");
        }
    }, [cardInView, controls]);

    return (
        <motion.div
            ref={cardRef}
            className="group"
            whileHover={{ scale: 1.02 }}
            initial="hidden"
            animate={controls}
        >
            <div className="relative">
                <div className="rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                    {/* Floating Icon */}
                    <motion.div
                        className="absolute -top-6 right-6 w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 dark:from-yellow-400 dark:to-yellow-600 rounded-2xl shadow-lg transform -rotate-12"
                        animate={{
                            rotate: [-12, 0, -12],
                            y: [0, -8, 0]
                        }}
                        transition={{
                            duration: 4,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    >
                        <div className="w-full h-full flex items-center justify-center text-white dark:text-gray-900">
                            {stat.icon}
                        </div>
                    </motion.div>

                    {/* Card Content */}
                    <div className="pt-12 px-6 pb-6 text-center " >
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white font-arabic mb-4">
                            {stat.label}
                        </h3>

                        <div className="space-y-4">
                            {/* Main Counter */}
                            <div className="text-center">
                                <AnimatePresence>
                                    {cardInView && (
                                        <motion.div
                                            initial={{ scale: 0, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-emerald-700 dark:from-yellow-400 dark:to-yellow-600"
                                        >
                                            <CountUp
                                                end={parseInt(stat.value)}
                                                duration={2.5}
                                                separator=","
                                                useEasing={true}
                                            />
                                            <span className="text-gray-400 dark:text-gray-300">+</span>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Progress Indicator */}
                            <ProgressCircle
                                value={(parseInt(stat.value) / 1000) * 100}
                                color="bg-gradient-to-r from-green-500 to-emerald-600 dark:from-yellow-400 dark:to-yellow-600"
                            />

                            {/* Growth Indicator */}
                            {/* <div className="flex items-center justify-center space-x-2 text-sm font-medium">
                                <TrendingUp className="w-4 h-4 text-green-500 dark:text-yellow-400" />
                                <span className="text-green-600 dark:text-yellow-400">
                                    +{yearlyGrowth}% نمو سنوي
                                </span>
                            </div> */}
                        </div>
                    </div>

                    {/* Achievement Badge */}
                    {parseInt(stat.value) > 500 && (
                        <div className="absolute top-2 left-2">
                            <motion.div
                                whileHover={{ rotate: 20 }}
                                className="bg-yellow-400/10 p-2 rounded-full"
                            >
                                <Award className="w-4 h-4 text-yellow-600 dark:text-yellow-300" />
                            </motion.div>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

const AchievementsSection = () => {
    const [achievements, setAchievements] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const { ref, inView } = useInView({
        threshold: 0.1,
        triggerOnce: true
    });

    useEffect(() => {
        apiClient.get('/home/API')
            .then(response => setAchievements(response.data.homes))
            .catch(error => console.error("Error fetching achievements:", error))
            .finally(() => setIsLoading(false));
    }, []);

    if (isLoading) {
        return <AchievementsSkeleton />;
    }

    const stats = achievements.length > 0 ? [
        { icon: <Users className="w-8 h-8" />, value: achievements[0].student_number, label: "عدد الطلاب", yearlyGrowth: 2 },
        { icon: <UserCheck className="w-8 h-8" />, value: achievements[0].teacher_number, label: "عدد المعلمين", yearlyGrowth: 35 },
        { icon: <Book className="w-8 h-8" />, value: achievements[0].course_number, label: "عدد الدورات", yearlyGrowth: 15 },
        { icon: <GraduationCap className="w-8 h-8" />, value: achievements[0].memorizing_number, label: "عدد الحفاظ", yearlyGrowth: 25 },
        { icon: <Trophy className="w-8 h-8" />, value: achievements[0].contest_number, label: "عدد المسابقات", yearlyGrowth: 20 },
        { icon: <School className="w-8 h-8" />, value: achievements[0].camp_number, label: "عدد المخيمات", yearlyGrowth: 16 },
        { icon: <BookOpen className="w-8 h-8" />, value: achievements[0].lesson_number, label: "عدد الدروس", yearlyGrowth: 12 },
        { icon: <Calendar className="w-8 h-8" />, value: achievements[0].celebration_number, label: "عدد الحفلات", yearlyGrowth: 5 },
    ] : [];

    return (
        <section className="py-32" ref={ref}>
            <div className="container mx-auto px-4">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="text-center mb-20"
                >
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring" }}
                        className="inline-block"
                    >
                        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100 font-arabic mb-4">
                            إنجازات الدار
                        </h2>
                        <div className="w-24 h-1 bg-gradient-to-r from-green-500 to-emerald-600 dark:from-yellow-400 dark:to-yellow-600 mx-auto rounded-full" />
                    </motion.div>
                </motion.div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
                    {stats.map((stat, index) => (
                        <StatCard
                            key={index}
                            stat={stat}
                            index={index}
                        // yearlyGrowth={stat.yearlyGrowth}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default AchievementsSection;