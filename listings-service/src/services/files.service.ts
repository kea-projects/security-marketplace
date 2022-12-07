import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import chalk from "chalk";
import { v4 as uuidv4 } from "uuid";
import { getEnvVar } from "../config/config.service";

export class FilesService {
  /**
   * Uploads a file to the Linode S3 bucket. Updates the file if it already exists.
   * @param dataBuffer `Express.Multer.File` file.buffer.
   * @param fileName the name that the file should be uploaded under.
   * @example async uploadFile(@UploadedFile() file: Express.Multer.File) { const { url } = await this.filesService.uploadFile(file.buffer, file.originalname); }}
   * @returns signed URL link that allows access to the file for 10 minutes.
   * @throws InvalidAccessKeyIdError | UploadFailedError
   */
  static async uploadFile(dataBuffer: Buffer, filename: string): Promise<{ url: string }> {
    const clusterId = getEnvVar("LINODE_STORAGE_CLUSTER_ID", true) as string;
    const bucketId = getEnvVar("LINODE_STORAGE_BUCKET_ID", true) as string;
    const accessKey = getEnvVar("LINODE_STORAGE_ACCESS_KEY", true) as string;
    const secretKey = getEnvVar("LINODE_STORAGE_SECRET_KEY", true) as string;

    try {
      const s3 = new S3Client({
        region: clusterId,
        credentials: {
          accessKeyId: accessKey,
          secretAccessKey: secretKey,
        },
        endpoint: `https://${clusterId}.linodeobjects.com`,
      });
      const anonymizedFilename = this.anonymizeFilename(filename);
      const uploadResult = await s3.send(
        new PutObjectCommand({
          Bucket: bucketId,
          Body: dataBuffer,
          Key: anonymizedFilename,
          ACL: "public-read",
        })
      );
      if (uploadResult.$metadata.httpStatusCode != 200) {
        throw new Error("UploadFailedError");
      } else {
        console.log(new Date().toISOString() + chalk.greenBright(` [INFO] New file uploaded: ${anonymizedFilename}`));
        return { url: `https://${bucketId}.${clusterId}.linodeobjects.com/${anonymizedFilename}` };
      }
    } catch (error) {
      console.log(
        new Date().toISOString() + chalk.redBright(` [ERROR] Failed to upload a file to Linode Object storage`, error)
      );
      if (error.name === "InvalidAccessKeyId") {
        throw new Error("InvalidAccessKeyIdError");
      } else {
        throw new Error("UploadFailedError");
      }
    }
  }

  static anonymizeFilename(filename: string): string {
    const regex = /(.jpg|.jpeg|.png)/gm;
    const extension = filename.match(regex);
    if (!extension || extension?.length != 1) {
      throw new Error("Provided file has no valid extension");
    }
    return uuidv4() + extension[0];
  }
}
