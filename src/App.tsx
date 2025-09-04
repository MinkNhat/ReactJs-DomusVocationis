import { useEffect, useRef, useState } from 'react';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import NotFound from 'components/share/not.found';
import LoginPage from 'pages/auth/login';
import RegisterPage from 'pages/auth/register';
import LayoutAdmin from 'components/admin/layout.admin';
import ProtectedRoute from 'components/share/protected-route.ts';
import HomePage from 'pages/home';
import styles from '@/styles/app.module.scss';
import DashboardPage from './pages/admin/dashboard';
import PermissionPage from './pages/admin/permission';
import RolePage from './pages/admin/role';
import UserPage from './pages/admin/user';
import PeriodPage from './pages/admin/period';
import { fetchAccount } from './redux/slice/accountSlide';
import LayoutApp from './components/share/layout.app';
import JobTabs from './pages/admin/job/job.tabs';
import { App as AntdApp } from 'antd';
import LayoutClient from './components/client/layout.client';
import ClientPeriodPage from './pages/client/period';
import ClientPeriodDetailPage from './pages/client/period/detail.period';
import CategoryPage from './pages/admin/category';
import ClientPostPageDetail from './pages/home/detail.home';

export default function App() {
  const dispatch = useAppDispatch();
  const isLoading = useAppSelector(state => state.account.isLoading);

  useEffect(() => {
    if (
      window.location.pathname === '/login'
      || window.location.pathname === '/register'
    )
      return;
    dispatch(fetchAccount())
  }, [])

  const router = createBrowserRouter([
    {
      path: "/",
      element: (<LayoutApp><LayoutClient /></LayoutApp>),
      errorElement: <NotFound />,
      children: [
        { index: true, element: <HomePage /> },
        { path: "/cate/:id", element: <HomePage /> },
        { path: "post/:id", element: <ClientPostPageDetail /> },

        { path: "period", element: <ClientPeriodPage /> },
        { path: "period/:id", element: <ClientPeriodDetailPage /> },
      ],
    },

    {
      path: "/admin",
      element: (<LayoutApp><LayoutAdmin /> </LayoutApp>),
      errorElement: <NotFound />,
      children: [
        {
          index: true, element:
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
        },
        {
          path: "user",
          element:
            <ProtectedRoute>
              <UserPage />
            </ProtectedRoute>
        },
        {
          path: "period",
          element:
            <ProtectedRoute>
              <PeriodPage />
            </ProtectedRoute>
        },
        {
          path: "category",
          element:
            <ProtectedRoute>
              <CategoryPage />
            </ProtectedRoute>
        },

        // {
        //   path: "job",
        //   children: [
        //     {
        //       index: true,
        //       element: <ProtectedRoute><JobTabs /></ProtectedRoute>
        //     },
        //     {
        //       path: "upsert", element:
        //         <ProtectedRoute><ViewUpsertJob /></ProtectedRoute>
        //     }
        //   ]
        // },
        {
          path: "permission",
          element:
            <ProtectedRoute>
              <PermissionPage />
            </ProtectedRoute>
        },
        {
          path: "role",
          element:
            <ProtectedRoute>
              <RolePage />
            </ProtectedRoute>
        }
      ],
    },


    {
      path: "/login",
      element: <LoginPage />,
    },

    {
      path: "/register",
      element: <RegisterPage />,
    },
  ]);

  return (
    <AntdApp>
      <RouterProvider router={router} />
    </AntdApp>
  )
}