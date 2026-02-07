
const urls = [
  "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  "http://www.youtube.com/watch?v=dQw4w9WgXcQ",
  "https://youtube.com/watch?v=dQw4w9WgXcQ",
  "www.youtube.com/watch?v=dQw4w9WgXcQ",
  "https://youtu.be/dQw4w9WgXcQ",
  "https://www.youtube.com/embed/dQw4w9WgXcQ",
  "https://m.youtube.com/watch?v=dQw4w9WgXcQ", // mobile
  "https://www.youtube.com/v/dQw4w9WgXcQ",
  "https://www.youtube.com/watch?feature=player_embedded&v=dQw4w9WgXcQ"
];

const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;
const extractionRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;

console.log("Testing YouTube URL Regex:");

urls.forEach(url => {
  const isYoutube = youtubeRegex.test(url);
  const match = url.match(extractionRegex);
  const videoId = match ? match[1] : null;

  console.log(`URL: ${url}`);
  console.log(`  isYoutube: ${isYoutube}`);
  console.log(`  videoId: ${videoId}`);
  console.log("---");
});
