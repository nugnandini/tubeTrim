import express from 'express'
import 'dotenv/config'
import axios from 'axios'
const YOUTUBE_API_KEY=process.env.YOUTUBE_API_KEY


import cors from 'cors'

const app = express()
app.use(cors())

const PORT=process.env.PORT



app.get('/api/channels',async(req, res)=>{
    const searchTerm=req.query.q 
    const response = await axios.get(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${searchTerm}&type=channel&key=${YOUTUBE_API_KEY}`)
    const data = response.data

    const result=data.items.map(item=>({
        title:item.snippet.title,
        thumbnail:item.snippet.thumbnails.medium.url,
        channelId:item.snippet.channelId
    }))
    res.json(result)
    
})

app.get('/api/video/:videoId', async (req, res) => {
  const videoId = req.params.videoId
  const response =  await axios.get(
    'https://www.googleapis.com/youtube/v3/videos',
    {
      params: {
        part: 'snippet',
        id: videoId,
        key: YOUTUBE_API_KEY,
      },
    }
  )
  const item = response.data.items[0]
  res.json({
    title: item.snippet.title,
    thumbnail: item.snippet.thumbnails.medium.url,
    channelId: item.snippet.channelId,
    publishedAt: item.snippet.publishedAt
  })
})

app.get('/api/videos',async(req, res)=>{
    const channelId = req.query.channel as string
    const pageToken = req.query.pageToken as string | undefined
   
  const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
    params: {
      part: 'snippet',
      channelId,
      type: 'video',
      maxResults: 10,
      pageToken,          
      key: YOUTUBE_API_KEY,
    },
  })    
  const data = response.data
  

    const videos=data.items.map(item=>({
        channelTitle:item.snippet.channelTitle,
        title:item.snippet.title,
        thumbnail:item.snippet.thumbnails.medium.url,
        channelId:item.snippet.channelId,
        videoId: item.id.videoId,
        videoUrl: `https://www.youtube.com/watch?v=${item.id.videoId}`,
        publishedAt: item.snippet.publishedAt
        
    }))

    // res.json(data)
    res.json({
    videos,
    nextPageToken: response.data.nextPageToken
  })
    
})

app.get('/api/searchvideos', async (req, res) => {
  const channelId = req.query.channel as string
  const searchTerm = req.query.q as string

  const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
    params: {
      part: 'snippet',
      channelId,
      q: searchTerm,
      type: 'video',
      maxResults: 10,
      key: YOUTUBE_API_KEY,
    },
  })

  const videos = response.data.items.map((item: any) => ({
    channelTitle: item.snippet.channelTitle,
    title: item.snippet.title,
    thumbnail: item.snippet.thumbnails.medium.url,
    channelId: item.snippet.channelId,
    videoId: item.id.videoId,
    videoUrl: `https://www.youtube.com/watch?v=${item.id.videoId}`,
    publishedAt: item.snippet.publishedAt,
  }))

  res.json({ videos })
})

app.listen(PORT, ()=>{
    console.log('Backend runniong on http://localhost:${Port}')
    
})