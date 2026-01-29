import { supabase } from './supabaseClient';

export const storageService = {
    /**
     * Uploads a file to a specific folder in the 'crm-media' bucket.
     */
    uploadFile: async (file: File, folder: 'properties' | 'developments'): Promise<string> => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
        const filePath = `${folder}/${fileName}`;

        const { data, error } = await supabase.storage
            .from('crm-media')
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false
            });

        if (error) {
            console.error('Error uploading file:', error);
            throw error;
        }

        const { data: { publicUrl } } = supabase.storage
            .from('crm-media')
            .getPublicUrl(filePath);

        return publicUrl;
    },

    /**
     * Deletes a file from Supabase Storage by its public URL or path.
     */
    deleteFile: async (fileUrl: string): Promise<void> => {
        try {
            // Extract path from public URL if necessary
            const path = fileUrl.split('/storage/v1/object/public/crm-media/')[1];
            if (!path) return;

            const { error } = await supabase.storage
                .from('crm-media')
                .remove([path]);

            if (error) throw error;
        } catch (error) {
            console.error('Error deleting file:', error);
        }
    }
};
