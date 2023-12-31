const axios = require('axios');

const API_KEY = 'pk_087f69d67a3ffb89a83460b679383cab7eee75e3';
const BASE_URL = "https://jsonlink.io"

const extractTitle = (description) => {
    const startIndex = description.indexOf('TikTok video from') + 'TikTok video from'.length;
    const endIndex = description.indexOf('(@', startIndex);

    if (startIndex !== -1 && endIndex !== -1) { 
        const title = description.substring(startIndex, endIndex).trim();
        return title;
    }
    return null;
}

const getVideoMetadata = async (videoUrl) => {
    try {
        let vurl = String(videoUrl)
        const apiUrl = `${BASE_URL}/api/extract?url=${vurl}&api_key=${API_KEY}`;

        const response = await axios.get(apiUrl);

        if (response.status === 200  && response.data) {
            const videoData = response.data;
            if (vurl.includes("youtu.be") | vurl.includes("youtube.com")) {
                return {
                    url: videoData.url,
                    title: videoData.title.substring(0, videoData.title.lastIndexOf("- YouTube")).trim(),
                    description: videoData.description,
                    file_url: videoData.images[0],
                }; 
            } else if (vurl.includes("tiktok.com")) {
                return {
                    url: videoData.url,
                    title: extractTitle(videoData.description),
                    description: videoData.description,
                    file_url: videoData.images[0],
                    // Extract other relevant metadata as needed
                };
            }
            
        } else {
            throw new Error('Video not found or API key error.');
        }
    } catch (error) {
        console.log(error)
        throw new Error('Error fetching video metadata:', error);
    }
};

module.exports = {
    getVideoMetadata
};