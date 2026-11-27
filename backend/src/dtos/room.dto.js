function toList(value) {
  if (value === undefined || value === '') return [];
  if (Array.isArray(value)) return value;
  return [value];
}

function getPhotos(files) {
  const photos = [];
  for (const file of files || []) {
    photos.push('/uploads/rooms/' + file.filename);
  }
  return photos;
}

class CreateRoomDto {
  constructor(body = {}, files = []) {
    this.name = String(body.name || '').trim();
    this.description = String(body.description || '').trim();
    this.capacity = Number(body.capacity);
    this.price_per_hour = Number(body.price_per_hour);
    this.equipments = toList(body.equipments);
    this.photos = getPhotos(files);
    this.is_active = true;
  }
}

class UpdateRoomDto {
  constructor(body = {}, files = []) {
    this.name = String(body.name || '').trim();
    this.description = String(body.description || '').trim();
    this.capacity = Number(body.capacity);
    this.price_per_hour = Number(body.price_per_hour);
    this.equipments = toList(body.equipments);
    this.is_active = body.is_active === true || body.is_active === 'true' || body.is_active === 'on';
    const photos = getPhotos(files);
    if (photos.length > 0) this.photos = photos;
  }
}

module.exports = {
  CreateRoomDto,
  UpdateRoomDto,
};
