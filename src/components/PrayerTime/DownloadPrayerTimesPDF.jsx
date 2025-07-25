import { Document, Page, Text, View, StyleSheet, pdf, Font, Image } from '@react-pdf/renderer';
import { useCallback, useState } from 'react';

// Register Tajawal font
Font.register({
    family: 'Tajawal',
    fonts: [
        {
            src: '/fonts/Tajawal-Regular.ttf',
            fontWeight: 'normal'
        },
        {
            src: '/fonts/Tajawal-Bold.ttf',
            fontWeight: 'bold'
        }
    ]
});

// Create styles with emerald/yellow color scheme
const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        backgroundColor: '#F0FDF4',
        padding: 8, // Reduced padding
        fontFamily: 'Tajawal',
    },
    headerContainer: {
        flexDirection: 'row-reverse',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
        padding: 6,
        backgroundColor: '#D1FAE5',
        borderRadius: 5,
        borderWidth: 1,
        borderColor: '#65A30D',
    },
    headerLeft: {
        flex: 1,
        alignItems: 'flex-start',
    },
    headerCenter: {
        flex: 3,
        alignItems: 'center',
    },
    headerRight: {
        flex: 1,
        alignItems: 'flex-end',
    },
    logo: {
        width: 100, // Reduced size
        height: 65,
        objectFit: 'contain',
        marginRight: -8,
    },
    headerTitle: {
        color: '#065F46',
        fontSize: 14, // Reduced font size
        fontWeight: 'bold',
        fontFamily: 'Tajawal',
        marginBottom: 2,
        textAlign: 'center',
    },
    subHeaderText: {
        color: '#065F46',
        fontSize: 9, // Reduced font size
        fontFamily: 'Tajawal',
        textAlign: 'center',
    },
    brandText: {
        marginTop: 4,
        color: '#065F46',
        fontSize: 14, // Reduced font size
        fontFamily: 'Tajawal',
        fontWeight: 'bold',
        textAlign: 'right',
    },
    yearText: {
        color: '#065F46',
        fontSize: 8, // Reduced font size
        fontFamily: 'Tajawal',
        textAlign: 'center',
        marginTop: 2,
    },
    table: {
        display: 'table',
        width: 'auto',
        borderStyle: 'solid',
        borderWidth: 1,
        borderColor: '#059669',
        marginTop: 6,
        borderRadius: 4,
        overflow: 'hidden',
        direction: 'rtl',
    },
    tableRow: {
        flexDirection: 'row-reverse',
        minHeight: 'auto', // Allow dynamic height
    },
    tableHeader: {
        backgroundColor: '#059669',
    },
    headerCell: {
        flex: 1,
        padding: '6 3', // Optimized padding
        borderWidth: 0.5, // Thinner borders
        borderColor: '#A7F3D0',
        textAlign: 'center',
        fontSize: 12, // Smaller font
        fontFamily: 'Tajawal',
        fontWeight: 'bold',
        color: '#FFFFFF',
        minHeight: 25, // Reduced height
        justifyContent: 'center',
        alignItems: 'center',
    },
    tableCell: {
        flex: 1,
        padding: '4 1', // Minimal padding
        borderWidth: 0.5, // Thinner borders
        borderColor: '#A7F3D0',
        textAlign: 'center',
        fontSize: 11.5, // Smaller font for better fit
        fontFamily: 'Tajawal',
        fontWeight: 'normal',
        minHeight: 18, // Reduced height
        justifyContent: 'center',
        alignItems: 'center',
        wordWrap: 'break-word',
    },
    // Specific column widths for better content fitting
    dayColumn: {
        flex: 0.7, // Narrower for day names
        padding: '4 1',
        fontSize: 9,
    },
    gregorianDateColumn: {
        flex: 1.1, // Medium width for Gregorian dates
        padding: '4 2',
        fontSize: 9,
    },
    hijriDateColumn: {
        flex: 1.1, // Medium width for Hijri dates
        padding: '4 2',
        fontSize: 9,
    },
    prayerTimeColumn: {
        flex: 0.8, // Compact for prayer times
        padding: '4 1',
        fontSize: 9.5,
        fontWeight: 'bold', // Make prayer times stand out
    },
    oddRow: {
        backgroundColor: '#F0FDF4',
    },
    evenRow: {
        backgroundColor: '#D1FAE5',
    },
    watermark: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        color: '#059669',
        fontSize: 35, // Slightly smaller
        opacity: 0.03,
        transform: 'translate(-50%, -50%) rotate(-45deg)',
        zIndex: -1,
    },
    footer: {
        marginTop: 6,
        alignItems: 'center',
    },
    footerText: {
        fontSize: 6, // Smaller footer text
        color: '#065F46',
        textAlign: 'center',
        fontFamily: 'Tajawal',
    },
});

const arabicMonths = [
    '',
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
];

const arabicDays = [
    'الأحد',
    'الإثنين',
    'الثلاثاء',
    'الأربعاء',
    'الخميس',
    'الجمعة',
    'السبت'
];

function toArabicNumber(num) {
    return String(num).replace(/[0-9]/g, d =>
        '٠١٢٣٤٥٦٧٨٩'[d]
    );
}

const MyDocument = ({ prayerCalendar, prayerNamesArabic }) => {
    const city = prayerCalendar?.[0]?.meta?.timezone || '';
    const hijriMonth = prayerCalendar?.[0]?.date?.hijri?.month?.ar || '';
    const hijriYear = prayerCalendar?.[0]?.date?.hijri?.year || '';
    const gregorianYear = prayerCalendar?.[0]?.date?.gregorian?.year || '';

    return (
        <Document>
            <Page size="A4" orientation="portrait" style={styles.page}>
                {/* Watermark */}
                <Text style={styles.watermark}>دار الإتقان</Text>

                {/* Fixed 3-column header layout with RTL */}
                <View style={styles.headerContainer}>
                    {/* Right column (first in RTL) - Brand name */}
                    <View style={styles.headerLeft}>
                        <Text style={styles.brandText}>امساكية الاتقان</Text>
                    </View>

                    {/* Center column - Month info and years */}
                    <View style={styles.headerCenter}>
                        <Text style={styles.headerTitle}>جدول أوقات الصلاة - شهر {hijriMonth}</Text>
                        <Text style={styles.subHeaderText}>{city}</Text>
                        <Text style={styles.yearText}>
                            العام الهجري: {toArabicNumber(hijriYear)} هـ | العام الميلادي: {toArabicNumber(gregorianYear)} م
                        </Text>
                    </View>

                    {/* Left column (last in RTL) - Logo */}
                    <View style={styles.headerRight}>
                        <Image src="/logo.png" style={styles.logo} />
                    </View>
                </View>

                {/* Prayer times table */}
                <View style={styles.table}>
                    {/* Table header */}
                    <View style={[styles.tableRow, styles.tableHeader]}>
                        <View style={styles.headerCell}>
                            <Text>اليوم</Text>
                        </View>
                        <View style={styles.headerCell}>
                            <Text>التاريخ الميلادي</Text>
                        </View>
                        <View style={styles.headerCell}>
                            <Text>التاريخ الهجري</Text>
                        </View>
                        {Object.entries(prayerNamesArabic).map(([key, name], index) => (
                            <View key={key} style={styles.headerCell}>
                                <Text>{name}</Text>
                            </View>
                        ))}
                    </View>

                    {/* Table rows with proper day name calculation */}
                    {prayerCalendar?.map((item, rowIndex) => {
                        // Parse the date properly to get correct day of week
                        const dateStr = item.date.gregorian.date;
                        const [day, month, year] = dateStr.split('-').map(Number);
                        const date = new Date(year, month - 1, day); // month - 1 because JS months are 0-indexed
                        const dayOfWeek = date.getDay(); // 0 is Sunday, 6 is Saturday
                        const arabicDayName = arabicDays[dayOfWeek];

                        return (
                            <View key={rowIndex} style={[styles.tableRow, rowIndex % 2 === 0 ? styles.evenRow : styles.oddRow]}>
                                {/* Day name column */}
                                <View style={styles.tableCell}>
                                    <Text>{arabicDayName}</Text>
                                </View>

                                {/* Gregorian date column */}
                                <View style={styles.tableCell}>
                                    <Text>{`${toArabicNumber(item.date.gregorian.day)} ${arabicMonths[parseInt(item.date.gregorian.month.number)]}`}</Text>
                                </View>

                                {/* Hijri date column */}
                                <View style={styles.tableCell}>
                                    <Text>{`${toArabicNumber(item.date.hijri.day)} ${item.date.hijri.month.ar}`}</Text>
                                </View>

                                {/* Prayer times columns */}
                                {Object.keys(prayerNamesArabic).map((prayer, colIndex) => {
                                    const time = item.timings?.[prayer]?.split(' ')[0];
                                    return (
                                        <View key={`${prayer}-${colIndex}`} style={styles.tableCell}>
                                            <Text>{time ? toArabicNumber(time.replace(/\s/g, '')) : '-'}</Text>
                                        </View>
                                    );
                                })}
                            </View>
                        );
                    })}
                </View>


            </Page>
        </Document>
    );
};

const DownloadPrayerTimesPDF = ({ prayerCalendar, prayerNamesArabic }) => {
    const [isLoading, setIsLoading] = useState(false);

    const handleDownload = useCallback(async () => {
        if (!prayerCalendar?.length) {
            alert('لا توجد بيانات متاحة للتحميل');
            return;
        }

        setIsLoading(true);
        try {
            const blob = await pdf(
                <MyDocument
                    prayerCalendar={prayerCalendar}
                    prayerNamesArabic={prayerNamesArabic}
                />
            ).toBlob();

            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `امساكية الاتقان.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('حدث خطأ أثناء إنشاء ملف PDF');
        } finally {
            setIsLoading(false);
        }
    }, [prayerCalendar, prayerNamesArabic]);

    return (
        <div className="w-full flex justify-center my-8">
            <button
                onClick={handleDownload}
                disabled={!prayerCalendar?.length || isLoading}
                className={`${!prayerCalendar?.length || isLoading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-emerald-700 to-emerald-500 hover:from-emerald-800 hover:to-emerald-600 border-2 border-emerald-800"
                    } text-white font-bold py-3 px-8 rounded-2xl shadow-xl text-lg transition-colors duration-200`}
            >
                {isLoading
                    ? 'جاري إنشاء الملف...'
                    : !prayerCalendar?.length
                        ? 'لا توجد بيانات متاحة للتحميل'
                        : 'تحميل امساكية الاتقان PDF'
                }
            </button>
        </div>
    );
};

export default DownloadPrayerTimesPDF;