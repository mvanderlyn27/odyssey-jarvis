require('dotenv').config();
const express = require('express');
const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const port = process.env.PORT || 3001;

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase URL and service role key are required.');
}
const supabase = createClient(supabaseUrl, supabaseKey);

const SUPABASE_BUCKET_NAME = process.env.SUPABASE_BUCKET_NAME;
if (!SUPABASE_BUCKET_NAME) {
  throw new Error('Supabase bucket name is required.');
}

const fetchFromSupabase = async (filePath, res) => {
  if (!filePath) {
    return res.status(400).send('File path is required.');
  }

  try {
    // Generate a signed URL for the private object.
    // The URL will be valid for 60 seconds.
    const { data, error: signError } = await supabase
      .storage
      .from(SUPABASE_BUCKET_NAME)
      .createSignedUrl(filePath, 60);

    if (signError) {
      throw signError;
    }

    // Fetch the media from the signed URL
    const response = await axios({
      method: 'get',
      url: data.signedUrl,
      responseType: 'stream',
    });

    // Set the appropriate content type for the media
    res.setHeader('Content-Type', response.headers['content-type']);
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year

    // Stream the media back to the client
    response.data.pipe(res);
  } catch (error) {
    console.error(`Error fetching media from Supabase for path: ${filePath}`, error.message);
    if (error.response) {
      return res.status(error.response.status).send(error.response.statusText);
    }
    res.status(500).send('Error fetching media.');
  }
};

app.get('/slides/:post_id/:image_name', async (req, res) => {
  const { post_id, image_name } = req.params;
  const filePath = `slides/${post_id}/${image_name}`;
  await fetchFromSupabase(filePath, res);
});

app.get('/videos/:video_name', async (req, res) => {
  const { video_name } = req.params;
  const filePath = `videos/${video_name}`;
  await fetchFromSupabase(filePath, res);
});

app.listen(port, () => {
  console.log(`TikTok proxy server listening at http://localhost:${port}`);
});
