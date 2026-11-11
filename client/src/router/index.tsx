import {createBrowserRouter} from "react-router-dom";
import {homeRoutes} from "./homeRouter";
import { authRouter } from "./authRouter";
import { userDashboardRoutes } from "./userDashboardRouter";

export const router = createBrowserRouter([
  ...homeRoutes,
  ...authRouter,
  ...userDashboardRoutes
]);