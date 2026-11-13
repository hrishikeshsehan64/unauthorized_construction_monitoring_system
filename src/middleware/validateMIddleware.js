const validateCreateSite = (req, res, next) => {
    const { site_name, address, latitude, longitude } = req.body || {};
    // this middleware see if all the things present in the req.body here we don't need to check
    // fields like site_id and created_at because they are automatically generated



    // abhi ye condtion valid address and site_name check karega
    if (
        typeof site_name !== "string" ||
        typeof address !== "string" ||
        !site_name.trim() ||
        !address.trim()
    ) {
        return res.status(400).json({
            error: "Site name and address are required and must be valid strings"
        });
    }

    // ye latitude aur longitude ki validity check karega
    if (
        !Number.isFinite(latitude) ||
        !Number.isFinite(longitude) ||
        latitude < -90 ||
        latitude > 90 ||
        longitude < -180 ||
        longitude > 180
    ) {
        return res.status(400).json({
            error: "Invalid latitude or longitude"
        });
    }

    next();
};

const validateUpdateSite = (req, res, next) => {
    const { site_name, address, latitude, longitude } = req.body || {};

    if (Object.keys(req.body || {}).length === 0) {
        return res.status(400).json({
            error: "At least one field is required"
        });
    }
    // after creating the site this middleware tries to check
    // the field which we are updating are valid or not
    if (site_name !== undefined &&
        (typeof site_name !== "string" || !site_name.trim())) {
        return res.status(400).json({
            error: "Invalid site name"
        });
    }

    if (address !== undefined &&
        (typeof address !== "string" || !address.trim())) {
        return res.status(400).json({
            error: "Invalid address"
        });
    }

    if (latitude !== undefined &&
        (!Number.isFinite(latitude) || latitude < -90 || latitude > 90)) {
        return res.status(400).json({
            error: "Invalid latitude"
        });
    }

    if (longitude !== undefined &&
        (!Number.isFinite(longitude) || longitude < -180 || longitude > 180)) {
        return res.status(400).json({
            error: "Invalid longitude"
        });
    }

    next();
};


const validateCreateSurvey = (req,res,next) =>{
    const { site_id, survey_date, survey_status, remarks } = req.body;

    // this make sure that whatever we are creating in the survey is valid or not 
    if (!Number.isInteger(site_id) || site_id <= 0) {
        return res.status(400).json({
            error: "site_id is required and must be a positive integer"
        });
    }
    if (survey_date !== undefined && (!survey_date || isNaN(Date.parse(survey_date)))) {
        return res.status(400).json({
        error: "Invalid survey date"
    });
    }
    const allowedStatuses = ["PENDING", "COMPLETED", "CANCELLED"];
    if (survey_status !== undefined && (typeof(survey_status) !== 'string' || !allowedStatuses.includes(survey_status))) {
        return res.status(400).json({
            error: "Invalid survey status"
        });
    }
    if (remarks !== undefined && remarks !== null && typeof remarks !== "string") {
        return res.status(400).json({
            error: "Remarks must be a string"
        });
    }

    next();
}

module.exports = { validateCreateSite, validateUpdateSite, validateCreateSurvey };
