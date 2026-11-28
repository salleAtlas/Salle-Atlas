function toCheckoutResponse(session, payment) {
  return {
    checkout_url: session.url,
    session_id: session.id,
    payment_id: payment._id,
  };
}

function toReservationStatusResponse(reservation) {
  return {
    _id: reservation._id,
    reference_code: reservation.reference_code,
    space_id: reservation.space_id,
    space_type: reservation.space_type,
    date: reservation.date,
    start_time: reservation.start_time,
    end_time: reservation.end_time,
    number_of_people: reservation.number_of_people,
    unit_price_snapshot: reservation.unit_price_snapshot,
    total_amount: reservation.total_amount,
    status: reservation.status,
    pending_expires_at: reservation.pending_expires_at,
    qr_used: reservation.qr_used,
  };
}

module.exports = {
  toCheckoutResponse,
  toReservationStatusResponse,
};
