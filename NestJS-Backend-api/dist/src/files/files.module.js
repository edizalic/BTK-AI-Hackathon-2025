"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FilesModule = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const config_1 = require("@nestjs/config");
const files_service_1 = require("./files.service");
const files_controller_1 = require("./files.controller");
const storage_service_1 = require("./storage.service");
const multer_1 = require("multer");
const path_1 = require("path");
let FilesModule = class FilesModule {
};
exports.FilesModule = FilesModule;
exports.FilesModule = FilesModule = __decorate([
    (0, common_1.Module)({
        imports: [
            platform_express_1.MulterModule.registerAsync({
                imports: [config_1.ConfigModule],
                useFactory: async (configService) => ({
                    storage: (0, multer_1.diskStorage)({
                        destination: configService.get('upload.uploadPath'),
                        filename: (req, file, cb) => {
                            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
                            cb(null, file.fieldname + '-' + uniqueSuffix + (0, path_1.extname)(file.originalname));
                        },
                    }),
                    limits: {
                        fileSize: configService.get('upload.maxFileSize') * 1024 * 1024,
                    },
                }),
                inject: [config_1.ConfigService],
            }),
        ],
        providers: [files_service_1.FilesService, storage_service_1.StorageService],
        controllers: [files_controller_1.FilesController],
        exports: [files_service_1.FilesService, storage_service_1.StorageService],
    })
], FilesModule);
//# sourceMappingURL=files.module.js.map