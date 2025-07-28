import './App.css'
import {
  BrowserRouter,
  Route,
  Routes
} from "react-router-dom"
import LoginPage from './pages/login.tsx'
import Dashboard from './pages/dashboard.tsx'
import Index from './pages/index.tsx'
import SignUpPage from './pages/signup.tsx'
import { ProfileProvider } from './contexts/ProfileContext'
// import LoginPage from './pages/login.tsx'
function App() {

  return (
    <ProfileProvider>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Index/>}/>
          <Route path='/login' element={<LoginPage/>}/>
          <Route path='/signup' element={<SignUpPage/>}/>
          <Route path='/app/:menuItems' element={<Dashboard/>}/>
        </Routes>
      </BrowserRouter>
    </ProfileProvider>
  )
}

export default App
