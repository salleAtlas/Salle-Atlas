import { SpaceType } from './space.model';

export type ReservationStatus = 'PENDING' | 'CONFIRMED' | 'EXPIRED';
export type QrStatus = 'VALID' | 'USED' | 'EXPIRED';

export interface Reservation {
  _id: string;
  client_id: string;
  space_id: string;
  reference_code: string;
  space_type: SpaceType;
  date: string;
  start_time: string;
  end_time: string;
  number_of_people: number;
  unit_price_snapshot: number;
  total_amount: number;
  status: ReservationStatus;
  pending_expires_at: string;
  qr_token?: string | null;
  qr_used: boolean;
  qr_used_at?: string | null;
  qr_status?: QrStatus;
}
