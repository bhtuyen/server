import { randomId } from '@/utils/helpers';
import { MultipartFile } from '@fastify/multipart';
import path from 'path';
import fs from 'fs';
import util from 'util';
import { pipeline } from 'stream';
import envConfig, { API_URL } from '@/config';
import { Storage } from '@google-cloud/storage';
import sharp from 'sharp';
const pump = util.promisify(pipeline);

export const uploadImage = async (data: MultipartFile) => {
  const uniqueId = randomId();
  const ext = path.extname(data.filename);
  const filename = uniqueId + ext;
  // const filepathTemp = path.resolve(envConfig.UPLOAD_FOLDER_TEMP, filename);
  const filepath = path.resolve(envConfig.UPLOAD_FOLDER, filename);
  await pump(data.file, fs.createWriteStream(filepath));
  // await sharp(filepath).jpeg().toFile(filepath);
  // fs.unlink(filepathTemp, (err) => {
  //   if (err) {
  //     console.log(err);
  //   }
  // });
  if (data.file.truncated) {
    // Xóa file nếu file bị trucated
    fs.unlinkSync(filepath);
    throw new Error('Giới hạn file là 10MB');
  }
  return `${API_URL}/static/${filename}`;

  // try {
  // const storage = new Storage({
  //   projectId: envConfig.GOOGLE_BUCKET_PROJECT_ID,
  //   credentials: {
  //     type: envConfig.GOOGLE_BUCKET_TYPE,
  //     project_id: envConfig.GOOGLE_BUCKET_PROJECT_ID,
  //     private_key_id: envConfig.GOOGLE_BUCKET_PRIVATE_KEY_ID,
  //     private_key: envConfig.GOOGLE_BUCKET_PRIVATE_KEY,
  //     client_email: envConfig.GOOGLE_BUCKET_CLIENT_MAIL,
  //     client_id: envConfig.GOOGLE_BUCKET_CLIENT_ID
  //   }
  // });
  // const result = await storage.bucket(envConfig.GOOGLE_BUCKET_NAME).upload(filepath, {
  //   destination: filename
  // });
  // console.log(result);
  // return result[0].publicUrl();
  // } catch (error) {
  //   console.log('Upload file lên Google Cloud Storage thất bại');
  //   console.log(error);
  // }
};
