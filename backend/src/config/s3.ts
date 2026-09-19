import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { config } from './index.js';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const s3Client = new S3Client({
  region: config.aws.region,
  credentials: {
    accessKeyId: config.aws.accessKeyId,
    secretAccessKey: config.aws.secretAccessKey,
  },
});

export const uploadFile = async (buffer: Buffer, key: string, contentType: string): Promise<string> => {
  if (config.nodeEnv === 'development' && !config.aws.accessKeyId) {
    // Save locally
    const uploadDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    const ext = key.split('.').pop();
    const fileName = `${uuidv4()}.${ext}`;
    const filePath = path.join(uploadDir, fileName);
    
    fs.writeFileSync(filePath, buffer);
    return `${config.frontendUrl}/uploads/${fileName}`;
  }

  const command = new PutObjectCommand({
    Bucket: config.aws.bucketName,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  });

  await s3Client.send(command);
  
  return `https://${config.aws.bucketName}.s3.${config.aws.region}.amazonaws.com/${key}`;
};
