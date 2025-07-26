import './App.css'
import {
  BrowserRouter,

  Route,
  Routes
} from "react-router-dom"
import LoginPage from './pages/login.tsx'
import Dashboard from './pages/dashboard.tsx'
import SignUpPage from './pages/signup.tsx'
// import LoginPage from './pages/login.tsx'
function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<LoginPage/>}/>
        <Route path='/login' element={<LoginPage/>}/>
        <Route path='/signup' element={<SignUpPage/>}/>
        <Route path='/app/:menuItems' element={<Dashboard/>}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App
