import React from 'react';
import { CheckCircle } from 'lucide-react';

const SuccessMessage = ({ message }) => {
    return (
        <div className="mb-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-3 rtl:space-x-reverse">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <p className="text-sm text-green-700">{message}</p>
            </div>
        </div>
    );
};

export default SuccessMessage; 