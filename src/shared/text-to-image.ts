const textToImage = require('text-to-image');

export async function textToImageBase64(text = 'leekhub.com') {
  const dataUri = await textToImage.generate(text);
  console.log(dataUri);
  return dataUri;
}
