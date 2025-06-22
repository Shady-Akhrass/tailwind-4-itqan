// import React from 'react';
// import { useParams } from 'react-router-dom';
// import SectionEditForm from './SectionEditForm';

// const sectionsConfig = {
//     memorization: {
//         name: 'قسم التحفيظ',
//         endpoint: '/memorization/API'
//     },
//     courses: {
//         name: 'قسم الدورات',
//         endpoint: '/course/API'
//     },
//     activities: {
//         name: 'قسم الأنشطة',
//         endpoint: '/activity/API'
//     },
//     creative: {
//         name: 'قسم الإبداع',
//         endpoint: '/creative/API'
//     },
//     diwan: {
//         name: 'قسم الديوان',
//         endpoint: '/diwan/API'
//     }
// };

// const EditSection = () => {
//     const { sectionId } = useParams();
//     const sectionConfig = sectionsConfig[sectionId];

//     if (!sectionConfig) {
//         return (
//             <div className="flex justify-center items-center h-screen">
//                 <div className="text-red-500">القسم غير موجود</div>
//             </div>
//         );
//     }

//     return (
//         <SectionEditForm
//             sectionId={sectionId}
//             sectionName={sectionConfig.name}
//             endpoint={sectionConfig.endpoint}
//         />
//     );
// };

// export default EditSection; 