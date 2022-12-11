import { Inject, Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { v4 as uuidv4 } from "uuid";
import { AwsS3Service } from "./aws-s3.service";
import { join } from "path";
import { storagePaths } from "../constants";
import { readFileSync, unlinkSync, writeFileSync } from "fs";
import mime from 'mime-types';

@Injectable()
export class FilesService {
	private logger = new Logger(FilesService.name);

	constructor(
		private readonly awsS3Service: AwsS3Service,
		private readonly configService: ConfigService,
	) {}

	/**
	 * If the storage type is not S3, then read the file from the local file system and return it.
	 * Otherwise, use the AWS S3 service to load the file
	 * @param {string} key - The name of the file to load.
	 * @returns The file is being returned as a buffer.
	 */
	async loadFile(key: string) {
		if (this.configService.get('STORAGE_TYPE') !== 's3') {
			const mimetype = mime.lookup(key) || 'application/octet-stream';
			const buffer = readFileSync(join(storagePaths.uploads, key));

			return { ContentType: mimetype, Body: buffer };
		} else {
			return this.awsS3Service.loadFile(key);
		}
	}

	/**
	 * If the storage type is not s3, then save the file to the local file system, otherwise save the file
	 * to s3
	 * @param file - Express.Multer.File - This is the file that was uploaded.
	 * @param {string} [path] - The path to the folder where the file will be saved.
	 * @returns The file name of the file that was uploaded.
	 */
	uploadFile(file: Express.Multer.File, path?: string) {
		if (this.configService.get('STORAGE_TYPE') !== 's3') {
			const extension = file.originalname.split('.').pop();
			const saveFile = (path ? `${path}/${uuidv4()}` : uuidv4()) + `.${extension}`;
			const filepath = join(storagePaths.uploads, saveFile);
			writeFileSync(filepath, file.buffer);
			return { Key: saveFile };
		} else {
			return this.awsS3Service.uploadFile(file, path);
		}
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
	 * If the storage type is not S3, then delete the file from the local file system. If the storage type
	 * is S3, then delete the file from S3
	 * @param {string} key - The name of the file to be deleted.
	 * @returns The return value is a promise.
	 */
	deleteFile(key: string) {
		if (this.configService.get('STORAGE_TYPE') !== 's3') {
			const filepath = join(storagePaths.uploads, key);
			try {
				unlinkSync(filepath);
			} catch (error) {
				this.logger.error(error);
			}
		} else {
			return this.awsS3Service.deleteFile(key);
		}
	}

	/**
	 * If the storage type is not s3, then delete each file in the keys array. If the storage type is s3,
	 * then call the deleteFiles function in the awsS3Service
	 * @param {string[]} keys - string[] - An array of keys to delete.
	 * @returns The return value is a Promise.
	 */
	deleteFiles(keys: string[]) {
		if (this.configService.get('STORAGE_TYPE') !== 's3') {
			keys.forEach(key => this.deleteFile(key));
		} else {
			return this.awsS3Service.deleteFiles(keys);
		}
	}

	/**
	 * If the storage type is not s3, return an empty array, otherwise return the result of the
	 * awsS3Service.listFiles function
	 * @param {string} [path] - The path to the folder you want to list files from.
	 * @returns An object with a property called Contents.
	 */
	listFiles(path?: string) {
		if (this.configService.get('STORAGE_TYPE') !== 's3') {
			return { Contents: [] };
		} else {
			return this.awsS3Service.listFiles(path);
		}
	}
}
