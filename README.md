# m3u-parser

Deployable Lambda that parses M3U playlist to remove unwanted groups and channels from an IPTV playlist

## Install deps

```
$ npm install
# or
$ yarn
```

## Environment variables

_Required_
`BUCKET_NAME` - the S3 bucket name where the m3u file will be deployed (must already exist, not created as part of this script)

_Optional_
`TARGET_AWS_REGION` - Selected AWS region for Lambda/SSM/S3, defaults to `us-east-1`
`M3U_FILENAME` - the filename for the parsed M3U file (defaults to `tv.m3u`)
`M3U_PLAYLIST_URL` - the playlist URL
`SSM_PARAMETER_NAME` - if using SSM (for example, when username and password are stored in the playlist URL) this is the parameter name to retrieve - defaults to `/m3uparser/kingiptv_url` so will fail to execute if a) M3U_PLAYLIST_URL env var is not specified and b) the above SSM Parameter has not been set
`AXIOS_TIMEOUT` - timeout for axios request in ms, defaults to 30 seconds
`S3_ACL` - ACL for S3 file - defaults to `public-read`
`LAMBDA_SCHEDULE` - frequency of Lambda invocation (remote) based on the Lambda schedule syntax - [more details here](https://docs.aws.amazon.com/lambda/latest/dg/services-cloudwatchevents-expressions.html) - defaults to hourly.

# Setting an SSM parameter with `aws` CLI

If you have the latest version of AWS SDK CLI, you can quickly set an SSM parameter for the IPTV URL as follows

```sh
aws ssm put-parameter \
    --name /m3uparser/kingiptv_url \
    --value "http://myiptvurl?username=foo&password=bar" \
    --type "SecureString" \
    --key-id alias/aws/ssm \
    --overwrite
```

> Note: Make sure you always use a SecureString data type to encrypt sensitive information in Parameter Store.

Once you have created this, you can now use the env variable `SSM_PARAMETER_NAME=/m3uparser/kingiptv_url` to run your Lambda.

# Configuring

You can set included groups in `src/functions/parser/utils/config.ts` by adding regex patterns to match group names, eg. to add a group of Canadian channels, which are prefixed with `CA | ` you would use

```javascript
export const includeGroupNamePatterns = [/^CA \| /];
```

which would filter out ALL groups except those prefixed by CA | - to find out more about M3U group names and notation, please check https://docs.fileformat.com/audio/m3u/

# Run locally

Specify your environment variables inline like so (simplest invocation)

```
BUCKET_NAME=foo serverless invoke local -f parser
```

# Deploy Lambda

To deploy your Lambda, and create the appropriate Lambda roles, simply run

```
BUCKET_NAME=foo serverless deploy
```
