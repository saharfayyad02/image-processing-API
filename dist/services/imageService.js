"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resizeImage = resizeImage;
// src/services/imageService.ts
const fs_1 = __importDefault(require("fs"));
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const sharp_1 = __importDefault(require("sharp"));
/**
 * Resize an image stored in images/full/<filename>.jpg to width x height,
 * caching result to images/thumb/<filename>-<width>x<height>.jpg
 *
 * @returns absolute path to the cached thumbnail
 */
async function resizeImage(filename, width, height) {
    const projectRoot = path_1.default.resolve(__dirname, '../..'); // root of project
    const fullDir = path_1.default.join(projectRoot, 'images', 'full');
    const thumbDir = path_1.default.join(projectRoot, 'images', 'thumb');
    // Accept both with and without extension, but for this project we use .jpg
    const sourcePath = path_1.default.join(fullDir, `${filename}.jpg`);
    // Validate source exists
    try {
        await promises_1.default.access(sourcePath, fs_1.default.constants.R_OK);
    }
    catch {
        throw new Error('Source image not found');
    }
    // Ensure thumb folder exists
    await promises_1.default.mkdir(thumbDir, { recursive: true });
    const thumbFilename = `${filename}-${width}x${height}.jpg`;
    const thumbPath = path_1.default.join(thumbDir, thumbFilename);
    // If cached image already exists, return it
    if (fs_1.default.existsSync(thumbPath)) {
        return thumbPath;
    }
    // Resize using sharp
    try {
        await (0, sharp_1.default)(sourcePath).resize(width, height).jpeg({ quality: 90 }).toFile(thumbPath);
        return thumbPath;
    }
    catch (err) {
        // cleanup if something partial created
        if (fs_1.default.existsSync(thumbPath)) {
            try {
                await promises_1.default.unlink(thumbPath);
            }
            catch {
                // ignore cleanup error
            }
        }
        throw new Error(`Failed to process image: ${err.message}`);
    }
}
