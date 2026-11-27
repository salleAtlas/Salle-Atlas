function toManagerAuthResultDto(isAuthenticated, managerEmail) {
  return {
    isAuthenticated: Boolean(isAuthenticated),
    managerEmail: isAuthenticated ? managerEmail : null,
  };
}

module.exports = {
  toManagerAuthResultDto,
};
