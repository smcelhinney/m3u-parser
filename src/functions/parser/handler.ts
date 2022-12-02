import { S3 } from "aws-sdk";
import { getM3uPlaylist } from "./utils/helpers";

const parser = async () => {
  const m3uContent = await getM3uPlaylist();
  const bucketName = "m3u-parse-s3-bucket";
  const s3 = new S3();

  await s3
    .putObject({
      Bucket: bucketName,
      Key: "tv.m3u",
      Body: m3uContent,
      ContentType: 'application/octet-stream',
      ACL: 'public-read'
    })
    .promise();
  return "parser passed";
};

export const main = parser;
