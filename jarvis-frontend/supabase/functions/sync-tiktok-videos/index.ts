/// <reference types="https://deno.land/x/supa_fly@0.2.1/types.d.ts" />

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

const TIKTOK_API_BASE = "https://open.tiktokapis.com/v2";

interface TikTokVideo {
  id: string;
  title: string;
  video_description: string;
  share_url: string;
  duration: number;
  height: number;
  width: number;
  embed_link: string;
  cover_image_url: string;
  create_time: number;
  like_count: number;
  comment_count: number;
  share_count: number;
  view_count: number;
}

serve(async (req: Request) => {
  console.log("sync-tiktok-videos function triggered");
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { account_id } = body;
    console.log("Request body:", body);
    console.log(`Syncing videos for account ID: ${account_id}`);
    if (!account_id) throw new Error("TikTok account ID is required.");

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    console.log("Querying for account with ID:", account_id);
    const { data: account, error: accountError } = await supabaseAdmin
      .from("tiktok_accounts")
      .select("access_token")
      .eq("id", account_id)
      .single();

    if (accountError) {
      console.error("Error fetching account:", accountError);
      throw accountError;
    }
    if (!account) {
      console.error("TikTok account not found for ID:", account_id);
      throw new Error("TikTok account not found.");
    }

    console.log("Successfully fetched account from Supabase. Access token:", account.access_token);

    let allVideos: TikTokVideo[] = [];
    let cursor: string | null = null;
    let hasMore = true;

    while (hasMore) {
      const url = new URL(`${TIKTOK_API_BASE}/video/list/`);
      url.searchParams.append(
        "fields",
        "id,title,video_description,share_url,duration,height,width,embed_link,cover_image_url,create_time,like_count,comment_count,share_count,view_count"
      );
      console.log("Fetching videos from TikTok API with URL:", url.toString());
      const response = await fetch(url.toString(), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${account.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ max_count: 20, cursor: cursor }),
      });

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        const responseBody = await response.json();
        console.log("TikTok API response status:", response.status);
        console.log("TikTok API response body:", responseBody);

        if (!response.ok) {
          throw new Error(`TikTok Video List API error: ${responseBody.error.message}`);
        }

        const { data } = responseBody;
        console.log(`Fetched a page of videos. Count: ${data.videos.length}, Has More: ${data.has_more}`);
        allVideos = allVideos.concat(data.videos);
        hasMore = data.has_more;
        cursor = data.cursor;
      } else {
        const text = await response.text();
        console.error("TikTok API returned non-JSON response:", text);
        throw new Error(`TikTok API returned non-JSON response: ${text}`);
      }

      if (hasMore) {
        // Wait for 500ms to avoid hitting rate limits
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }
    console.log(`Total videos fetched from TikTok: ${allVideos.length}`);

    const { data: jarvisUser } = await createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: req.headers.get("Authorization")! } } }
    ).auth.getUser();

    if (!jarvisUser.user) throw new Error("Could not get Jarvis user.");

    console.log("Successfully fetched Jarvis user.");

    const videoIds = allVideos.map((v) => v.id);
    const { data: existingPosts, error: existingPostsError } = await supabaseAdmin
      .from("posts")
      .select("id, post_id")
      .in("post_id", videoIds);

    if (existingPostsError) {
      console.error("Error fetching existing posts:", existingPostsError);
      throw existingPostsError;
    }

    const existingPostIds = new Set(existingPosts.map((p: { id: number; post_id: string }) => p.post_id));
    const videosToCreate = allVideos.filter((v) => !existingPostIds.has(v.id));
    const videosToUpdate = allVideos.filter((v) => existingPostIds.has(v.id));

    console.log(`Found ${videosToCreate.length} new videos to create.`);
    console.log(`Found ${videosToUpdate.length} existing videos to update.`);

    // Handle new videos
    if (videosToCreate.length > 0) {
      const postsToInsert = videosToCreate.map((video) => {
        console.log(
          `Processing video for insertion - ID: ${video.id}, Title: ${video.title}, Description: ${video.video_description}`
        );
        return {
          tiktok_account_id: account_id,
          post_id: video.id,
          title: video.title,
          description: video.video_description,
          status: "PUBLISHED" as const,
          created_in_jarvis: false,
          tiktok_share_url: video.share_url,
          tiktok_embed_url: video.embed_link,
          published_at: new Date(video.create_time * 1000).toISOString(),
          created_at: new Date(video.create_time * 1000).toISOString(),
        };
      });

      console.log("Inserting new posts:", postsToInsert);
      const { data: insertedPosts, error: insertError } = await supabaseAdmin
        .from("posts")
        .insert(postsToInsert)
        .select();

      if (insertError) {
        console.error("Error inserting posts:", insertError);
        throw insertError;
      }
      console.log(`Inserted ${insertedPosts.length} new posts.`);

      if (insertedPosts) {
        const analyticsToInsert = insertedPosts.map((post: any) => {
          const video = videosToCreate.find((v) => v.id === post.post_id);
          return {
            post_id: post.id,
            likes: video?.like_count || 0,
            comments: video?.comment_count || 0,
            shares: video?.share_count || 0,
            views: video?.view_count || 0,
          };
        });

        if (analyticsToInsert.length > 0) {
          console.log("Inserting analytics for new posts:", analyticsToInsert);
          const { error: analyticsError } = await supabaseAdmin.from("post_analytics").insert(analyticsToInsert);
          if (analyticsError) {
            console.error("Error inserting post analytics:", analyticsError);
            throw analyticsError;
          }
          console.log(`Inserted ${analyticsToInsert.length} post analytics records.`);
        }

        await Promise.all(
          insertedPosts.map(async (post: any) => {
            const video = videosToCreate.find((v) => v.id === post.post_id);
            if (video?.cover_image_url) {
              console.log(`Downloading cover image for post ${post.id} from ${video.cover_image_url}`);
              const response = await fetch(video.cover_image_url);
              if (response.ok) {
                const blob = await response.blob();
                const filename = `${post.id}-${Date.now()}.jpg`;
                const path = `slides/${post.id}/${filename}`;

                // First, insert the asset record
                const { data: asset, error: insertError } = await supabaseAdmin
                  .from("post_assets")
                  .insert({
                    post_id: post.id,
                    asset_url: path,
                    asset_type: "slides",
                    order: 0,
                  })
                  .select()
                  .single();

                if (insertError) {
                  console.error(`Error inserting asset for post ${post.id}:`, insertError);
                  return; // Skip upload if insert fails
                }

                // Now, upload the image which will trigger the processing function
                console.log(`Uploading image to storage at path: ${path}`);
                const { error: uploadError } = await supabaseAdmin.storage.from("tiktok_assets").upload(path, blob);

                if (uploadError) {
                  console.error(`Error uploading image for post ${post.id}:`, uploadError);
                } else {
                  console.log(`Successfully uploaded image for post ${post.id}. The trigger will now process it.`);
                }
              }
            }
          })
        );
      }
    }

    // Handle existing videos - update post data and insert new stats
    if (videosToUpdate.length > 0) {
      // Update post details
      const postsToUpdate = videosToUpdate.map((video) => {
        const existingPost = existingPosts.find((p: { id: number; post_id: string }) => p.post_id === video.id);
        return {
          id: existingPost!.id,
          post_id: video.id,
          title: video.title,
          description: video.video_description,
          tiktok_share_url: video.share_url,
          tiktok_embed_url: video.embed_link,
          published_at: new Date(video.create_time * 1000).toISOString(),
        };
      });

      for (const post of postsToUpdate) {
        const { error: updateError } = await supabaseAdmin
          .from("posts")
          .update({
            title: post.title,
            description: post.description,
            tiktok_share_url: post.tiktok_share_url,
            tiktok_embed_url: post.tiktok_embed_url,
            published_at: post.published_at,
          })
          .eq("id", post.id);

        if (updateError) {
          console.error(`Error updating post ${post.id}:`, updateError);
          // Decide if you want to throw or just log the error
        }
      }
      console.log(`Updated ${postsToUpdate.length} existing posts.`);

      // Insert new analytics
      const analyticsToInsert = videosToUpdate.map((video) => {
        const existingPost = existingPosts.find((p: { id: number; post_id: string }) => p.post_id === video.id);
        return {
          post_id: existingPost!.id,
          likes: video.like_count,
          comments: video.comment_count,
          shares: video.share_count,
          views: video.view_count,
        };
      });

      console.log("Inserting analytics for existing posts:", analyticsToInsert);
      const { error: analyticsError } = await supabaseAdmin.from("post_analytics").insert(analyticsToInsert);

      if (analyticsError) {
        console.error("Error inserting post analytics for existing posts:", analyticsError);
        throw analyticsError;
      }
      console.log(`Inserted ${analyticsToInsert.length} post analytics records for existing posts.`);
    }

    console.log("Sync process completed successfully.");
    return new Response(JSON.stringify({ message: `Synced ${allVideos.length} videos.` }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    console.error("An error occurred in sync-tiktok-videos function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
