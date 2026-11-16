import { useParams } from 'react-router-dom'
import axios from 'axios'
import { useState, useEffect } from 'react'

const API_URL = import.meta.env.VITE_API_URL

function Watch() {
  const { videoId } = useParams()
  const [title, setTitle] = useState('')

  useEffect(() => {
    if (!videoId) return

    async function fetchDetails() {
      const response = await axios.get(`${API_URL}/api/video/${videoId}`)
      setTitle(response.data.title)
    }
    fetchDetails()
  }, [videoId])

  return (
    <div className="watchPage">
      <div className="watchPlayer">
        <iframe
          className="watchIframe"
          src={`https://www.youtube.com/embed/${videoId}`}
          title={title || 'YouTube video player'}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
      <h1 className="watchTitle">{title}</h1>
    </div>
  )
}

export default Watch