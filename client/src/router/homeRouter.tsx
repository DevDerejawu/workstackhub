import HomePage from "../pages/HomePage"
import HomeLayout from "../layouts/HomeLayout"
export const homeRoutes = [
  {
    path: "/",
    element: <HomeLayout />,
    children: [
      {
        path: "/",
        element: <HomePage />,
      },
    ],
  },
 ]