
import { toast } from "sonner";

export interface FileItem {
  id: string;
  name: string;
  type: string;
  uploadedBy: string;
  uploadDate: string;
  size: number;
  downloadUrl: string;
}

// Get all files from local storage
export const getFiles = (): FileItem[] => {
  const files = localStorage.getItem('files');
  return files ? JSON.parse(files) : [];
};

// Upload a file (mock implementation using localStorage)
export const uploadFile = (file: File, userId: string): boolean => {
  try {
    // Validate file type
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    ];
    
    if (!validTypes.includes(file.type)) {
      toast.error("Only .pptx, .docx, and .xlsx files are allowed");
      return false;
    }
    
    // Create a new file entry
    const newFile: FileItem = {
      id: Math.random().toString(36).substring(2, 15),
      name: file.name,
      type: file.type,
      uploadedBy: userId,
      uploadDate: new Date().toISOString(),
      size: file.size,
      // In a real app, this would be a secure URL from a storage service
      downloadUrl: encryptUrl(file.name + '-' + Math.random().toString(36).substring(2, 15)),
    };
    
    // Get existing files and add the new one
    const files = getFiles();
    files.push(newFile);
    localStorage.setItem('files', JSON.stringify(files));
    
    toast.success("File uploaded successfully");
    return true;
  } catch (error) {
    console.error("Upload error:", error);
    toast.error("Failed to upload file");
    return false;
  }
};

// Simple mock encryption for download URLs
const encryptUrl = (str: string): string => {
  // In a real app, this would use proper encryption
  return btoa(str).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
};

// Download a file
export const downloadFile = (fileId: string): { success: boolean; url?: string } => {
  try {
    const files = getFiles();
    const file = files.find(f => f.id === fileId);
    
    if (!file) {
      toast.error("File not found");
      return { success: false };
    }
    
    // In a real app, this would generate a temporary secure download link
    // For this mock, we'll just return the stored URL
    return { 
      success: true, 
      url: file.downloadUrl 
    };
  } catch (error) {
    console.error("Download error:", error);
    toast.error("Failed to download file");
    return { success: false };
  }
};
