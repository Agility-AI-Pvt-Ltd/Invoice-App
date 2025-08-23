import './App.css'
import {
  BrowserRouter,
  Route,
  Routes,
  useParams
} from "react-router-dom"
import LoginPage from './pages/login.tsx'
import Index from './pages/index.tsx'
import SignUpPage from './pages/signup.tsx'
import TermsOfService from "./pages/TandC.tsx";
import Aboutus from "./pages/Aboutus.tsx";
import { ProfileProvider } from './contexts/ProfileContext'
import { Suspense } from 'react';
import { menuComponentMap } from './lib/menuComponents';
import Layout from '@/layouts/dashboard-layout';
import OTP from './pages/otp.tsx'
import PrivacyPolicy from './pages/PrivacyPolicy';
import UserGuide from './pages/UserGuide.tsx'
import Support from './pages/Support.tsx'
import ContactPage from './pages/Contact.tsx'
// import LoginPage from './pages/login.tsx'
function App() {

  return (
    <ProfileProvider>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Index/>}/>
          <Route path='/T&C' element={<TermsOfService />} />
          <Route path='/about' element={<Aboutus/>} />
          <Route path='/contact' element={<ContactPage/>}/>
          <Route path='/privacy-policy' element={<PrivacyPolicy/>}/>
          <Route path='/userguide' element={<UserGuide/>}/>
          <Route path='/support' element={<Support/>}/>
          <Route path='/login' element={<LoginPage/>}/>
          <Route path='/signup' element={<SignUpPage/>}/>
          <Route path='/signup/verify/otp' element={<OTP/>}/>
          <Route path='/app/:menuItems' element={
            <Layout>
              <DynamicMenuPage />
            </Layout>
          } />
        </Routes>
      </BrowserRouter>
    </ProfileProvider>
  )
}

// Helper component for dynamic menu rendering
function DynamicMenuPage() {
  const { menuItems } = useParams();
  const RenderedComponent = menuItems ? menuComponentMap[menuItems] : null;
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>}>
      {RenderedComponent ? <RenderedComponent /> : <div>Invalid Page</div>}
    </Suspense>
  );
}

export default App
