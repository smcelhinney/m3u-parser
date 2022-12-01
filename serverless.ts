import type { AWS } from "@serverless/typescript";

import parser from "@functions/parser";

const serverlessConfiguration: AWS = {
  service: "aws-m3uparser",
  frameworkVersion: "3",
  plugins: ["serverless-esbuild", "serverless-offline"],
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
    },
    timeout: 600,
    iam: {
      role: {
        statements: [
          {
            Effect: "Allow",
            Action: ["s3:GetObject", "s3:PutObject"],
            Resource: {
              "Fn::Join": ["", ["arn:aws:s3:::", "m3u-parse-s3-bucket", "/*"]],
            },
          },
          {
            Effect: "Allow",
            Action: ["s3:ListBucket"],
            Resource: {
              "Fn::Join": ["", ["arn:aws:s3:::", "m3u-parse-s3-bucket"]],
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
