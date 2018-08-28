import express from 'express';
import formidable from 'formidable';
import cloudinary from 'cloudinary';
import hasScope from '../controllers/scopes';
import loggerUtil from '../lib/logger/winston-util';

const router = express.Router();

cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

//  Endpoint for uploading image and generating the URL for image.

router.post('/upload', async (req, res, next) => {
    try {
        const guid = await hasScope(req, ['image:upload']);
        if (guid) {
            next();
        }
    } catch (err) {
        res.setHeader('status', 401);
        res.setHeader('Content-type', 'application/json');
        res.send(JSON.stringify({ status: 'error', error: err }, null, 3));
    }
}, (req, res) => {
    const form = new formidable.IncomingForm();
    //  specify that we want to allow the user to upload multiple files in a single request
    form.multiples = false;

    //  Set Encoding
    form.encoding = process.env.ENCODING;
    form.keepExtensions = true;
    form.parse(req);

    form.on('file', (name, file) => {
        cloudinary.v2.uploader.upload(file.path, (error, result) => {
            loggerUtil.logInfoInternal('CLOUDINARY_SERVER', 'Requesting cloudinary server');
            if (error) {
                loggerUtil.logErrorInternal('CLOUDINARY_SERVER', 'upload error', error);
                res.setHeader('status', 500);
                res.setHeader('Content-Type', 'application/json');
                res.send(JSON.stringify({
                    status: 'error',
                    error: 'upload to cloudinary server failed',
                }, null, 3));
            } else {
                res.setHeader('status', 200);
                res.setHeader('Content-Type', 'application/json');
                res.send(JSON.stringify({
                    status: 'OK',
                    code: 200,
                    data: {
                        url: result.secure_url,
                    },
                }, null, 3));
            }
        });
    });
});

export default router;
