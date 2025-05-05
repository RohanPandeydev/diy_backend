exports.successResponse = (res, data) => {
    return res.status(200).json(data);
};

exports.serverErrorResponse = (res, data) => {
    return res.status(500).json(data);
};

exports.badRequestResponse = (res, data) => {
    return res.status(400).json(data);
};

exports.unauthorizedResponse = (res, data) => {
    return res.status(401).json(data);
};

exports.forbiddenResponse = (res, data) => {
    return res.status(403).json(data);
};

exports.notFoundResponse = (res, data) => {
    return res.status(404).json(data);
};

exports.handle304 = (error, res) => {
    if (error.message.includes("304")) {
        console.log("304 error received from DB server");
        return res.status(304).send(`Request failed with status code: 304`);
    }
};
