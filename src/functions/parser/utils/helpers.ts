import { includeGroupNamePatterns } from "./config";
import * as m3uparser from "iptv-playlist-parser";
import axios from "axios";
import { SSM } from "aws-sdk";
import {
  AXIOS_TIMEOUT,
  M3U_PLAYLIST_URL,
  SSM_PARAMETER_NAME,
  TARGET_AWS_REGION,
} from "./env";

const getM3UPlaylistURL = async () => {
  if (M3U_PLAYLIST_URL) {
    return M3U_PLAYLIST_URL;
  }

  const ssm = new SSM({
    region: TARGET_AWS_REGION,
  });

  const {
    Parameter: { Value: url },
  } = await ssm
    .getParameter({
      Name: SSM_PARAMETER_NAME,
      WithDecryption: true,
    })
    .promise();

  return url;
};

export const getM3uPlaylist = async () => {
  return new Promise(async (resolve, reject) => {
    const url = await getM3UPlaylistURL();

    const { data: stream } = await axios.get(url, {
      responseType: "stream",
      timeout: AXIOS_TIMEOUT,
    });

    let output: string = "";
    stream.on("data", (data) => {
      const stringData = data.toString();
      output += stringData;
    });

    stream.on("error", (error) => {
      reject(error);
    });

    stream.on("end", () => {
      // Parse the output string
      let { header, items } = m3uparser.parse(output);

      // Apply filters to items
      items = items.filter(({ group: { title: groupTitle } }) => {
        for (const pattern of includeGroupNamePatterns) {
          if (groupTitle.match(pattern)) {
            return true;
          }
        }

        return false;
      });

      // Create a stringbuffer with raw header, and raw item content for filtered content
      const resp =
        header.raw +
        "\n" +
        items.map(({ raw }) => String.raw`${raw}`).join("\n");

      // Return this
      resolve(resp);
    });
  });
};
