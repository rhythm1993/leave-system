import { createBrowserRouter, Navigate } from 'react-router-dom';
import { App } from '../App';
import { Login } from '../pages/login';
import { Dashboard } from '../pages/dashboard';
import { LeaveApply } from '../pages/leaveapply';
import { MyApplications } from '../pages/myapplications';
import { PendingApproval } from '../pages/pendingapproval';
import { LeaveCalendar } from '../pages/calendar';
import { Users } from '../pages/users';
import { Profile } from '../pages/profile';

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
      ...(true // Show to all users for now, control by permissions later
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
      // System settings - MVP2 phase
      // {
      //   path: 'settings',
      //   element: <Settings />,
      // },
    ],
  },
]);
