
class ErrorHandler {
    static getNotFound(res, message = 'Resource not found') {
        res.status(404).json({message: message});
    }

    static getInternalError(res, error, message = 'Internal Server Error') {
        res.status(500).json({ message: message, error: error.message });
    }

    static getConflictError(res, message = 'Conflict with the resource') {
        res.status(409).json({ message: message });
    }

    static getUnauthorized(res, message = 'Not valid authentication credentials') {
        res.status(401).json({ message: message });
    }
}

module.exports = ErrorHandler;