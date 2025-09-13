"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/imageRoute.ts
const express_1 = require("express");
const path_1 = __importDefault(require("path"));
const promises_1 = __importDefault(require("fs/promises"));
const validators_1 = require("../utils/validators");
const imageService_1 = require("../services/imageService");
const router = (0, express_1.Router)();
/**
 * GET /api/images?filename=<name>&width=<w>&height=<h>
 */
router.get('/', async (req, res) => {
    try {
        const filename = String(req.query.filename ?? '');
        if (!filename) {
            return res.status(400).json({ error: 'Missing filename parameter' });
        }
        const width = (0, validators_1.parsePositiveInt)(String(req.query.width ?? ''));
        const height = (0, validators_1.parsePositiveInt)(String(req.query.height ?? ''));
        // Process/return image
        const thumbPath = await (0, imageService_1.resizeImage)(filename, width, height);
        // ensure file exists and send it
        await promises_1.default.access(thumbPath);
        return res.sendFile(path_1.default.resolve(thumbPath));
    }
    catch (err) {
        // Specific validation errors return 400, file-not-found 404; otherwise 500
        const e = err;
        if ((e.message && e.message.includes('width')) ||
            e.message.includes('height') ||
            e.message.includes('Missing')) {
            return res.status(400).json({ error: e.message });
        }
        if (e.message && e.message.includes('Source image not found')) {
            return res.status(404).json({ error: e.message });
        }
        // eslint-disable-next-line no-console
        console.error('Unexpected error in /api/images:', e);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
