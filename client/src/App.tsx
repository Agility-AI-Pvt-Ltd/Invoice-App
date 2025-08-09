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
import { ProfileProvider } from './contexts/ProfileContext'
import { Suspense } from 'react';
import { menuComponentMap } from './lib/menuComponents';
import Layout from '@/layouts/dashboard-layout';
// import LoginPage from './pages/login.tsx'
function App() {

  return (
    <ProfileProvider>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Index/>}/>
          <Route path='/login' element={<LoginPage/>}/>
          <Route path='/signup' element={<SignUpPage/>}/>
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
