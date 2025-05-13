import { Injectable } from '@nestjs/common';
import * as path from 'node:path';
import * as fs from 'node:fs';
import * as fsPromises from 'node:fs/promises';

@Injectable()
export class FsHelper {
  async uploadFile(file: Express.Multer.File) {
    const fileFolder = path.join(process.cwd(), 'uploads');

    if (!fs.existsSync(fileFolder)) {
      fs.mkdirSync(fileFolder, { recursive: true });
    }

    const extension = file.originalname.split('.').pop() || 'txt';
    let fileName = `${Date.now()}-file.${extension}`;

    await fsPromises.writeFile(path.join(fileFolder, fileName), file.buffer);

    return {
      message: 'success',
      fileUrl: fileName,
    };
  }

  async removeFiles(fileName: string | string[]): Promise<{ message: string }> {
    const files: string[] = Array.isArray(fileName) ? [...fileName] : [fileName];

    for (const file of files) {
      const filePath: string = path.join(process.cwd(), 'uploads', file);
      if (fs.existsSync(filePath)) {
        await fsPromises.unlink(filePath); // Promise bilan ishlash uchun async ishlatildi
      }
    }

    return {
      message: "O'chirildi",
    };
  }
}
