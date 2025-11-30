/**
 * Utility functions for handling document operations
 */

/**
 * Downloads a document from a URL
 * @param documentUrl - The URL of the document to download
 * @param fileName - The name to save the file as
 */
export const downloadDocument = (documentUrl: string, fileName?: string): void => {
  if (!documentUrl) {
    console.warn('No document URL provided');
    return;
  }
  
  try {
    const link = document.createElement('a');
    link.href = documentUrl;
    link.download = fileName || 'document';
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    
    // Add to DOM, click, and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error downloading document:', error);
  }
};

/**
 * Checks if a document URL is valid
 * @param url - The URL to validate
 * @returns boolean indicating if the URL is valid
 */
export const isValidDocumentUrl = (url: string): boolean => {
  if (!url) return false;
  
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
};

/**
 * Gets the file extension from a URL or filename
 * @param urlOrFilename - The URL or filename to extract extension from
 * @returns The file extension (without the dot)
 */
export const getFileExtension = (urlOrFilename: string): string => {
  if (!urlOrFilename) return '';
  
  const lastDotIndex = urlOrFilename.lastIndexOf('.');
  if (lastDotIndex === -1) return '';
  
  return urlOrFilename.substring(lastDotIndex + 1).toLowerCase();
};

/**
 * Gets a human-readable file type from extension
 * @param extension - The file extension
 * @returns Human-readable file type
 */
export const getFileTypeLabel = (extension: string): string => {
  const typeMap: Record<string, string> = {
    'pdf': 'PDF Document',
    'doc': 'Word Document',
    'docx': 'Word Document',
    'xls': 'Excel Spreadsheet',
    'xlsx': 'Excel Spreadsheet',
    'jpg': 'Image',
    'jpeg': 'Image',
    'png': 'Image',
    'gif': 'Image',
    'txt': 'Text File',
    'zip': 'ZIP Archive',
    'rar': 'RAR Archive'
  };
  
  return typeMap[extension] || 'Document';
};

