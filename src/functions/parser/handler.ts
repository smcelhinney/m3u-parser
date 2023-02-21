import { S3 } from "aws-sdk";
import {
  BUCKET_NAME as Bucket,
  M3U_FILENAME as Key,
  TARGET_AWS_REGION as region,
  S3_ACL as ACL,
} from "./utils/env";
import { getM3uPlaylist } from "./utils/helpers";

const parser = async () => {
  const m3uContent = await getM3uPlaylist();
  const s3 = new S3({
    region,
  });

  await s3
    .putObject({
      Bucket,
      Key,
      Body: m3uContent,
      ContentType: "application/octet-stream",
      ACL,
    })
    .promise();

  return "parser passed";
};

export const main = parser;
