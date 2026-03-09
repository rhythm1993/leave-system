# Leave Application System

An employee leave application and management system designed for small and medium-sized enterprises, supporting multi-level approval workflows, unified balance management, and calendar views.

## Features

### Core Features
- **User Authentication** - JWT Token-based login
- **Role-based Permissions** - Three roles: System Admin, HR, and Staff
- **Leave Applications** - Support for 8 leave types (Annual, Sick, Marriage, Maternity, Paternity, Compassionate, Unpaid, Other)
- **Unified Balance** - All leave types share a unified balance pool
- **Multi-level Approval** - PM endorsement + HR approval workflow
- **Leave Calendar** - Visual display of team leave schedules
- **User Profile** - View and edit personal information and password

### Tech Stack

#### Frontend
- React 18 + TypeScript
- Vite build tool
- Ant Design 5 UI component library
- Zustand state management
- React Router for routing
- Axios HTTP client
- Dayjs for date handling

#### Backend
- Node.js + Express
- JavaScript (ES Module)
- JWT authentication
- RESTful API design

## Project Structure

```
leave-system/
├── frontend/          # Frontend React application
│   ├── src/
│   │   ├── pages/         # Page components
│   │   │   ├── Login/           # Login page
│   │   │   ├── Dashboard/       # Dashboard
│   │   │   ├── LeaveApply/      # Apply for leave
│   │   │   ├── MyApplications/  # My applications
│   │   │   ├── PendingApproval/ # Pending approval
│   │   │   ├── Calendar/        # Leave calendar
│   │   │   ├── Users/           # User management
│   │   │   └── Profile/         # User profile
│   │   ├── router/        # Route configuration
│   │   ├── store/         # State management
│   │   ├── types/         # TypeScript type definitions
│   │   └── mock/          # Mock data
│   ├── package.json
│   └── vite.config.ts
│
├── backend/           # Backend Node.js service
│   ├── src/
│   │   ├── routes/        # API routes
│   │   │   ├── auth.js          # Authentication APIs
│   │   │   ├── users.js         # User APIs
│   │   │   ├── leaveApplications.js  # Leave application APIs
│   │   │   ├── balances.js      # Balance APIs
│   │   │   └── calendar.js      # Calendar APIs
│   │   └── mock/          # Mock data
│   ├── package.json
│   └── .npmrc
│
└── README.md
```

## Quick Start

### Requirements
- Node.js >= 18.0.0
- npm >= 9.0.0

### Install Dependencies

```bash
# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

### Start Development Servers

```bash
# Start backend (port 3001)
cd backend
npm run dev

# New terminal - Start frontend (port 5173)
cd frontend
npm run dev
```

### Access the Application

- Frontend: http://localhost:5173
- Backend API: http://localhost:3001/api/v1

## Default Accounts

| Username | Password | Role |
|----------|----------|------|
| admin | password123 | System Admin |
| wenny | password123 | HR |
| alex | password123 | Staff |
| lisa | password123 | Staff |
| tom | password123 | Staff |

## Main Modules

### 1. Dashboard
- Statistics cards (pending approvals, monthly leave days, remaining leave, team members)
- Quick action buttons (apply for leave, view calendar, my applications)
- Pending approval list
- System announcements

### 2. Leave Management
- **Apply for Leave** - Select leave type, fill in time period, upload supporting documents
- **My Applications** - View historical application records, filter by status, cancel applications
- **Pending My Approval** - PM/HR approval interface, approve/reject actions

### 3. Leave Calendar
- Monthly calendar view showing team leave status
- Filter by leave type
- Click date to view leave details for that day

### 4. User Management (HR/Admin only)
- User list query
- Add/edit/delete users
- Role assignment

### 5. User Profile
- View basic information
- Edit personal profile
- Change password
- View leave balance
- View recent activities

## Leave Types

| Type | Code | Requires Proof | Description |
|------|------|----------------|-------------|
| Annual Leave | annual | No | Paid annual leave |
| Sick Leave | sick | Yes | Medical certificate required |
| Marriage Leave | marriage | Yes | Marriage certificate required |
| Maternity Leave | maternity | Yes | Hospital certificate required |
| Paternity Leave | paternity | Yes | Birth certificate required |
| Compassionate Leave | compassionate | No | Bereavement leave for immediate family |
| Unpaid Leave | unpaid | No | Unpaid time off |
| Other | other | No | Special circumstances |

## Business Processes

### Standard Leave Process
```
Employee submits application → System checks balance → Notify PM for endorsement → PM endorses → Notify HR for approval → HR approves → Deduct balance → Complete
```

### Balance Calculation Rules
- All leave types share a unified balance pool
- Total quota set by HR during initialization (default 20 days)
- Each leave application deducts the corresponding days
- Canceling approved applications returns the balance

## API Documentation

### Authentication APIs
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/logout` - User logout

### User APIs
- `GET /api/v1/users` - Get user list
- `POST /api/v1/users` - Create user
- `PUT /api/v1/users/:id` - Update user
- `DELETE /api/v1/users/:id` - Delete user

### Leave Application APIs
- `GET /api/v1/leave-applications` - Get application list
- `POST /api/v1/leave-applications` - Submit application
- `POST /api/v1/leave-applications/:id/cancel` - Cancel application
- `POST /api/v1/leave-applications/:id/endorse` - PM endorsement
- `POST /api/v1/leave-applications/:id/hr-approve` - HR approval

### Balance APIs
- `GET /api/v1/balances` - Query balance
- `POST /api/v1/balances/adjust` - Adjust balance

### Calendar APIs
- `GET /api/v1/calendar/events` - Get calendar events

## Development Roadmap

### MVP1 (Completed)
- [x] Basic authentication and authorization
- [x] User management
- [x] Leave application process (8 types)
- [x] Unified balance management
- [x] Multi-level approval workflow
- [x] Leave calendar
- [x] User profile

### MVP2 (Planned)
- [ ] Mobile responsiveness optimization
- [ ] Advanced calendar filtering
- [ ] Resource management board
- [ ] Automatic email reminders
- [ ] Excel import/export
- [ ] System settings module

### MVP3 (Future)
- [ ] Customizable workflows
- [ ] Multi-language support
- [ ] Enterprise AD integration
- [ ] Data analytics reports
- [ ] Mobile App

## Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## License

MIT License

## Contact

For questions or suggestions, please submit an Issue.
