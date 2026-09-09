const success = (res, data = null, message = "Success", statusCode = 200) => {
  return res.status(statusCode).json({
    status: true,
    message,
    data,
  });
};

const error = (res, message = "Something went wrong", statusCode = 400, errors = null) => {
  const payload = { status: false, message };
  if (errors) payload.errors = errors;
  return res.status(statusCode).json(payload);
};

module.exports = { success, error };
