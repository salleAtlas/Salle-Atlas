import { Space } from './space.model';
import { Equipment } from './equipment.model';

export interface Room extends Space {
  space_type: 'room';
  capacity: number;
  price_per_hour: number;
  photos: string[];
  equipments: Equipment[] | string[];
}
