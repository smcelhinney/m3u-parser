import { includeGroupNamePatterns } from "./config";
import * as m3uparser from "iptv-playlist-parser";
import axios from "axios";
import { SSM } from "aws-sdk";

export const getM3uPlaylist = async () => {
  return new Promise(async (resolve, reject) => {
    const ssm = new SSM({
      region: "us-east-1",
    });

    console.log("Getting parameter");
    const {
      Parameter: { Value: url },
    } = await ssm
      .getParameter({ Name: "/m3uparser/kingiptv_url", WithDecryption: true })
      .promise();

    console.log("Got parameter");

    const { data: stream } = await axios.get(url, {
      responseType: "stream",
      timeout: 30000,
    });

    console.log("Got data");

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
