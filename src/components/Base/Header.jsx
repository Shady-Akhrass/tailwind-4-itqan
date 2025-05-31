import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaBars, FaTimes, FaChevronDown, FaHome, FaInfoCircle, FaBookOpen, FaNewspaper, FaBook, FaPhoneAlt, FaMoon, FaSun } from 'react-icons/fa';
import { SearchIcon } from 'lucide-react';
import Logo from '../../../public/logo.png';
import toast from 'react-hot-toast';
import { useSections } from '../../api/queries';

const Navbar = () => {
    const [navOpen, setNavOpen] = useState(false);
    const [openDropdown, setOpenDropdown] = useState(null);
    const [isScrolled, setIsScrolled] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [pageTitle, setPageTitle] = useState('دار الإتقان - الصفحة الرئيسية');
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(localStorage.getItem('darkMode') === 'true');
    const location = useLocation();
    const navigate = useNavigate();
    const { data: sectionsData } = useSections();

    // Memoize menu items since they're static
    const menuItems = useMemo(() => [
        {
            icon: <FaHome className="text-xl" />,
            label: 'الرئيسية',
            link: '/home',
            id: 'home'
        },
        {
            icon: <FaInfoCircle className="text-xl" />,
            label: 'عن الدار',
            id: 'about',
            submenu: [
                { label: 'مجلس الإدارة', link: '/director', id: 'director' },
                { label: 'الرؤية والرسالة', link: '/vision', id: 'vision' },
                { label: 'كلمة رئيس الدار', link: '/speech', id: 'speech' },
                { label: 'الفروع', link: '/branche', id: 'branche' }
            ]
        },
        {
            icon: <FaBookOpen className="text-xl" />,
            label: 'أقسام الدار',
            id: 'departments',
            submenu: [
                { label: 'قسم تحفيظ القرآن الكريم', link: '/memorization', id: 'memorization' },
                { label: 'قسم الدورات والتجويد والأسانيد', link: '/course', id: 'course' },
                { label: 'قسم ديوان الحفاظ', link: '/diwan', id: 'diwan' },
                { label: 'قسم التربية والمواهب الإبداعية', link: '/creative', id: 'creative' },
                { label: 'قسم الأنشطة والمسابقة', link: '/activity', id: 'activity' }
            ]
        },
        {
            icon: <FaBookOpen className="text-xl" />,
            label: 'الأقسام',
            id: 'sections',
            submenu: sectionsData?.map(section => ({
                label: section.name,
                link: `/section/${section.id}`,
                id: `section-${section.id}`
            })) || []
        },
        {
            icon: <FaNewspaper className="text-xl" />,
            label: 'قسم الأخبار',
            link: '/news',
            id: 'news'
        },
        {
            icon: <FaBook className="text-xl" />,
            label: 'أدلة الدار',
            link: '/clues',
            id: 'clues'
        },
        {
            icon: <FaPhoneAlt className="text-xl" />,
            label: 'تواصل معنا',
            link: '/contact-us',
            id: 'contact-us'
        }
    ], [sectionsData]);

    // Debounced scroll handler
    const handleScroll = useCallback(() => {
        let timeoutId;
        return () => {
            if (timeoutId) {
                window.cancelAnimationFrame(timeoutId);
            }
            timeoutId = window.requestAnimationFrame(() => {
                setIsScrolled(window.scrollY > 0);
            });
        };
    }, []);

    useEffect(() => {
        const scrollHandler = handleScroll();
        window.addEventListener('scroll', scrollHandler, { passive: true });
        return () => {
            window.removeEventListener('scroll', scrollHandler);
        };
    }, [handleScroll]);

    const findMenuItemByPath = useCallback((path) => {
        const normalizedPath = path.replace(/^\//, '');
        let menuItem = menuItems.find(item => item.link?.replace(/^\//, '') === normalizedPath);

        if (!menuItem) {
            for (const item of menuItems) {
                if (item.submenu) {
                    const subItem = item.submenu.find(sub =>
                        sub.link?.replace(/^\//, '') === normalizedPath
                    );
                    if (subItem) {
                        return { mainItem: item, subItem };
                    }
                }
            }
        }

        return { mainItem: menuItem };
    }, [menuItems]);

    useEffect(() => {
        const currentPath = location.pathname;
        const { mainItem, subItem } = findMenuItemByPath(currentPath);

        if (subItem) {
            setSelectedItem(subItem.id);
            setOpenDropdown(mainItem.id);
            setPageTitle(`${subItem.label} | ${mainItem.label} | دار إتقان القرآن الكريم`);
        } else if (mainItem) {
            setSelectedItem(mainItem.id);
            if (mainItem.id === 'home') {
                setPageTitle('دار الإتقان - الصفحة الرئيسية');
            } else {
                setPageTitle(`${mainItem.label} | دار إتقان القرآن الكريم`);
            }
        }

        if (subItem) {
            localStorage.setItem('selectedItem', subItem.id);
            localStorage.setItem('openDropdown', mainItem.id);
        } else if (mainItem) {
            localStorage.setItem('selectedItem', mainItem.id);
            localStorage.setItem('openDropdown', '');
        }
    }, [location.pathname, findMenuItemByPath]);

    useEffect(() => {
        const savedSelectedItem = localStorage.getItem('selectedItem');
        const savedOpenDropdown = localStorage.getItem('openDropdown');

        if (savedSelectedItem) {
            setSelectedItem(savedSelectedItem);
        }
        if (savedOpenDropdown) {
            setOpenDropdown(savedOpenDropdown);
        }
    }, []);

    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('darkMode', isDarkMode);
    }, [isDarkMode]);

    const toggleDropdown = useCallback((dropdownName) => {
        setOpenDropdown(prev => {
            const newValue = prev === dropdownName ? null : dropdownName;
            localStorage.setItem('openDropdown', newValue || '');
            return newValue;
        });
    }, []);

    const handleItemClick = useCallback((item, parentItem) => {
        setSelectedItem(item);
        setNavOpen(false);
        localStorage.setItem('selectedItem', item);
        if (parentItem) {
            localStorage.setItem('openDropdown', parentItem);
        } else {
            localStorage.setItem('openDropdown', '');
        }
    }, []);

    const handleSearch = useCallback(async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        setIsSearching(true);
        try {
            const response = await fetch(`https://ditq.org/api/search?query=${encodeURIComponent(searchQuery.trim())}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('لم يتم العثور على نتائج');
            }

            const data = await response.json();
            navigate('/search-results', {
                state: {
                    results: data,
                    query: searchQuery.trim()
                }
            });

            setSearchQuery('');
        } catch (error) {
            toast.error(error.message || 'حدث خطأ في البحث');
        } finally {
            setIsSearching(false);
        }
    }, [searchQuery, navigate]);

    const toggleDarkMode = useCallback(() => {
        setIsDarkMode(prev => {
            const newValue = !prev;
            localStorage.setItem('darkMode', newValue);
            return newValue;
        });
    }, []);

    return (
        <>


            <header className={`fixed top-0 left-0 right-0 w-full z-[100] transition-all duration-300 ${isScrolled ? 'dark:bg-gray-800 bg-white backdrop-blur-sm shadow-md' : 'bg-transparent'}`}>
                <nav className="container mx-auto flex items-center justify-between px-4 py-2" dir="rtl">
                    <div className="flex items-center justify-between w-full" dir='rtl'>
                        {/* Left side group for mobile */}
                        <div className="flex items-center gap-2">
                            {/* Mobile Menu Button */}
                            <button
                                className="lg:hidden text-2xl bg-white dark:bg-gray-800 dark:text-white px-2 py-2 rounded"
                                onClick={() => setNavOpen(!navOpen)}
                            >
                                {navOpen ? <FaTimes /> : <FaBars />}
                            </button>

                            {/* Dark Mode Toggle - mobile only */}
                            <button
                                onClick={toggleDarkMode}
                                className="lg:hidden p-2 rounded-full bg-white dark:bg-gray-700 text-gray-800 dark:text-yellow-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200" dir='ltr'
                            >
                                {isDarkMode ? <FaSun /> : <FaMoon />}
                            </button>
                        </div>

                        {/* Logo */}
                        <div className="logo bg-white rounded-full mx-2 flex items-center justify-center" style={{ height: '64px', minWidth: '140px' }}>
                            <Link to="/home" onClick={() => handleItemClick('home')}>
                                <img src={Logo} alt="Logo" className="h-12 md:h-14 max-w-[150px] object-contain" style={{ maxHeight: '56px', minHeight: '40px' }} />
                            </Link>
                        </div>

                        {/* Desktop Menu */}
                        <div className="hidden lg:flex items-center gap-x-8 bg-white dark:bg-gray-800 rounded-full p-2 px-8 flex-nowrap h-16 min-w-[600px]">
                            {menuItems.map((item) => (
                                <div key={item.id} className="relative whitespace-nowrap">
                                    {item.submenu ? (
                                        <div>
                                            <button
                                                onClick={() => toggleDropdown(item.id)}
                                                className={`flex items-center text-lg font-medium hover:text-green-600 dark:hover:text-yellow-400 whitespace-nowrap ${openDropdown === item.id ? 'text-green-600 dark:text-yellow-400' : 'dark:text-white'}`}
                                            >
                                                {item.label} <FaChevronDown className="mr-2" />
                                            </button>
                                            {openDropdown === item.id && (
                                                <ul className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 shadow-lg rounded-lg py-2 z-10">
                                                    {item.submenu.map((subItem) => (
                                                        <li key={subItem.id}>
                                                            <Link
                                                                to={subItem.link}
                                                                className={`block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 whitespace-nowrap ${selectedItem === subItem.id ? 'bg-green-100 dark:bg-gray-700 text-green-600 dark:text-yellow-400' : 'dark:text-white'}`}
                                                                onClick={() => handleItemClick(subItem.id, item.id)}
                                                            >
                                                                {subItem.label}
                                                            </Link>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                    ) : (
                                        <Link
                                            to={item.link}
                                            className={`text-lg font-medium hover:text-green-600 dark:hover:text-yellow-400 whitespace-nowrap ${selectedItem === item.id ? 'text-green-600 dark:text-yellow-400' : 'dark:text-white'}`}
                                            onClick={() => handleItemClick(item.id)}
                                        >
                                            {item.label}
                                        </Link>
                                    )}
                                </div>
                            ))}
                            {/* Desktop Donate Button */}
                            <a
                                href="https://wa.me/+972592889891"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-green-400 dark:bg-yellow-400 text-white dark:text-gray-900 px-4 py-2 rounded-full text-lg hover:bg-green-600 dark:hover:bg-yellow-500 transition-colors duration-300 whitespace-nowrap"
                            >
                                تبرع لنا
                            </a>
                        </div>

                        {/* Right side group for desktop */}
                        <div className="hidden lg:flex items-center gap-4">
                            {/* Dark Mode Toggle - desktop only */}
                            <button
                                onClick={toggleDarkMode}
                                className="p-2 rounded-full bg-white dark:bg-gray-700 text-gray-800 dark:text-yellow-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200 ml-8"
                            >
                                {isDarkMode ? <FaSun /> : <FaMoon />}
                            </button>

                            {/* Search Box */}
                            <form onSubmit={handleSearch} className="search-box bg-white rounded-full">
                                <div className="relative">
                                    <input
                                        type="search"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="بحث..."
                                        className="border border-gray-300 dark:border-gray-600 rounded-full px-4 py-2 pr-10 w-64 focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-yellow-400 dark:bg-gray-700 dark:text-white"
                                        disabled={isSearching}
                                    />
                                    <button
                                        type="submit"
                                        disabled={isSearching}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-green-600"
                                    >
                                        {isSearching ? (
                                            <div className="w-5 h-5 border-t-2 border-green-500 border-solid rounded-full animate-spin" />
                                        ) : (
                                            <SearchIcon className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Mobile Menu */}
                    <div
                        className={`fixed inset-0 bg-white dark:bg-gray-800 z-50 lg:hidden transition-transform duration-300 transform ${navOpen ? 'translate-x-0' : 'translate-x-full'}`}
                    >
                        <div className="flex justify-between items-right p-6 border-b">
                            <button
                                className="text-2xl"
                                onClick={() => setNavOpen(false)}
                            >
                                <FaTimes />
                            </button>
                            <img src={Logo} alt="Logo" className="h-12 max-w-[120px] object-contain" style={{ maxHeight: '48px', minHeight: '36px' }} />
                        </div>
                        <div className="overflow-y-auto h-[calc(100vh-80px)] p-6 bg-white">
                            {menuItems.map((item) => (
                                <div key={item.id} className="mb-4">
                                    {item.submenu ? (
                                        <div>
                                            <button
                                                onClick={() => toggleDropdown(item.id)}
                                                className={`flex items-center w-full text-lg font-medium py-2 ${openDropdown === item.id ? 'text-green-600' : ''}`}
                                            >
                                                {item.icon}
                                                <span className="mr-3">{item.label}</span>
                                                <FaChevronDown className="mr-auto" />
                                            </button>
                                            <div
                                                className={`mt-2 pr-8 space-y-2 ${openDropdown === item.id ? 'block' : 'hidden'}`}
                                            >
                                                {item.submenu.map((subItem) => (
                                                    <Link
                                                        key={subItem.id}
                                                        to={subItem.link}
                                                        className={`block py-2 text-sm ${selectedItem === subItem.id ? 'text-green-600' : ''}`}
                                                        onClick={() => handleItemClick(subItem.id, item.id)}
                                                    >
                                                        {subItem.label}
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <Link
                                            to={item.link}
                                            className={`flex items-center text-lg font-medium py-2 ${selectedItem === item.id ? 'text-green-600' : ''}`}
                                            onClick={() => handleItemClick(item.id)}
                                        >
                                            {item.icon}
                                            <span className="mr-3">{item.label}</span>
                                        </Link>
                                    )}
                                </div>
                            ))}
                            {/* Mobile Donate Button */}
                            <a
                                href="https://wa.me/+972592889891"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block w-full bg-green-400 text-white text-center px-4 py-2 rounded-full text-lg hover:bg-green-600 transition-colors duration-300 mt-4"
                            >
                                تبرع لنا
                            </a>
                        </div>
                    </div>
                </nav>
            </header>
        </>
    );
};

export default Navbar;