class RegisterClientDto {
  constructor({ first_name, last_name, email, password, phone } = {}) {
    this.first_name = String(first_name || '').trim();
    this.last_name = String(last_name || '').trim();
    this.email = String(email || '').trim().toLowerCase();
    this.password = String(password || '');
    this.phone = phone ? String(phone).trim() : '';
  }
}

class LoginClientDto {
  constructor({ email, password } = {}) {
    this.email = String(email || '').trim().toLowerCase();
    this.password = String(password || '');
  }
}

module.exports = {
  RegisterClientDto,
  LoginClientDto,
};
