
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FileItem, getFiles, uploadFile, downloadFile } from '@/services/fileService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const Dashboard = () => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check if user is authenticated
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    // Load files from storage
    const storedFiles = getFiles();
    setFiles(storedFiles);
  }, [currentUser, navigate]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFileToUpload(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (!fileToUpload || !currentUser) {
      toast.error("Please select a file first");
      return;
    }
    
    setIsUploading(true);
    
    try {
      const success = uploadFile(fileToUpload, currentUser.id);
      
      if (success) {
        // Refresh file list
        const updatedFiles = getFiles();
        setFiles(updatedFiles);
        setFileToUpload(null);
        // Reset file input
        const fileInput = document.getElementById('file-upload') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = (fileId: string) => {
    const result = downloadFile(fileId);
    
    if (result.success && result.url) {
      // In a real app, this would redirect to a secure download URL
      // For this mock, we'll just show a success message with the URL
      toast.success("File download link generated");
      
      // Create a fake download experience
      setTimeout(() => {
        toast("Your file is downloading...");
      }, 1000);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const getFileTypeName = (mimeType: string): string => {
    if (mimeType.includes('presentation')) return 'PowerPoint';
    if (mimeType.includes('wordprocessing')) return 'Word';
    if (mimeType.includes('spreadsheet')) return 'Excel';
    return 'Document';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header/Navigation */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <div className="text-2xl font-bold text-app-purple">SecureShare</div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600">
              Logged in as <span className="font-medium">{currentUser?.name}</span>
              <span className="ml-2 px-2 py-1 bg-gray-200 text-xs rounded-full">
                {currentUser?.role === 'operation' ? 'Operation' : 'Client'}
              </span>
            </div>
            <Button variant="outline" onClick={handleLogout}>Logout</Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
        
        {/* Role-specific actions */}
        {currentUser?.role === 'operation' && (
          <Card className="mb-8">
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-4">Upload Files</h2>
              <p className="text-sm text-gray-600 mb-4">
                You can upload .pptx, .docx, and .xlsx files for clients to access.
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="file-upload" className="block mb-2">Select File</Label>
                  <Input 
                    id="file-upload" 
                    type="file" 
                    accept=".pptx,.docx,.xlsx,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                    onChange={handleFileChange}
                    className="mb-4"
                  />
                  {fileToUpload && (
                    <p className="text-sm text-gray-600 mt-2">
                      Selected: <span className="font-medium">{fileToUpload.name}</span>
                      <span className="ml-2">({formatFileSize(fileToUpload.size)})</span>
                    </p>
                  )}
                </div>
                <div className="flex items-end">
                  <Button 
                    onClick={handleUpload} 
                    disabled={!fileToUpload || isUploading}
                    className="bg-app-purple hover:bg-app-purple-light"
                  >
                    {isUploading ? "Uploading..." : "Upload File"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Files list */}
        <h2 className="text-xl font-semibold mb-4">Files</h2>
        <div className="bg-white rounded-lg shadow">
          {files.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b">
                    <th className="px-6 py-3 bg-gray-50">Name</th>
                    <th className="px-6 py-3 bg-gray-50">Type</th>
                    <th className="px-6 py-3 bg-gray-50">Size</th>
                    <th className="px-6 py-3 bg-gray-50">Upload Date</th>
                    <th className="px-6 py-3 bg-gray-50">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {files.map((file) => (
                    <tr key={file.id} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 mr-2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                            <polyline points="14 2 14 8 20 8"></polyline>
                          </svg>
                          {file.name}
                        </div>
                      </td>
                      <td className="px-6 py-4">{getFileTypeName(file.type)}</td>
                      <td className="px-6 py-4">{formatFileSize(file.size)}</td>
                      <td className="px-6 py-4">{formatDate(file.uploadDate)}</td>
                      <td className="px-6 py-4">
                        {currentUser?.role === 'client' && (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleDownload(file.id)}
                            className="text-app-blue border-app-blue hover:bg-blue-50"
                          >
                            Download
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="inline-block p-3 bg-gray-100 rounded-full mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                </svg>
              </div>
              <h3 className="font-medium text-gray-500 mb-1">No files found</h3>
              {currentUser?.role === 'operation' ? (
                <p className="text-gray-400">Upload files for clients to access</p>
              ) : (
                <p className="text-gray-400">No files have been shared with you yet</p>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
