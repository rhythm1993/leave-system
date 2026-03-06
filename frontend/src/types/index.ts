export interface User {
  id: string;
  username: string;
  fullName: string;
  email: string;
  role: string;
  department?: string;
}

export interface LeaveApplication {
  id: string;
  applicationNo: string;
  applicantId: string;
  leaveType: 'annual' | 'sick' | 'other';
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: 'pending_endorsement' | 'endorsed' | 'pending_hr_approval' | 'approved' | 'rejected' | 'cancelled';
  createdAt: string;
}
