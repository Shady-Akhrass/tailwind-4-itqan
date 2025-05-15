import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect } from 'react';

const PrivateRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname ;

    useEffect(() => {
        if (!loading && isAuthenticated) {
            navigate(from, { replace: true });
        }
    }, [loading, isAuthenticated, from, navigate]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
            </div>
        );
    }

    if (!isAuthenticated && !loading) {
        return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }

    return children;
};

export default PrivateRoute;