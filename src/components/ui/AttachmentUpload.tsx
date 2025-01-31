import { useState, useRef } from 'react';
import { Button } from './Button';
import { Badge } from './Badge';
import { Paperclip, X, FileText, Download, Loader2 } from 'lucide-react';
import { formatFileSize } from '@/lib/utils/files';
import { uploadAttachment, deleteAttachment } from '@/lib/services/attachments';
import type { Attachment } from '@/types';

interface AttachmentUploadProps {
  entityType: 'leads' | 'opportunities' | 'candidates';
  entityId: string;
  attachments?: Attachment[];
  uploadedBy: string;
  onUpload?: (attachment: Attachment) => void;
  onDelete?: (attachment: Attachment) => void;
}

export function AttachmentUpload({
  entityType,
  entityId,
  attachments = [],
  uploadedBy,
  onUpload,
  onDelete
}: AttachmentUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const attachment = await uploadAttachment({
        file,
        entityType,
        entityId,
        uploadedBy
      });
      onUpload?.(attachment);
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDelete = async (attachment: Attachment) => {
    try {
      await deleteAttachment(entityType, entityId, attachment);
      onDelete?.(attachment);
    } catch (error) {
      console.error('Error deleting attachment:', error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileChange}
          className="hidden"
        />
        <Button
          type="button"
          variant="secondary"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          {isUploading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Paperclip className="h-4 w-4 mr-2" />
          )}
          {isUploading ? 'Uploading...' : 'Attach File'}
        </Button>
      </div>

      {attachments.length > 0 && (
        <ul className="space-y-2">
          {attachments.map(attachment => (
            <li 
              key={attachment.id}
              className="flex items-center justify-between p-2 rounded-lg border bg-gray-50 hover:bg-gray-100"
            >
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-gray-400" />
                <div>
                  <div className="text-sm font-medium">{attachment.name}</div>
                  <div className="text-xs text-gray-500">
                    {formatFileSize(attachment.size)}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  className="p-1"
                  onClick={() => window.open(attachment.url, '_blank')}
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  className="p-1"
                  onClick={() => handleDelete(attachment)}
                >
                  <X className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}