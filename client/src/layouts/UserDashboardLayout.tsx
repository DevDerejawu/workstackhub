import { Outlet } from "react-router-dom"

const UserDashboardLayout = () => {
  return (
    <div>
      <h1>Hello, this your dashboard, header</h1>
      <Outlet/>
      <h2>This the footer</h2>
    </div>
  )
}

export default UserDashboardLayout