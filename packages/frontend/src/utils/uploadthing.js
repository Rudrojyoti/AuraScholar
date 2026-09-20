import { genUploader } from 'uploadthing/client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
// Ensure URL points to /api/uploadthing
const uploadthingUrl = API_URL.replace(/\/api\/?$/, '') + '/api/uploadthing';

export const { uploadFiles } = genUploader({
  url: uploadthingUrl
});
