import { generateReactHelpers } from "@uploadthing/react";

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const { useUploadThing, uploadFiles } = generateReactHelpers({
  url: `${API_BASE_URL}/uploadthing`,
});
