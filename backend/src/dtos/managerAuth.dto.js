class ManagerLoginDto {
  constructor({ email, password } = {}) {
    this.email = String(email || '').trim().toLowerCase();
    this.password = String(password || '');
  }
}

module.exports = {
  ManagerLoginDto,
};
