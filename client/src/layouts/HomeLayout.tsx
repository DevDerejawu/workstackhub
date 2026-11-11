import { Outlet } from "react-router-dom"
import Footer from "../components/marketing/Footer"
import Navbar from "../components/marketing/Navbar"
const HomeLayout = () => {
  return (
     <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
export default HomeLayout