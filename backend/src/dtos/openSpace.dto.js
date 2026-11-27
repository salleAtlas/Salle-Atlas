class UpdateOpenSpaceDto {
  constructor({ name, description, total_seats, price_per_hour_per_seat } = {}) {
    if (name !== undefined) this.name = String(name).trim();
    if (description !== undefined) this.description = String(description).trim();
    if (total_seats !== undefined) this.total_seats = Number(total_seats);
    if (price_per_hour_per_seat !== undefined) this.price_per_hour_per_seat = Number(price_per_hour_per_seat);
  }
}

module.exports = {
  UpdateOpenSpaceDto,
};
