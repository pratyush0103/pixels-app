import { BasePlugin, PluginOpts } from '@uppy/core';
import type { Uppy, Body, Meta } from '@uppy/core';

export interface CloudinaryUploaderOptions extends PluginOpts {
    cloudName: string;
    uploadPreset: string;
}

export default class CloudinaryUploader extends BasePlugin<CloudinaryUploaderOptions, Meta, Body> {
    constructor(uppy: Uppy<Meta, Body>, opts: CloudinaryUploaderOptions) {
        super(uppy, opts);
        this.id = opts.id || 'CloudinaryUploader';
        this.type = 'uploader';
    }

    install() {
        this.uppy.addUploader(this.upload);
    }

    uninstall() {
        this.uppy.removeUploader(this.upload);
    }

    upload = (fileIDs: string[]) => {
        if (fileIDs.length === 0) return Promise.resolve();

        const promises = fileIDs.map((id) => this.uploadFile(id));
        return Promise.all(promises);
    };

    uploadFile = async (id: string) => {
        const file = this.uppy.getFile(id);
        const { cloudName, uploadPreset } = this.opts;

        this.uppy.emit('upload-started', file);

        const formData = new FormData();
        formData.append('file', file.data as Blob);
        formData.append('upload_preset', uploadPreset);
        // Explicitly do NOT append 'type' or other fields unless needed
        // Cloudinary might want 'folder' or 'tags' if we added them to meta, but for now just preset.

        const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

        try {
            const xhr = new XMLHttpRequest();

            return new Promise<void>((resolve, reject) => {
                xhr.upload.addEventListener('progress', (event) => {
                    if (event.lengthComputable) {
                        this.uppy.emit('upload-progress', file, {
                            uploader: this,
                            bytesUploaded: event.loaded,
                            bytesTotal: event.total,
                        });
                    }
                });

                xhr.addEventListener('load', () => {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        const body = JSON.parse(xhr.responseText);
                        const uploadURL = body.secure_url;

                        this.uppy.emit('upload-success', file, {
                            status: xhr.status,
                            body,
                            uploadURL,
                        });
                        resolve();
                    } else {
                        const error = new Error('Upload failed');
                        // @ts-ignore - attaching custom prop
                        error.request = xhr;
                        this.uppy.emit('upload-error', file, error);
                        reject(error);
                    }
                });

                xhr.addEventListener('error', () => {
                    const error = new Error('Network error');
                    this.uppy.emit('upload-error', file, error);
                    reject(error);
                });

                xhr.open('POST', endpoint, true);
                xhr.send(formData);
            });
        } catch (err) {
            this.uppy.emit('upload-error', file, err as Error);
            throw err;
        }
    };
}
