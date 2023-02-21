import type { AWS } from "@serverless/typescript";

import parser from "@functions/parser";
import {
  BUCKET_NAME,
  TARGET_AWS_REGION,
  M3U_FILENAME,
  M3U_PLAYLIST_URL,
  SSM_PARAMETER_NAME,
  AXIOS_TIMEOUT,
  S3_ACL,
  LAMBDA_SCHEDULE,
} from "@functions/parser/utils/env";

if (!BUCKET_NAME) {
  throw new Error(
    "Environment variable BUCKET_NAME is not specified, aborting"
  );
}

const serverlessConfiguration: AWS = {
  service: "aws-m3uparser",
  frameworkVersion: "3",
  plugins: ["serverless-esbuild"],
  provider: {
    name: "aws",
    runtime: "nodejs14.x",
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: "1",
      NODE_OPTIONS: "--enable-source-maps --stack-trace-limit=1000",
      BUCKET_NAME,
      TARGET_AWS_REGION,
      M3U_FILENAME,
      M3U_PLAYLIST_URL,
      SSM_PARAMETER_NAME,
      AXIOS_TIMEOUT: "" + AXIOS_TIMEOUT,
      S3_ACL,
      LAMBDA_SCHEDULE,
    },
    timeout: 600,
    iam: {
      role: {
        statements: [
          {
            Effect: "Allow",
            Action: [
              "s3:PutObject",
              "s3:PutObjectAcl",
              "s3:GetObject",
              "s3:GetObjectAcl",
              "s3:DeleteObject",
            ],
            Resource: {
              "Fn::Join": ["", ["arn:aws:s3:::", BUCKET_NAME, "/*"]],
            },
          },
          {
            Effect: "Allow",
            Action: ["s3:ListBucket"],
            Resource: {
              "Fn::Join": ["", ["arn:aws:s3:::", BUCKET_NAME]],
            },
          },
          {
            Effect: "Allow",
            Action: ["ssm:GetParameter"],
            Resource: "*",
          },
        ],
      },
    },
  },
  // import the function via paths
  functions: { parser },
  package: { individually: true },
  custom: {
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ["aws-sdk"],
      target: "node14",
      define: { "require.resolve": undefined },
      platform: "node",
      concurrency: 10,
    },
  },
};

module.exports = serverlessConfiguration;
