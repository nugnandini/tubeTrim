import { useParams } from 'react-router-dom'

import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'

const API_URL = import.meta.env.VITE_API_URL

type Video = {
  title: string
  thumbnail: string
  channelId: string
  videoId: string
  videoUrl: string
  publishedAt: string
}





function ChannelPage() {
  const { channelId } = useParams()
  const [channelName,setChannelName]=useState<string>('')
  const [data, setData] = useState<Video[]>([])
  const [pageToken, setPageToken]=useState<string | undefined>(undefined)
  const [loading,setLoading]=useState<boolean>(false)
  const sentinelRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const [searchResults, setSearchResults] = useState<Video[]>([])

  
  const [InputValue,setInputValue]=useState<string>('')


    async function fetchVideosInitial() {
      if (loading) return
      setLoading(true)
    const response = await axios.get(`${API_URL}/api/videos?channel=${channelId}`)
    setPageToken(response.data.nextPageToken)
    if (response.data.videos.length > 0) {
  setChannelName(response.data.videos[0].channelTitle)
}
    setData(response.data.videos)
    setLoading(false)
    
  }


    async function fetchVideos() {
      if (loading) return
      setLoading(true)
      const response = await axios.get(`${API_URL}/api/videos?channel=${channelId}&pageToken=${pageToken}`)
       setPageToken(response.data.nextPageToken)
      setData(prev => [...prev, ...response.data.videos])
      setLoading(false)
    
  }

   useEffect(() => {
 
      fetchVideosInitial()
    }, [channelId])



  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && pageToken && !loading) {
        
        fetchVideos()
      }
    })
    observer.observe(sentinelRef.current!)
    return () => observer.disconnect()
  }, [pageToken, loading])

  function handleRedirect(videoId:string){
    navigate(`/watch/${videoId}`)
  }


  useEffect(()=>{
    if(InputValue===''){
      
      return
    }

    
    const timer=setTimeout(async()=>{
      console.log('Timer fired for', InputValue)
      const response = await axios.get(`${API_URL}/api/searchvideos?q=${InputValue}&channel=${channelId}`)
      console.log(response.data.videos)
      setSearchResults(response.data.videos)

    },2000)


  return()=>{
        console.log('cleanup ran, cancelling timer for:', InputValue) 
        clearTimeout(timer)

    }
   }, [InputValue])
  
 
  return (
<div className="lightHeroSection">
  <div><h1>{channelName}</h1></div>
  <input
    type='text'
    value={InputValue}
    onChange={(e)=>setInputValue(e.target.value)}
  />
  {InputValue!=''&&<div className="videoGrid">
     {searchResults.map(item => (
      <div className="videoCard" key={item.videoId} onClick={()=>handleRedirect(item.videoId)}>
        <img className="videoThumb" src={item.thumbnail} referrerPolicy="no-referrer" />
        <p className="videoTitle">{item.title}</p>
        <p className="videoMeta">{item.publishedAt}</p>
      </div>
    ))}
  </div>
    }




  {InputValue===''&&<div className="videoGrid">
    {data.map(item => (
      <div className="videoCard" key={item.videoId} onClick={()=>handleRedirect(item.videoId)}>
        <img className="videoThumb" src={item.thumbnail} referrerPolicy="no-referrer" />
        <p className="videoTitle">{item.title}</p>
        <p className="videoMeta">{item.publishedAt}</p>
      </div>
    ))}
    <div ref={sentinelRef}></div>
  </div>}
 
</div>)
  }



export default ChannelPage