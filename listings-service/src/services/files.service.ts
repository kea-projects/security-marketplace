import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import chalk from "chalk";
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
      const uploadResult = await s3.send(
        new PutObjectCommand({
          Bucket: bucketId,
          Body: dataBuffer,
          Key: filename,
          ACL: "public-read",
        })
      );
      if (uploadResult.$metadata.httpStatusCode != 200) {
        throw new Error("UploadFailedError");
      } else {
        console.log(new Date().toISOString() + chalk.greenBright(` [INFO] New file uploaded: ${filename}`));
        return { url: `https://${bucketId}.${clusterId}.linodeobjects.com/${filename}` };
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

  /**
   * Returns a listingId with the file extension attached.
   * @param listingId a UUID.
   * @param filename the original file name with the extension.
   * @returns for example 4883d611-98f8-46cd-9f66-dc8357ae3346.png
   */
  static getFilename(listingId: string, filename: string): string {
    const regex = /(.jpg|.jpeg|.png)/gm;
    const extension = filename.match(regex);
    if (!extension || extension?.length != 1) {
      throw new Error("Provided file has no valid extension");
    }
    return listingId + extension[0];
  }

  /**
   * Returns a URL that can be used to access the URL if it is uploaded
   * @param listingId a UUID.
   * @param filename the original file name with the extension.
   * @returns for example https://documents.eu-central-1.linodeobjects.com/35342b75-0cab-439b-ac6c-e0c3c176e9a7.png
   */
  static getResourceUrl(listingId: string, filename: string): string {
    const clusterId = getEnvVar("LINODE_STORAGE_CLUSTER_ID", true) as string;
    const bucketId = getEnvVar("LINODE_STORAGE_BUCKET_ID", true) as string;
    return `https://${bucketId}.${clusterId}.linodeobjects.com/${this.getFilename(listingId, filename)}`;
  }
}
