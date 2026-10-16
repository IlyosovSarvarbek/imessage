import multer from 'multer';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: MAX_FILE_SIZE },
    fileFilter: (req, file, cb) => {
        const isImage = file.mimetype.startsWith('image/');
        const isVideo = file.mimetype.startsWith('video/');
         if (!isImage && !isVideo) {
            return cb(new Error('Only images and videos are allowed'));
        }
        cb(null, true);
    }
});