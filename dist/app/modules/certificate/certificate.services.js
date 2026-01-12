"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CertificateServices = void 0;
/* eslint-disable @typescript-eslint/no-unused-vars */
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const enrollment_model_1 = require("../enrollment/enrollment.model");
const course_model_1 = require("../course/course.model");
const user_model_1 = require("../user/user.model");
const pdfkit_1 = __importDefault(require("pdfkit"));
const generateCertificate = (courseId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    // Check if user is enrolled and course is completed
    const enrollment = yield enrollment_model_1.Enrollment.findOne({
        course: courseId,
        user: userId,
        status: 'completed'
    }).populate('course user');
    if (!enrollment) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Certificate not available. Course not completed.");
    }
    const course = yield course_model_1.Course.findById(courseId).populate('instructor', 'name');
    const user = yield user_model_1.User.findById(userId);
    if (!course || !user) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Course or user not found.");
    }
    // Get total points earned from this course
    const { EnrollmentServices } = yield Promise.resolve().then(() => __importStar(require('../enrollment/enrollment.services')));
    const totalPoints = yield EnrollmentServices.getUserCoursePoints(courseId, userId);
    // Generate PDF certificate
    const doc = new pdfkit_1.default({
        size: 'A4',
        layout: 'landscape',
        margin: 50
    });
    const buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => { });
    // Certificate background and styling
    doc.rect(0, 0, doc.page.width, doc.page.height).fill('#f8f9fa');
    // Border
    doc.rect(30, 30, doc.page.width - 60, doc.page.height - 60)
        .lineWidth(3)
        .stroke('#4f46e5');
    // Title
    doc.fontSize(36)
        .font('Helvetica-Bold')
        .fillColor('#1f2937')
        .text('CERTIFICATE OF COMPLETION', 0, 100, {
        align: 'center'
    });
    // Subtitle
    doc.fontSize(18)
        .font('Helvetica')
        .fillColor('#6b7280')
        .text('This is to certify that', 0, 160, {
        align: 'center'
    });
    // Student name
    doc.fontSize(32)
        .font('Helvetica-Bold')
        .fillColor('#4f46e5')
        .text(user.name, 0, 200, {
        align: 'center'
    });
    // Completion text
    doc.fontSize(16)
        .font('Helvetica')
        .fillColor('#374151')
        .text('has successfully completed the course', 0, 260, {
        align: 'center'
    });
    // Course name
    doc.fontSize(24)
        .font('Helvetica-Bold')
        .fillColor('#059669')
        .text(`"${course.title}"`, 0, 300, {
        align: 'center'
    });
    // Points earned
    doc.fontSize(16)
        .font('Helvetica')
        .fillColor('#374151')
        .text(`Points Earned: ${totalPoints}`, 0, 340, {
        align: 'center'
    });
    // Completion details
    doc.fontSize(14)
        .font('Helvetica')
        .fillColor('#6b7280')
        .text(`Completed on ${new Date(enrollment.completedAt || enrollment.updatedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })}`, 0, 370, {
        align: 'center'
    });
    // Signature area
    const signatureY = 420;
    // Instructor signature
    doc.fontSize(12)
        .font('Helvetica')
        .fillColor('#374151')
        .text(`${((_a = course.instructor) === null || _a === void 0 ? void 0 : _a.name) || 'Instructor'}`, 100, signatureY);
    doc.moveTo(100, signatureY + 20)
        .lineTo(250, signatureY + 20)
        .stroke('#6b7280');
    // Issue date
    const issueDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    doc.text(`Issued: ${issueDate}`, doc.page.width - 250, signatureY);
    doc.moveTo(doc.page.width - 250, signatureY + 20)
        .lineTo(doc.page.width - 100, signatureY + 20)
        .stroke('#6b7280');
    // Footer
    doc.fontSize(10)
        .font('Helvetica')
        .fillColor('#9ca3af')
        .text('This certificate is issued by the Learning Management System', 0, doc.page.height - 80, {
        align: 'center'
    });
    doc.end();
    return new Promise((resolve) => {
        doc.on('end', () => {
            resolve(Buffer.concat(buffers));
        });
    });
});
exports.CertificateServices = {
    generateCertificate,
};
