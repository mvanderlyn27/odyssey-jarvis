require('dotenv').config();
const express = require('express');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 3001;

// This will be your Supabase Storage URL
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_BUCKET_NAME = process.env.SUPABASE_BUCKET_NAME;
const SUPABASE_BUCKET_URL = `${SUPABASE_URL}/storage/v1/object/public/${SUPABASE_BUCKET_NAME}`;

app.get('/photo/:image_name', async (req, res) => {
  const { image_name } = req.params;

  if (!image_name) {
    return res.status(400).send('Image name is required.');
  }

  try {
    const imageUrl = `${SUPABASE_BUCKET_URL}/${image_name}`;
    
    // In a real implementation, you would use the Supabase client with authentication
    // For this example, we'll assume the bucket is public and use axios.
    const response = await axios({
      method: 'get',
      url: imageUrl,
      responseType: 'stream',
    });

    // Set the appropriate content type for the image
    res.setHeader('Content-Type', response.headers['content-type']);
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year

    // Stream the image back to the client
    response.data.pipe(res);
  } catch (error) {
    console.error('Error fetching image from Supabase:', error.message);
    if (error.response) {
      return res.status(error.response.status).send(error.response.statusText);
    }
    res.status(500).send('Error fetching image.');
  }
});

app.listen(port, () => {
  console.log(`TikTok proxy server listening at http://localhost:${port}`);
});
