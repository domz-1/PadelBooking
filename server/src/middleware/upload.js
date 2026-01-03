const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// Ensure uploads directory exists
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Multer storage - use memory storage so sharp can process the buffer
const storage = multer.memoryStorage();

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|webp|gif/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Only images are allowed (jpeg, jpg, png, webp, gif)'));
    }
});

/**
 * Middleware to convert uploaded images to WebP
 * Handles both single (req.file) and multiple (req.files) uploads
 */
const convertImage = async (req, res, next) => {
    try {
        if (!req.file && (!req.files || req.files.length === 0)) {
            return next();
        }

        const processFile = async (file) => {
            const fileName = `${crypto.randomBytes(16).toString('hex')}.webp`;
            const filePath = path.join(uploadDir, fileName);

            await sharp(file.buffer)
                .webp({ quality: 80 })
                .toFile(filePath);

            // Update file object with new path and filename
            file.path = `uploads/${fileName}`;
            file.filename = fileName;
            file.mimetype = 'image/webp';

            return file.path;
        };

        if (req.file) {
            await processFile(req.file);
        }

        if (req.files) {
            if (Array.isArray(req.files)) {
                // If using upload.array('field')
                await Promise.all(req.files.map(file => processFile(file)));
            } else {
                // If using upload.fields([...])
                const fields = Object.keys(req.files);
                await Promise.all(fields.map(field =>
                    Promise.all(req.files[field].map(file => processFile(file)))
                ));
            }
        }

        next();
    } catch (error) {
        console.error('Image conversion error:', error);
        next(error);
    }
};

module.exports = {
    upload,
    convertImage
};
