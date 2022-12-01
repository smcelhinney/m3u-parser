import { S3 } from "aws-sdk";
import { getM3uPlaylist } from "./utils/helpers";

const parser = async () => {
  console.time("perf");

  const m3uContent = await getM3uPlaylist();

  // Write file to S3

  const bucketName = "m3u-parse-s3-bucket";
  const s3 = new S3();

  await s3
    .putObject({
      Bucket: bucketName,
      Key: "tv.m3u",
      Body: m3uContent,
      ContentType: 'application/octet-stream'
    })
    .promise();

  console.timeEnd("perf");

  return "parser passed";

  // return formatJSONResponse({
  //   message: `parser passed`,
  //   event,
  // });
};

export const main = parser;
