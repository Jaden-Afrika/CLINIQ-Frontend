import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import PatientHome from './pages/patient/PatientHome'
import AdminHome from './pages/admin/AdminHome'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<PatientHome />} />
          <Route path="admin" element={<AdminHome />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App