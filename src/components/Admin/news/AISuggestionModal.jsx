import React, { useState } from 'react';
import { Lightbulb, Sparkles, Loader2, Check, RefreshCw, AlertTriangle, X } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';

// IMPORTANT: Replace with your actual API key.
// WARNING: Do NOT commit this key to version control or expose it publicly.
// Consider using environment variables or a backend proxy for production.
const API_KEY = 'AIzaSyB28oyoC-uDn8ijlQQb6vIcC0A-lL1LpSE';

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

const AISuggestionModal = ({
    isOpen,
    onClose,
    initialContent = '',
    initialTitle = '',
    action,
    onSelect,
    mainImage = null,
    subImage = null
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [results, setResults] = useState([]);
    const [error, setError] = useState(null);
    const [requestAttempted, setRequestAttempted] = useState(false);

    // Enhanced prompts for better text generation and grammatical correctness
    const createPrompt = () => {
        if (action === 'suggestTitle') {
            if (!initialContent) {
                return null;
            }

            // Add image context to the prompt if available
            let imageContext = '';
            if (mainImage || subImage) {
                imageContext = '\n\nملاحظة: الخبر يتضمن صورًا توضيحية تتعلق بالمحتوى.';
            }

            return `بصفتك محرر محترف باللغة العربية، اقترح 3 عناوين إخبارية قوية ومميزة للمحتوى التالي. 
            يجب أن تكون العناوين:
            - موجزة (لا تزيد عن 10-15 كلمة)
            - جذابة تثير اهتمام القارئ
            - دقيقة لغويًا وخالية من الأخطاء النحوية والإملائية
            - تعكس المحتوى الرئيسي للخبر بوضوح
            - متنوعة في الأسلوب (استفهامي، إخباري، وصفي)

            **المحتوى:**
            \`\`\`
            ${initialContent}
            \`\`\`
            ${imageContext}

            قدم العناوين الثلاثة فقط، كل عنوان في سطر منفصل، بدون ترقيم أو شروحات إضافية.`;
        } else if (action === 'enhanceContent') {
            if (!initialContent) {
                return null;
            }

            let imageContext = '';
            if (mainImage || subImage) {
                imageContext = '\n\nملاحظة: قم بتحسين النص مع مراعاة أن الخبر يتضمن صورًا توضيحية.';
            }

            return `بصفتك كاتبًا صحفيًا محترفًا باللغة العربية، قم بتحسين نص الخبر التالي:

            **مبادئ التحسين:**
            1. حسّن جودة اللغة والأسلوب مع الحفاظ على دقة المعلومات الأصلية
            2. أضف تفاصيل توضيحية عند الحاجة لجعل النص أكثر ثراءً
            3. نظّم الفقرات بشكل منطقي وأضف عناوين فرعية إذا كان مناسبًا
            4. استخدم لغة سلسة وواضحة ومباشرة
            5. تأكد من خلو النص من الأخطاء النحوية والإملائية
            6. اجعل النص أكثر حيوية وتشويقًا مع الحفاظ على الطابع الإخباري المهني
            
            **النص الأصلي:**
            \`\`\`
            ${initialContent}
            \`\`\`
            ${imageContext}
            
            قدم النص المحسّن فقط بدون أي مقدمات أو تعليقات.`;
        }
        return null;
    };

    // Actual AI API call using Google Generative AI
    const fetchAISuggestions = async () => {
        setIsLoading(true);
        setError(null);
        setResults([]);
        setRequestAttempted(true);

        if (API_KEY === 'YOUR_API_KEY' || API_KEY === 'my-key' || API_KEY === '') {
            setError('يرجى إضافة مفتاح Google AI API الخاص بك في الكود.');
            setIsLoading(false);
            return;
        }

        const prompt = createPrompt();

        if (!prompt) {
            setError('لا يمكن إنشاء استعلام صالح بناءً على المدخلات المقدمة.');
            setIsLoading(false);
            return;
        }

        try {
            console.log(`Sending prompt to AI (Action: ${action}):`, prompt);

            const generationConfig = {
                temperature: action === 'suggestTitle' ? 0.8 : 0.6,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: action === 'suggestTitle' ? 300 : 1500,
            };

            const safetySettings = [
                {
                    category: "HARM_CATEGORY_HARASSMENT",
                    threshold: "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                    category: "HARM_CATEGORY_HATE_SPEECH",
                    threshold: "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                    category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                    threshold: "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                    category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                    threshold: "BLOCK_MEDIUM_AND_ABOVE"
                }
            ];

            const result = await model.generateContent({
                contents: [{ role: "user", parts: [{ text: prompt }] }],
                generationConfig,
                safetySettings
            });

            const response = await result.response;
            const text = response.text();

            if (!text) {
                throw new Error('لم يتم تلقي استجابة نصية من الذكاء الاصطناعي.');
            }

            if (action === 'suggestTitle') {
                const suggestedTitles = text.split('\n')
                    .map(title => title.trim())
                    .filter(title => title.length > 0 && !title.startsWith('-') && !title.match(/^\d+\./));

                const uniqueTitles = [...new Set(suggestedTitles)].slice(0, 3);
                setResults(uniqueTitles.length > 0 ? uniqueTitles : ['لم يتم العثور على اقتراحات للعناوين.']);
            } else if (action === 'enhanceContent') {
                let cleanedText = text.trim()
                    .replace(/^(النص المحسّن:|المحتوى المحسن:)/i, '')
                    .trim();

                setResults([cleanedText]);
            }

        } catch (err) {
            console.error("AI Suggestion Error:", err);
            let errorMessage = 'فشل في الحصول على الاقتراحات. ';

            if (err.message.includes('API key not valid')) {
                errorMessage += 'مفتاح API غير صالح. يرجى التحقق منه.';
            } else if (err.message.includes('billing account')) {
                errorMessage += 'قد تكون هناك مشكلة في حساب الفوترة المرتبط بمفتاح API.';
            } else if (err.message.includes('quota')) {
                errorMessage += 'لقد تجاوزت حصة الاستخدام المسموح بها.';
            } else {
                errorMessage += err.message || 'يرجى المحاولة مرة أخرى لاحقًا.';
            }

            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRefresh = () => {
        fetchAISuggestions();
    };

    const handleSelectResult = (result) => {
        onSelect(result);
        onClose();
    };

    // Get page title based on action
    const getPageTitle = () => {
        if (action === 'suggestTitle') return 'اقتراح عنوان احترافي';
        if (action === 'enhanceContent') return 'تحسين محتوى الخبر';
        return 'مساعد الذكاء الاصطناعي للنصوص';
    };

    // Get input label based on action
    const getInputLabel = () => {
        if (action === 'suggestTitle') return 'محتوى الخبر الأصلي:';
        if (action === 'enhanceContent') return 'النص الأصلي للتحسين:';
        return 'النص الأصلي:';
    };

    // Effect to auto-fetch suggestions when modal opens
    React.useEffect(() => {
        if (isOpen && initialContent) {
            fetchAISuggestions();
        } else if (isOpen) {
            if (action === 'suggestTitle') {
                setError('يرجى كتابة محتوى الخبر أولاً للحصول على اقتراحات للعناوين.');
            } else if (action === 'enhanceContent') {
                setError('يرجى كتابة محتوى الخبر أولاً لتحسينه.');
            }
        }
    }, [isOpen, initialContent, action]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 left-4 p-2 hover:bg-gray-100 rounded-full"
                    title="إغلاق"
                >
                    <X className="w-5 h-5 text-gray-500" />
                </button>

                {/* Modal content */}
                <div className="p-6">
                    {/* Header */}
                    <div className="flex items-center gap-2 mb-6">
                        {action === 'suggestTitle' ?
                            <Lightbulb className="w-6 h-6 text-yellow-500" /> :
                            <Sparkles className="w-6 h-6 text-blue-500" />
                        }
                        <h2 className="text-xl font-bold text-gray-800">
                            {getPageTitle()}
                        </h2>
                    </div>

                    {/* Original content */}
                    <div className="mb-6 p-5 bg-gray-50 rounded-lg border border-gray-200">
                        <label className="block text-base font-medium text-gray-700 mb-3">
                            {getInputLabel()}
                        </label>
                        <div className="bg-white p-4 rounded-md border border-gray-100 shadow-inner" dir="rtl">
                            <p className="text-gray-800 whitespace-pre-wrap text-sm leading-relaxed">
                                {initialContent || '(لا يوجد محتوى حالي)'}
                            </p>
                        </div>

                        {action === 'suggestTitle' && initialTitle && (
                            <div className="mt-4 pt-3 border-t border-gray-200">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    العنوان الحالي:
                                </label>
                                <div className="bg-white p-3 rounded-md border border-gray-100 shadow-inner" dir="rtl">
                                    <p className="text-gray-800 font-medium">{initialTitle}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Loading state */}
                    {isLoading && (
                        <div className="text-center py-10 bg-blue-50 rounded-lg border border-blue-100">
                            <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-4" />
                            <p className="text-blue-700 font-medium">
                                جاري تحليل النص وإنشاء اقتراحات عالية الجودة...
                            </p>
                            <p className="text-blue-500 text-sm mt-2">
                                قد تستغرق هذه العملية بضع ثوانٍ
                            </p>
                        </div>
                    )}

                    {/* Error state */}
                    {error && !isLoading && (
                        <div className="text-center py-8 px-6 bg-red-50 rounded-lg border border-red-200">
                            <div className="flex items-center justify-center gap-2 mb-4">
                                <AlertTriangle className="w-6 h-6 text-red-500" />
                                <p className="text-red-600 font-medium text-lg">{error}</p>
                            </div>
                            <button
                                onClick={handleRefresh}
                                className="mt-4 bg-white text-red-600 border border-red-300 rounded-md px-4 py-2 flex items-center gap-1 mx-auto hover:bg-red-50 transition-colors"
                            >
                                <RefreshCw className="w-4 h-4" />
                                حاول مرة أخرى
                            </button>
                        </div>
                    )}

                    {/* Results */}
                    {!isLoading && !error && results.length > 0 && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-gray-800">
                                    {action === 'suggestTitle' ? 'العناوين المقترحة:' : 'المحتوى المحسن:'}
                                </h3>
                                <button
                                    onClick={handleRefresh}
                                    className="text-blue-600 bg-blue-50 px-3 py-1 rounded-md text-sm flex items-center gap-1 hover:bg-blue-100 transition-colors"
                                    title="إعادة إنشاء اقتراحات جديدة"
                                >
                                    <RefreshCw className="w-4 h-4" />
                                    اقتراحات جديدة
                                </button>
                            </div>

                            {action === 'suggestTitle' ? (
                                // Title suggestions
                                <div className="grid gap-3">
                                    {results.map((result, index) => (
                                        <div
                                            key={index}
                                            className="border border-gray-200 rounded-lg p-4 hover:bg-blue-50 transition-colors flex justify-between items-start gap-4 shadow-sm"
                                        >
                                            <div className="flex-grow" dir="rtl">
                                                <p className="text-gray-800 font-medium text-base">
                                                    {result}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => handleSelectResult(result)}
                                                className="bg-green-500 text-white px-4 py-2 rounded-md text-sm flex items-center gap-1 hover:bg-green-600 transition-colors flex-shrink-0 shadow-sm"
                                                title="استخدام هذا العنوان"
                                            >
                                                <Check className="w-4 h-4" />
                                                استخدام
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                // Enhanced content
                                <div className="border border-gray-200 rounded-lg p-5 hover:border-blue-300 transition-colors shadow-sm bg-white">
                                    <div
                                        className="text-gray-800 whitespace-pre-wrap text-sm leading-relaxed mb-4 bg-blue-50 p-4 rounded-md"
                                        dir="rtl"
                                    >
                                        {results[0]}
                                    </div>
                                    <div className="flex justify-end">
                                        <button
                                            onClick={() => handleSelectResult(results[0])}
                                            className="bg-green-500 text-white px-4 py-2 rounded-md text-sm flex items-center gap-2 hover:bg-green-600 transition-colors shadow-sm"
                                            title="استخدام المحتوى المحسن"
                                        >
                                            <Check className="w-4 h-4" />
                                            استخدام المحتوى المحسن
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* No results message */}
                    {!isLoading && !error && results.length === 0 && requestAttempted && (
                        <div className="text-center py-10 bg-yellow-50 rounded-lg border border-yellow-200">
                            <p className="text-yellow-700">لم يتم العثور على اقتراحات.</p>
                            <button
                                onClick={handleRefresh}
                                className="mt-4 bg-white text-yellow-600 border border-yellow-300 rounded-md px-4 py-2 flex items-center gap-1 mx-auto hover:bg-yellow-50 transition-colors"
                            >
                                <RefreshCw className="w-4 h-4" />
                                حاول مرة أخرى
                            </button>
                        </div>
                    )}

                    {/* Tips box */}
                    <div className="max-w-4xl mx-auto mt-6 bg-blue-50 rounded-xl shadow-sm p-4 border border-blue-100">
                        <h3 className="text-sm font-medium text-blue-800 mb-2 flex items-center gap-1">
                            <Lightbulb className="w-4 h-4" />
                            نصائح للحصول على أفضل النتائج:
                        </h3>
                        <ul className="text-sm text-blue-700 list-disc list-inside space-y-1">
                            <li>قدم محتوى تفصيليًا ودقيقًا للحصول على اقتراحات أفضل</li>
                            <li>يمكنك النقر على "اقتراحات جديدة" للحصول على خيارات مختلفة</li>
                            {action === 'suggestTitle' && (
                                <li>العناوين الأكثر جاذبية تتضمن أرقامًا أو استفهامًا أو تعبيرات مثيرة للاهتمام</li>
                            )}
                            {action === 'enhanceContent' && (
                                <li>يتم تحسين النص مع الحفاظ على المعلومات الأصلية وتدفق الأفكار</li>
                            )}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AISuggestionModal;
