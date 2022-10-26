import getComments from "./getComments.js";
import getVideoLists from "./getVideoLists.js";
import { promisify } from "util";
import fs from "fs";

// TODO: 
// log quotaUsed and nextRun to a file
// next time script run (new instance), read quotaUsed and nextRun time before running the script
let quotaUsed = 0;

const sleep = promisify(setTimeout);

const waitAndResetQuota = async () => {
  let currentTime = new Date();
  const nextRun = new Date();
  console.log("Script Finished");
  nextRun.setMinutes(currentTime.getMinutes() + 24 * 60);
  console.log("Current time(UTC): ", currentTime.toUTCString());
  console.log("Next Run(UTC): ", nextRun.toUTCString());
  console.log("Status : waiting 24 hours for quota reset");
  await sleep(24 * 60 * 60 * 1000 + 60);
  quotaUsed = 0;
};

const getCommentPages = async (videoId, page) => {
  let pageToken = null;
  for (let index = 0; index < page; index++) {
    let comments;
    if (index == 0) pageToken = null;
    // console.log(pageToken);

    if (quotaUsed > 9950) await waitAndResetQuota();
    comments = await getComments(videoId, pageToken);
    quotaUsed++;
    if (comments) console.log("Daily quota used:", quotaUsed);
    pageToken = comments.nextPageToken;
    await sleep(25);
  }
};

const getLastPageToken = async () => {
  let pageToken = await fs.promises.readFile(
    "./lastVideoPageToken.txt",
    "utf8"
  );
  return pageToken;
};

const getVideoComments = async () => {
  let pageToken;
  pageToken = await getLastPageToken();
  let number = 1;
  while (quotaUsed < 10000) {
    console.log("Daily quota used:", quotaUsed);
    if (quotaUsed > 9800) await waitAndResetQuota();
    quotaUsed = quotaUsed + 100;
    const videos = await getVideoLists(pageToken);
    pageToken = videos.nextPageToken;
    if (pageToken) {
      fs.writeFile("./lastVideoPageToken.txt", pageToken, (err) => {
        if (err) {
          console.log("Failed to write data");
        } else {
          // console.log("Added data to comments.txt file");
        }
      });
    }
    for (const id of videos.videoIds) {
      console.log("Video ", number);
      await getCommentPages(id, 30);
      await sleep(100);
      number++;
    }
  }
};

getVideoComments();
