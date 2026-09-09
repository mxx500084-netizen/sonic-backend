const successResponse = (res, message = "Success", data = null, code = 200) => {
  return res.status(code).json({
    code,
    message,
    data
  });
};

const errorResponse = (res, message = "Error occurred", code = 400, errors = null) => {
  return res.status(code).json({
    code,
    message,
    ...(errors && { errors })
  });
};

module.exports = {
  successResponse,
  errorResponse,
  success: (res, ...args) => {
    if (typeof args[0] === "string") {
      return successResponse(res, args[0], args[1], args[2]);
    } else {
      return successResponse(res, args[1] || "Success", args[0], args[2] || 200);
    }
  },
  error: (res, message = "Error occurred", code = 400, errors = null) => {
    return errorResponse(res, message, code, errors);
  }
};

