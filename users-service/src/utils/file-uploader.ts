import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getEnvOrExit } from "../config/secrets";
import { log } from "./logger";

class FilesService {
  /**
   * Uploads a file to the Linode S3 bucket. Updates the file if it already exists.
   * @param dataBuffer `Express.Multer.File` file.buffer.
   * @param filename the name that the file should be uploaded under.
   * @example async uploadFile(@UploadedFile() file: Express.Multer.File) { const { url } = await this.filesService.uploadFile(file.buffer, file.originalname); }}
   * @returns signed URL link that allows access to the file for 10 minutes.
   * @throws InvalidAccessKeyIdError | UploadFailedError
   */
  static async uploadFile(dataBuffer: Buffer, filename: string, silentLog = false): Promise<{ url: string }> {
    const CLUSTER_ID = getEnvOrExit("USERS_LINODE_STORAGE_CLUSTER_ID");
    const BUCKET_ID = getEnvOrExit("USERS_LINODE_STORAGE_BUCKET_ID");
    const ACCESS_KEY = getEnvOrExit("USERS_LINODE_STORAGE_ACCESS_KEY");
    const SECRET_KEY = getEnvOrExit("USERS_LINODE_STORAGE_SECRET_KEY");

    try {
      const s3 = new S3Client({
        region: CLUSTER_ID,
        credentials: {
          accessKeyId: ACCESS_KEY,
          secretAccessKey: SECRET_KEY,
        },
        endpoint: `https://${CLUSTER_ID}.linodeobjects.com`,
      });
      const uploadResult = await s3.send(
        new PutObjectCommand({
          Bucket: BUCKET_ID,
          Body: dataBuffer,
          Key: filename,
          ACL: "public-read",
        })
      );
      if (uploadResult.$metadata.httpStatusCode != 200) {
        throw new Error("UploadFailedError");
      } else {
        if (!silentLog) {
          log.info(`New file uploaded: ${filename}`);
        }
        return { url: `https://${BUCKET_ID}.${CLUSTER_ID}.linodeobjects.com/${filename}` };
      }
    } catch (error) {
      log.error(`Failed to upload a file to Linode Object storage`, error);
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
    const CLUSTER_ID = getEnvOrExit("USERS_LINODE_STORAGE_CLUSTER_ID");
    const BUCKET_ID = getEnvOrExit("USERS_LINODE_STORAGE_BUCKET_ID");
    return `https://${BUCKET_ID}.${CLUSTER_ID}.linodeobjects.com/${this.getFilename(listingId, filename)}`;
  }
}

export { FilesService };
