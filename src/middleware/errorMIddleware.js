const errorMiddleware = (err, req, res, next) => {
    console.error(err.stack);
    // .stack help us to know where and when the error occurred

    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    // .message contains the error message to be sent in the response

    res.status(statusCode).json({
        success: false,
        error: message
    });
};

module.exports = errorMiddleware;
