import React, { useEffect, useState, useRef, memo } from 'react';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import { apiClient } from '../../api/queries';
import CountUp from 'react-countup';
import { useInView } from 'react-intersection-observer';
import {
    Users, Book, GraduationCap, Trophy,
    School, BookOpen, Calendar, UserCheck
} from 'lucide-react';
import { AchievementsSkeleton } from '../Skeleton/AchievementsSkeleton';

const iconMap = {
    student_number: Users,
    teacher_number: UserCheck,
    course_number: Book,
    memorizing_number: GraduationCap,
    contest_number: Trophy,
    camp_number: School,
    lesson_number: BookOpen,
    celebration_number: Calendar
};

// Memoized Progress Circle for better performance
const ProgressCircle = memo(({ value, color }) => (
    <div className="relative w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
        <motion.div
            className={`absolute left-0 top-0 h-full ${color}`}
            initial={{ width: 0 }}
            whileInView={{ width: `${value}%` }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            viewport={{ once: true, margin: "-100px" }}
        />
    </div>
));

// Optimized StatCard with reduced re-renders
const StatCard = memo(({ stat, Icon }) => {
    const [ref, inView] = useInView({
        threshold: 0.2,
        triggerOnce: true,
        rootMargin: '50px'
    });

    return (
        <motion.div
            ref={ref}
            className="group transform-gpu"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
            <div className="relative">
                <div className="rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden bg-white dark:bg-gray-900">
                    {/* Floating Icon with reduced animation complexity */}
                    <motion.div
                        className="absolute -top-6 right-6 w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 dark:from-yellow-400 dark:to-yellow-600 rounded-2xl shadow-lg"
                        animate={inView ? {
                            y: [0, -8, 0],
                            rotate: [-12, 0, -12]
                        } : {}}
                        transition={{
                            duration: 4,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: Math.random() * 0.5 // Stagger animations
                        }}
                        style={{ willChange: 'transform' }}
                    >
                        <div className="w-full h-full flex items-center justify-center text-white dark:text-gray-900">
                            <Icon className="w-8 h-8" />
                        </div>
                    </motion.div>

                    <div className="pt-12 px-6 pb-6 text-center">
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white font-arabic mb-4">
                            {stat.label}
                        </h3>

                        <div className="space-y-4">
                            {inView && (
                                <motion.div
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-emerald-700 dark:from-yellow-400 dark:to-yellow-600"
                                >
                                    <CountUp
                                        end={parseInt(stat.value)}
                                        duration={2}
                                        separator=","
                                        useEasing={true}
                                    />
                                    <span className="text-gray-400 dark:text-gray-300">+</span>
                                </motion.div>
                            )}

                            <ProgressCircle
                                value={stat.normalized}
                                color="bg-gradient-to-r from-green-500 to-emerald-600 dark:from-yellow-400 dark:to-yellow-600"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
});

const AchievementsSection = () => {
    const [stats, setStats] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const workerRef = useRef();

    useEffect(() => {
        // Initialize Web Worker
        workerRef.current = new Worker(new URL('../../utils/achievementsWorker.js', import.meta.url));

        workerRef.current.onmessage = (e) => {
            const { stats } = e.data;
            setStats(stats);
            setIsLoading(false);
        };

        // Fetch data and process in worker
        const fetchData = async () => {
            try {
                const { data } = await apiClient.get('/home/API');
                workerRef.current.postMessage({ achievements: data.homes });
            } catch (error) {
                console.error("Error fetching achievements:", error);
                setIsLoading(false);
            }
        };

        fetchData();

        return () => {
            workerRef.current?.terminate();
        };
    }, []);

    if (isLoading) {
        return <AchievementsSkeleton />;
    }

    return (
        <section className="py-32">
            <div className="container mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-20"
                >
                    <motion.div
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2, type: "spring" }}
                    >
                        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100 font-arabic mb-4">
                            إنجازات الدار
                        </h2>
                        <div className="w-24 h-1 bg-gradient-to-r from-green-500 to-emerald-600 dark:from-yellow-400 dark:to-yellow-600 mx-auto rounded-full" />
                    </motion.div>
                </motion.div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
                    {stats.map((stat, index) => (
                        <StatCard
                            key={stat.key || index}
                            stat={stat}
                            Icon={iconMap[stat.key] || Users}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default memo(AchievementsSection);