import { createBrowserRouter, Navigate } from 'react-router-dom';
import { App } from '../App';
import { Login } from '../pages/Login';
import { Dashboard } from '../pages/Dashboard';
import { LeaveApply } from '../pages/LeaveApply';
import { MyApplications } from '../pages/MyApplications';
import { PendingApproval } from '../pages/PendingApproval';
import { LeaveCalendar } from '../pages/Calendar';
import { Users } from '../pages/Users';
import { Profile } from '../pages/Profile';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <Dashboard />,
      },
      {
        path: 'leave/apply',
        element: <LeaveApply />,
      },
      {
        path: 'leave/my-applications',
        element: <MyApplications />,
      },
      {
        path: 'leave/pending-approval',
        element: <PendingApproval />,
      },
      {
        path: 'calendar',
        element: <LeaveCalendar />,
      },
      ...(true // 暂时显示给所有用户，后续根据权限控制
        ? [
            {
              path: 'users',
              element: <Users />,
            },
          ]
        : []),
      {
        path: 'profile',
        element: <Profile />,
      },
      // 系统设置 - MVP2阶段实现
      // {
      //   path: 'settings',
      //   element: <Settings />,
      // },
    ],
  },
]);
