import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { v4 as uuidv4 } from "uuid";
import { S3 } from "aws-sdk";

@Injectable()
export class AwsS3Service {
	private logger = new Logger(AwsS3Service.name);
	private s3 = new S3();

	constructor(
		private readonly configService: ConfigService
	) {}

	/**
	 * It returns a promise that will resolve to the file data
	 * @param {string} key - The name of the file you want to download.
	 * @returns A promise.
	 */
	loadFile(key: string) {
		return this.s3.getObject({
			Bucket: this.configService.get("AWS_S3_BUCKET_NAME"),
			Key: key
		}).promise();
	}

	/**
	 * It uploads a file to S3
	 * @param file - Express.Multer.File - This is the file object that multer gives us.
	 * @param {string} [path] - The path to the folder in the bucket where the file will be uploaded.
	 * @returns A promise.
	 */
	uploadFile(file: Express.Multer.File, path?: string) {
		const extension = file.originalname.split('.').pop();
		return this.s3.upload({
			Bucket: this.configService.get("AWS_S3_BUCKET_NAME"),
			Key: (path ? `${path}/${uuidv4()}` : uuidv4()) + `.${extension}`,
			Body: file.buffer,
			ACL: "public-read",
			ContentType: file.mimetype
		}).promise();
	}

	/**
	 * It takes an array of files and an optional path, and returns a promise that resolves to an array of
	 * file paths
	 * @param {Express.Multer.File[]} files - Express.Multer.File[] - An array of files that were
	 * uploaded.
	 * @param {string} [path] - The path to upload the file to. If not specified, the file will be
	 * uploaded to the root of the bucket.
	 * @returns An array of promises.
	 */
	uploadFiles(files: Express.Multer.File[], path?: string) {
		return Promise.all(files.map(file => this.uploadFile(file, path)));
	}

	/**
	 * It deletes a file from the S3 bucket
	 * @param {string} key - The name of the file you want to delete.
	 * @returns A promise.
	 */
	deleteFile(key: string) {
		return this.s3.deleteObject({
			Bucket: this.configService.get("AWS_S3_BUCKET_NAME"),
			Key: key
		}).promise();
	}

	/**
	 * It takes an array of keys, and deletes them from the S3 bucket
	 * @param {string[]} keys - The keys of the files to be deleted.
	 * @returns A promise that resolves to an object with a Deleted property that is an array of objects
	 * with a Key property.
	 */
	deleteFiles(keys: string[]) {
		return this.s3.deleteObjects({
			Bucket: this.configService.get("AWS_S3_BUCKET_NAME"),
			Delete: {
				Objects: keys.map(key => ({ Key: key }))
			}
		}).promise();
	}

	/**
	 * It returns a promise that lists all the files in the S3 bucket
	 * @param {string} [path] - The path to the folder you want to list the files of.
	 * @returns A promise that resolves to an object with a list of files.
	 */
	listFiles(path?: string) {
		return this.s3.listObjects({
			Bucket: this.configService.get("AWS_S3_BUCKET_NAME"),
			Prefix: path
		}).promise();
	}
}
