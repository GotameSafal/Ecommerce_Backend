export const sendToken = async (user, res, message, statusCode) => {
  const token = await user.getjwtToken();
  const options = {
    expiry: new Date(
      Date.now() + process.env.COOKIE_EXPIRY * 24 * 60 * 60 * 100
    ),
    httpOnly: true,
  };
  res.status(statusCode).json({
    success: true,
    message: message,
    token,
  });
};
