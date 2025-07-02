import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import Layout from '@/components/organisms/Layout'
import Dashboard from '@/components/pages/Dashboard'
import Farms from '@/components/pages/Farms'
import Crops from '@/components/pages/Crops'
import Tasks from '@/components/pages/Tasks'
import Finance from '@/components/pages/Finance'
import Weather from '@/components/pages/Weather'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background">
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/farms" element={<Farms />} />
            <Route path="/crops" element={<Crops />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/finance" element={<Finance />} />
            <Route path="/weather" element={<Weather />} />
          </Routes>
        </Layout>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </div>
    </Router>
  )
}

export default App