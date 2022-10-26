import needle from "needle";
import dotenv from "dotenv";
import fs from "fs";
import os from "os";

dotenv.config();
const apiKey = process.env.API_KEY;

// const videoId = "Cdnx24m-_70";

const getComments = async (videoId, pageToken) => {
  let pageTokenParameter = `&pageToken=${pageToken}`;
  if (!pageToken) {
    pageTokenParameter = ``;
  }
  // console.log(pageTokenString);
  const endpoint = `https://youtube.googleapis.com/youtube/v3/commentThreads?part=snippet&maxResults=100&videoId=${videoId}${pageTokenParameter}&key=${apiKey}`;
  let pageTokenID = "";
  let number = 1;

  await needle("get", endpoint, "", {}).then((response) => {
    // console.log(response.body.nextPageToken);
    pageTokenID = response.body.nextPageToken;
    if (response.body.items) {
      for (const item of response.body.items) {
        if (item.snippet) {
          // console.log(item.snippet.topLevelComment.snippet.textDisplay);
          fs.appendFile(
            "./commentIds.txt",
            item.snippet.topLevelComment.id + os.EOL,
            (err) => {
              if (err) {
                console.log("Failed to append data");
              } else {
                // console.log("Added data to commentIds.txt file");
              }
            }
          );
          fs.appendFile(
            "./comments.txt",
            item.snippet.topLevelComment.snippet.textDisplay + os.EOL,
            (err) => {
              if (err) {
                console.log("Failed to append data");
              } else {
                // console.log("Added data to comments.txt file");
              }
            }
          );
          number++;
        }
      }
    }
  });

  const result = {
    nextPageToken: pageTokenID,
    dataAdded: number,
  };
  return result;
};

// const log = await getComments("Cdnx24m-_70", "").then((log) => {
//   console.log(log);
// });

export default getComments;
