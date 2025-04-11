const errorHandle = (error, req, res, next) => {
    const status = error.status || 500;
    let message = error.message || "An unexpected error occurred";
  
    if (status === 400) {
      message = `${JSON.stringify(
        error.fields.body
      )}: This payload is not accepted, Required Payloads: ${
        error.fields.required
      }`;
    }
    
  
    res.status(status).json({
      message: message,
    });
  };
  
  module.exports = errorHandle;