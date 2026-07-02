const authService = require("./auth.service");

async function register(req, res, next) {
  try {
    const result = await authService.registerUser(req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

async function setPassword(req, res, next) {
  try {
    const result = await authService.setPassword(req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

async function verifyOtp(req, res, next) {
  try {
    const result = await authService.verifyLoginOtp(req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

async function loginEmailPassword(req, res, next) {
  try {
    const result = await authService.loginWithEmailPassword({ ...req.body, req });
    res.json(result);
  } catch (error) {
    next(error);
  }
}

async function loginEmailOtp(req, res, next) {
  try {
    const result = await authService.loginWithEmailOtp(req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

async function loginPhoneOtp(req, res, next) {
  try {
    const result = await authService.loginWithPhoneOtp(req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

async function resendOtp(req, res, next) {
  try {
    const result = await authService.resendOtp(req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

async function forgotPassword(req, res, next) {
  try {
    const result = await authService.forgotPassword(req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

async function resetPassword(req, res, next) {
  try {
    const result = await authService.resetPassword(req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

async function refreshToken(req, res, next) {
  try {
    const result = await authService.refreshAccessToken(req.body.refreshToken);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

async function logout(req, res, next) {
  try {
    const result = await authService.logoutUser(req.user._id);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  register,
  setPassword,
  verifyOtp,
  loginEmailPassword,
  loginEmailOtp,
  loginPhoneOtp,
  resendOtp,
  forgotPassword,
  resetPassword,
  refreshToken,
  logout,
};
