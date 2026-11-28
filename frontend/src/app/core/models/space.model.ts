export type SpaceType = 'room' | 'open_space';

export interface Space {
  _id: string;
  space_type: SpaceType;
  name: string;
  description: string;
  is_active: boolean;
}
