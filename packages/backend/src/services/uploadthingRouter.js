const { createUploadthing } = require('uploadthing/express');

const f = createUploadthing();

const uploadRouter = {
  // Define PDF uploader route allowing up to 32MB files
  pdfUploader: f({
    pdf: {
      maxFileSize: '32MB',
      maxFileCount: 1
    }
  })
    .middleware(async ({ req }) => {
      const userId = req.auth?.userId || req.headers['x-user-id'] || 'guest_user';
      return { userId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log(`✅ UploadThing: ${file.name} uploaded by ${metadata.userId}`);
      console.log(`📁 Permanent CDN URL: ${file.url}`);
      return {
        uploadedBy: metadata.userId,
        url: file.url,
        name: file.name,
        size: file.size
      };
    })
};

module.exports = {
  uploadRouter
};
