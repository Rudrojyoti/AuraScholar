const express = require('express');
const { createRouteHandler } = require('uploadthing/express');
const { createUploadthing } = require('uploadthing/server');

const f = createUploadthing();

// FileRouter for your app, can contain multiple FileRoutes
const uploadRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  pdfUploader: f({ pdf: { maxFileSize: "16MB" } })
    // Set permissions and file types for this FileRoute
    .onUploadComplete(async ({ metadata, file }) => {
      // This code RUNS ON YOUR SERVER after upload
      console.log("Upload complete for file:", file.url);
      
      // Whatever is returned here is sent to the clientside `onClientUploadComplete` callback
      return { uploadedBy: "user", url: file.url, name: file.name };
    }),
};

const router = express.Router();

router.use(
  '/',
  createRouteHandler({
    router: uploadRouter,
    config: {
      // Required config for uploadthing
      uploadthingSecret: process.env.UPLOADTHING_SECRET,
      uploadthingId: process.env.UPLOADTHING_APP_ID,
    },
  })
);

module.exports = router;
