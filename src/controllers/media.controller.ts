import { Storage } from '@google-cloud/storage';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { pipeline } from 'stream';
import util from 'util';

import type { MultipartFile } from '@fastify/multipart';
import type { Bucket } from '@google-cloud/storage';

import envConfig, { API_URL } from '@/config';
const pump = util.promisify(pipeline);

class MediaController {
  private storage: Storage;
  private bucket: Bucket;
  constructor() {
    this.storage = new Storage({
      keyFilename: path.resolve(process.cwd(), 'key.json')
    });
    this.bucket = this.storage.bucket(envConfig.GOOGLE_BUCKET_NAME);
  }
  /**
   * @description Upload image
   * @param data
   * @returns
   * @buihuytuyen
   */
  uploadImage = async (data: MultipartFile) => {
    const filename = data.filename.split('.')[0] + '.jpeg';
    const filepathTemp = path.resolve(envConfig.UPLOAD_FOLDER_TEMP, filename);

    if (data.file.truncated) {
      throw new Error('Giới hạn file là 10MB');
    }
    try {
      await pump(data.file, fs.createWriteStream(filepathTemp));
      const fileBuffer = await sharp(filepathTemp)
        .jpeg({
          quality: 100
        })
        .toBuffer();

      const file = this.bucket.file(filename);
      await file.save(fileBuffer, {
        metadata: {
          contentType: 'image/jpeg'
        }
      });
      return file.publicUrl();
    } catch {
      const filepath = path.resolve(envConfig.UPLOAD_FOLDER, filename);
      await sharp(filepathTemp)
        .jpeg({
          quality: 100
        })
        .toFile(filepath);
      return `${API_URL}/static/${filename}`;
    } finally {
      fs.unlinkSync(filepathTemp);
    }
  };
}

export default new MediaController();
