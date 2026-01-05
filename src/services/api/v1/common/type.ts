export interface OssStsToken {
  region: string;
  accessKeyId: string;
  accessKeySecret: string;
  stsToken: string;
  bucket: string;
  endpoint?: string;
  expiration: string;
}

export interface UploadResult {
  name: string;
  url: string;
}
