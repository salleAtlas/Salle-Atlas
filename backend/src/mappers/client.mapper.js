function toClientDto(doc) {
  if (!doc) return null;
  return {
    _id: doc._id,
    first_name: doc.first_name,
    last_name: doc.last_name,
    email: doc.email,
    phone: doc.phone || '',
    createdAt: doc.createdAt,
  };
}

module.exports = {
  toClientDto,
};
