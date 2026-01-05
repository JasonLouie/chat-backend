import cloudinary from "../../config/cloudinary.js";
import type { ImageFolder } from "../types/common.js";

const uploadToCloudinary = (buffer: Buffer, folder: ImageFolder): Promise<string> => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder
            },
            (error, result) => {
                if (error) return reject(error);
                if (result) return resolve(result.secure_url);
            }
        );
        uploadStream.end(buffer);
    });
};

export default {
    uploadToCloudinary
};