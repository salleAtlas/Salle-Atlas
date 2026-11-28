export type PaymentStatus = 'PENDING' | 'SUCCESSFUL' | 'FAILED';

export interface Payment {
  _id: string;
  reservation_id: string;
  stripe_session_id: string;
  amount: number;
  payment_date?: string | null;
  status: PaymentStatus;
}
