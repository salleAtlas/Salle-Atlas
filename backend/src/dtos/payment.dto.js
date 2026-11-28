class CreateCheckoutSessionDto {
  constructor(body = {}) {
    this.reservation_id = body.reservation_id ? String(body.reservation_id).trim() : '';
  }
}

module.exports = {
  CreateCheckoutSessionDto,
};
