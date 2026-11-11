import UserDashboardLayout from "../layouts/UserDashboardLayout"
import UserDashboard from "../pages/UserDashboard"
export const userDashboardRoutes = [
  {
    path: '/dashboard',
    element: <UserDashboardLayout />,
    children: [
    {
      path:'/dashboard',
     element:<UserDashboard/>
    }
    ]
  }
]