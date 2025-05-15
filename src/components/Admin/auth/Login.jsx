import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Loader2, Eye, EyeOff, CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import { apiClient } from '../../../api/queries';
import { useAuth } from '../context/AuthContext';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';

const LoginForm = () => {
    const { isAuthenticated, login } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const from = location.state?.from?.pathname || "/admin";

    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        remember: false,
    });
    const [touched, setTouched] = useState({
        email: false,
        password: false,
    });
    const [validEmail, setValidEmail] = useState(false);
    const [errors, setErrors] = useState({});

    // If already authenticated, redirect to admin
    if (isAuthenticated) {
        return <Navigate to="/admin" replace />;
    }

    const validateEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    };

    const handleBlur = (field) => {
        setTouched(prev => ({ ...prev, [field]: true }));
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        if (name === 'email') {
            setValidEmail(validateEmail(value));
        }

        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setErrors({});

        try {
            const response = await apiClient.post('/login/API', formData, {
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                }
            });

            if (response.data.message === 'success' || response.status === 200) {
                const { user, token } = response.data;
                await login({ user, token }, formData.remember);
                navigate(from, { replace: true });
            }
        } catch (error) {
            if (error.response) {
                if (error.response.status === 422) {
                    setErrors(error.response.data.errors);
                } else if (error.response.status === 401) {
                    setErrors({
                        email: 'بيانات الاعتماد غير صحيحة'
                    });
                } else {
                    setErrors({
                        general: 'حدث خطأ في الخادم. حاول مرة اخرى.'
                    });
                }
            } else {
                setErrors({
                    general: 'حدث خطأ في الاتصال. تحقق من اتصالك بالإنترنت.'
                });
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 flex items-center justify-center p-4" dir="rtl">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative w-full max-w-md"
            >
                {/* Decorative Elements */}
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-green-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
                <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>

                <div className="relative backdrop-blur-lg bg-white/80 p-8 rounded-2xl shadow-2xl border border-white/20">
                    {/* Logo and Title */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-center mb-8"
                    >
                        <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl shadow-lg flex items-center justify-center">
                            <Lock className="w-10 h-10 text-white" />
                        </div>
                        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-green-400">
                            مرحباً بعودتك
                        </h2>
                        <p className="mt-2 text-gray-600">قم بتسجيل الدخول للمتابعة</p>
                    </motion.div>

                    {/* General Error Message */}
                    <AnimatePresence>
                        {errors.general && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="mb-6 p-4 rounded-xl bg-red-50 text-red-600 text-sm border border-red-100"
                            >
                                {errors.general}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Email Field */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            className="space-y-1"
                        >
                            <div className="relative group">
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                    <Mail className={`h-5 w-5 ${validEmail ? 'text-green-500' : 'text-gray-400'}`} />
                                </div>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    onBlur={() => handleBlur('email')}
                                    className={`block w-full pr-10 pl-12 py-4 border-2 rounded-xl 
                    ${touched.email && !validEmail ? 'border-red-200 focus:border-red-500' : 'border-gray-100 focus:border-green-500'}
                    bg-white/50 backdrop-blur-sm transition-all duration-300 outline-none
                    focus:ring-4 ${validEmail ? 'ring-green-50' : 'ring-gray-50'}`}
                                    placeholder="البريد الإلكتروني"
                                />
                                <AnimatePresence>
                                    {touched.email && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.5 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.5 }}
                                            className="absolute left-3 top-1/2 -translate-y-1/2"
                                        >
                                            {validEmail ? (
                                                <CheckCircle className="w-5 h-5 text-green-500" />
                                            ) : (
                                                <XCircle className="w-5 h-5 text-red-500" />
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                            {errors.email && (
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-red-500 text-sm"
                                >
                                    {errors.email}
                                </motion.p>
                            )}
                        </motion.div>

                        {/* Password Field */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                            className="space-y-1"
                        >
                            <div className="relative group">
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    onBlur={() => handleBlur('password')}
                                    className="block w-full pr-10 pl-12 py-4 border-2 border-gray-100 rounded-xl
                    bg-white/50 backdrop-blur-sm transition-all duration-300
                    focus:border-green-500 focus:ring-4 focus:ring-green-50 outline-none"
                                    placeholder="كلمة المرور"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 focus:outline-none"
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                                    ) : (
                                        <Eye className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                                    )}
                                </button>
                            </div>
                            {errors.password && (
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-red-500 text-sm"
                                >
                                    {errors.password}
                                </motion.p>
                            )}
                        </motion.div>

                        {/* Remember Me & Forgot Password */}
                        <div className="flex items-center justify-between text-sm">
                            <label className="flex items-center space-x-2 space-x-reverse cursor-pointer group">
                                <input
                                    type="checkbox"
                                    name="remember"
                                    checked={formData.remember}
                                    onChange={handleChange}
                                    className="form-checkbox h-4 w-4 text-green-500 rounded border-2 border-gray-200
                    focus:ring-green-500 focus:ring-offset-0 transition duration-200 cursor-pointer"
                                />
                                <span className="text-gray-600 group-hover:text-gray-800 transition duration-200">تذكرني</span>
                            </label>
                            <a
                                href="/forgot-password"
                                className="text-green-600 hover:text-green-500 transition duration-200 hover:underline"
                            >
                                نسيت كلمة المرور؟
                            </a>
                        </div>

                        {/* Submit Button */}
                        <motion.button
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            type="submit"
                            disabled={isLoading}
                            className={`relative w-full py-4 px-6 rounded-xl text-white font-medium
                bg-gradient-to-r from-green-500 to-green-600
                transform transition-all duration-300
                shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/40
                focus:outline-none focus:ring-4 focus:ring-green-500/30 group overflow-hidden
                disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            <div className="absolute inset-0 bg-white/20 group-hover:scale-x-100 scale-x-0 
                transition-transform origin-right"></div>
                            <div className="relative flex items-center justify-center gap-2">
                                {isLoading ? (
                                    <Loader2 className="animate-spin h-5 w-5" />
                                ) : (
                                    <>
                                        <span>تسجيل الدخول</span>
                                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </div>
                        </motion.button>

                        {/* Sign Up Link */}
                        <div className="text-center">
                            <p className="text-gray-600">
                                ليس لديك حساب؟{' '}
                                <a href="/register" className="text-green-600 hover:text-green-500 font-medium transition duration-200 hover:underline">
                                    إنشاء حساب جديد
                                </a>
                            </p>
                        </div>
                    </form>
                </div>
            </motion.div>
        </div>
    );
};

export default LoginForm;