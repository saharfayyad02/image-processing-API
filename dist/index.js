"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/app.ts
const express_1 = __importDefault(require("express"));
const morgan_1 = __importDefault(require("morgan"));
const helmet_1 = __importDefault(require("helmet"));
const path_1 = __importDefault(require("path"));
const imageRoute_1 = __importDefault(require("./routes/imageRoute"));
const app = (0, express_1.default)();
app.use((0, helmet_1.default)());
app.use((0, morgan_1.default)('dev'));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Routes
app.use('/api/images', imageRoute_1.default);
// Health check
app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok' });
});
// static full images (optional) — only for development convenience
app.use('/images/full', express_1.default.static(path_1.default.resolve(__dirname, '../images/full')));
app.get('/resize', (req, res) => {
    const { filename, width, height } = req.query;
    if (!filename || !width || !height) {
        return res.status(400).send('Missing parameters');
    }
    res.status(200).send('Image resized successfully!');
});
exports.default = app;
