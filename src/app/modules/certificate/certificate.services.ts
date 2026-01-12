/* eslint-disable @typescript-eslint/no-unused-vars */
import httpStatus from "http-status-codes";
import AppError from "../../errorHelpers/AppError";
import { Enrollment } from "../enrollment/enrollment.model";
import { Course } from "../course/course.model";
import { User } from "../user/user.model";
import PDFDocument from 'pdfkit';

const generateCertificate = async (courseId: string, userId: string): Promise<Buffer> => {
  // Check if user is enrolled and course is completed
  const enrollment = await Enrollment.findOne({
    course: courseId,
    user: userId,
    status: 'completed'
  }).populate('course user');

  if (!enrollment) {
    throw new AppError(httpStatus.NOT_FOUND, "Certificate not available. Course not completed.");
  }

  const course = await Course.findById(courseId).populate('instructor', 'name');
  const user = await User.findById(userId);

  if (!course || !user) {
    throw new AppError(httpStatus.NOT_FOUND, "Course or user not found.");
  }

  // Get total points earned from this course
  const { EnrollmentServices } = await import('../enrollment/enrollment.services');
  const totalPoints = await EnrollmentServices.getUserCoursePoints(courseId, userId);

  // Generate PDF certificate
  const doc = new PDFDocument({
    size: 'A4',
    layout: 'landscape',
    margin: 50
  });

  const buffers: Buffer[] = [];

  doc.on('data', buffers.push.bind(buffers));
  doc.on('end', () => {});

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
     .text(`${(course as any).instructor?.name || 'Instructor'}`, 100, signatureY);

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
};

export const CertificateServices = {
  generateCertificate,
};