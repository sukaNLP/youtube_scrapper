import needle from "needle";
import dotenv from "dotenv";

dotenv.config();
const apiKey = process.env.API_KEY;

const getVideoLists = async (pageToken) => {
  let pageTokenParameter = `&pageToken=${pageToken}`;
  if (!pageToken) {
    pageTokenParameter = ``;
  }
  // console.log(pageTokenParameter);
  const endpoint = `https://youtube.googleapis.com/youtube/v3/search?maxResults=50&relevanceLanguage=id${pageTokenParameter}&key=${apiKey}`;

  let videoIds = [];
  let pageTokenID = "";
  await needle("get", endpoint, "", {}).then((response) => {
    // console.log(response.body.nextPageToken);
    pageTokenID = response.body.nextPageToken;
    // console.log(response.body);
    for (const item of response.body.items) {
      videoIds.push(item.id.videoId);
      // console.log(item.id.videoId);
    }
  });
  const result = {
    nextPageToken: pageTokenID,
    videoIds: videoIds,
  };
  return result;
};

// const log = await getVideoLists();
// console.log(log);

export default getVideoLists;
