export const PODCASTING_2_0 = {
  guid: "34631f7b-6950-5c4b-9a96-950b741828c5",
  feedUrl: "https://podcast.doctrineofdiscovery.org/podcast.xml",
  higherEdPodsUrl: "https://higheredpods.com/podcast/mapping-the-doctrine-of-discovery-1781197717154x6260484790613443000",
  op3Prefix: "https://op3.dev/e/",
  op3StatsUrl: "https://op3.dev/show/34631f7b-6950-5c4b-9a96-950b741828c5",
  title: "Mapping the Doctrine of Discovery Podcast",
};

export function op3Url(url) {
  if (!url || url.startsWith(PODCASTING_2_0.op3Prefix)) {
    return url;
  }
  return `${PODCASTING_2_0.op3Prefix}${url}`;
}
