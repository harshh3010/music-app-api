exports.testRoute = (req, res, next) => {
    res.status(200).json({
        status: 'success',
        message: 'Works!'
    });
};