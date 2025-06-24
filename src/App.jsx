import React, { lazy } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation
} from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import PrivateRoute from './components/Admin/private/privateRoute';
import { AuthProvider } from './components/Admin/context/AuthContext';
import DynamicSection from './components/ItqnSections/DynamicSection';

const Header = lazy(() => import('./components/Base/Header'));
const AllNewsPage = lazy(() => import('./components/news/NewsCards'));
const NewsDetails = lazy(() => import('./components/news/NewsDetails'));
const Footer = lazy(() => import('./components/Base/Footer'));
const Home = lazy(() => import('./components/Home/Home'));
const FloatingButtons = lazy(() => import('./components/Home/FloatingButtons'));
const Clues = lazy(() => import('./components/Clues/Clues'));
const ContactSection = lazy(() => import('./components/Contact/ContactSection'));
const Speech = lazy(() => import('./components/About/Speech'));
const Branches = lazy(() => import('./components/About/Branches'));
const Mission = lazy(() => import('./components/About/Mission'));
const Directors = lazy(() => import('./components/About/Directors'));
const Login = lazy(() => import('./components/Admin/auth/Login'));
const SectionsManagement = lazy(() => import('./components/Admin/sections/SectionsManagement'));
const EditSection = lazy(() => import('./components/Admin/sections/EditSection'));
const AdminLayout = lazy(() => import('./components/Admin/layout/AdminLayout'));
const Dashboard = lazy(() => import('./components/Admin/dashboard/Dashboard'));
const NewsManagement = lazy(() => import('./components/Admin/news/NewsManagement'));
const NewsEditForm = lazy(() => import('./components/Admin/news/NewsEditForm'));
const HomeManagement = lazy(() => import('./components/Admin/home/HomeManagement'));
const DonateManagement = lazy(() => import('./components/Admin/home/DonateManagement'));
const GeniusManagement = lazy(() => import('./components/Admin/home/GeniusManagement'));
const CluesManagement = lazy(() => import('./components/Admin/clues/CluesManagement'));
const SpeechManagement = lazy(() => import('./components/Admin/speech/SpeechManagment'));
const DirectorManagement = lazy(() => import('./components/Admin/Director/DirectorManagement'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 60 * 24,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function Layout() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="font-tajawal leading-normal tracking-normal flex flex-col min-h-screen">
      {!isAdminRoute && <Header />}
      <main>
        <Routes>
          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/home" replace />} />

          {/* Handle /itqan redirects */}
          <Route path="/itqan" element={<Navigate to="/home" replace />} />
          <Route
            path="/itqan/:path/*"
            element={<Navigate to={`/${window.location.pathname.split('/itqan/')[1] || ''}`} replace />}
          />

          {/* Regular routes */}
          <Route path="/home" element={<Home />} />
          <Route path="/news" element={<AllNewsPage />} />
          <Route path="/news/:title/details" element={<NewsDetails />} />
          <Route path="/news/:id/details" element={<NewsDetails />} />
          <Route path="/clues" element={<Clues />} />
          <Route path="/contact-us" element={<ContactSection />} />
          <Route path="/speech" element={<Speech />} />
          <Route path="/branche" element={<Branches />} />
          <Route path="/vision" element={<Mission />} />
          <Route path="/director" element={<Directors />} />
          <Route path="/:title" element={<DynamicSection />} />

          {/* Admin routes */}
          <Route path="/admin/login" element={<Login />} />

          {/* Protected Admin routes */}
          <Route path="/admin" element={
            <PrivateRoute>
              <AdminLayout />
            </PrivateRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="sections" element={<SectionsManagement />} />
            <Route path="sections/edit/:sectionId" element={<EditSection />} />
            <Route path="home" element={<HomeManagement />} />
            <Route path="donate" element={<DonateManagement />} />
            <Route path="genius" element={<GeniusManagement />} />
            <Route path="clues" element={<CluesManagement />} />
            <Route path="speech" element={<SpeechManagement />} />
            <Route path="news">
              <Route index element={<NewsManagement />} />
              <Route path="new" element={<NewsEditForm />} />
              <Route path="edit/:newsId" element={<NewsEditForm />} />
            </Route>
            <Route path="directors" element={<DirectorManagement />} />
          </Route>
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </main>
      {!isAdminRoute && <FloatingButtons />}
      {!isAdminRoute && <Footer />}
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Layout />
        </Router>
        {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
