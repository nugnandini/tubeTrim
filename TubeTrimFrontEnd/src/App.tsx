import { Routes, Route, useLocation, Navigate } from 'react-router-dom'
import Landing from './Landing'
import Home from './pages/Home'
import ChannelPage from './pages/ChannelPage'
import Watch from './pages/Watch'
import Settings from './pages/Settings'
import Navbar from './Navbar'
import { getDoc, setDoc, doc } from 'firebase/firestore'
import { db, auth } from './firebase'
import { useState, useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'


function App() {



  const location=useLocation()
  const shownav = location.pathname !='/'
  const isHome = location.pathname === '/home'
  const [loading, setLoading] = useState(true)
 
  

  const [boardingComplete, setBoardingComplete]=useState<boolean>(false)

useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (user) => {
    if (!user) {
      setLoading(false)
      return
    }
    const snap = await getDoc(doc(db, 'users', user.uid))
    if (snap.exists()) {
      const data = snap.data().channelsByCategory
      if (data && data.length > 0) {
        setBoardingComplete(true)
      }
    }
    setLoading(false)
  })
  return () => unsubscribe()
}, [])

  if (loading) return <div>Loading...</div>
   if (boardingComplete && location.pathname === '/') {
    return <Navigate to="/home" replace />
  }

  return (
    <div className="appWrapper">
     
    {shownav &&<Navbar />}
   
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/home" element={<Home />} />
      <Route path="/channel/:channelId" element={<ChannelPage />} />
      <Route path="/watch/:videoId" element={<Watch />} />
      <Route path="/settings" element={<Settings />} />
    </Routes>
    </div>
  )
}

export default App