import { 
    ref, 
    uploadBytes,
    getDownloadURL,
    deleteObject
  } from 'firebase/storage';
  import { 
    doc,
    updateDoc,
    arrayUnion,
    arrayRemove,
    Timestamp
  } from 'firebase/firestore';
  import { db, storage } from '@/lib/firebase';
  import type { Attachment } from '@/types';
  
  interface UploadParams {
    file: File;
    entityType: 'leads' | 'opportunities' | 'candidates';
    entityId: string;
    uploadedBy: string;
  }
  
  export async function uploadAttachment({ 
    file, 
    entityType, 
    entityId,
    uploadedBy 
  }: UploadParams): Promise<Attachment> {
    try {
      // Validate inputs
      if (!file || !entityType || !entityId || !uploadedBy) {
        throw new Error('Missing required parameters for upload');
      }
  
      // Create a unique filename with timestamp and original name
      const timestamp = Date.now();
      const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const fileName = `${timestamp}-${safeFileName}`;
      
      // Create storage reference with proper path
      const storageRef = ref(storage, `${entityType}/${entityId}/${fileName}`);
      
      // Upload file with metadata
      const metadata = {
        contentType: file.type,
        customMetadata: {
          uploadedBy,
          originalName: file.name
        }
      };
      
      await uploadBytes(storageRef, file, metadata);
      
      // Get download URL
      const url = await getDownloadURL(storageRef);
      
      // Create attachment object with current timestamp
      const attachment: Attachment = {
        id: fileName,
        name: file.name,
        size: file.size,
        type: file.type,
        url,
        uploadedBy,
        uploadedAt: Timestamp.now()
      };
      
      // Add attachment to entity document
      const entityRef = doc(db, entityType, entityId);
      await updateDoc(entityRef, {
        attachments: arrayUnion(attachment)
      });
      
      return attachment;
    } catch (error) {
      console.error('Error uploading attachment:', error);
      throw error;
    }
  }
  
  export async function deleteAttachment(
    entityType: 'leads' | 'opportunities' | 'candidates',
    entityId: string,
    attachment: Attachment
  ): Promise<void> {
    try {
      // Validate inputs
      if (!entityType || !entityId || !attachment) {
        throw new Error('Missing required parameters for deletion');
      }
  
      // Delete from storage
      const storageRef = ref(storage, `${entityType}/${entityId}/${attachment.id}`);
      await deleteObject(storageRef);
      
      // Remove from entity document
      const entityRef = doc(db, entityType, entityId);
      await updateDoc(entityRef, {
        attachments: arrayRemove(attachment)
      });
    } catch (error) {
      console.error('Error deleting attachment:', error);
      throw error;
    }
  }