import { Space } from './space.model';

export interface OpenSpace extends Space {
  space_type: 'open_space';
  total_seats: number;
  price_per_hour_per_seat: number;
  remaining_seats?: number;
}
