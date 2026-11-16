import { getDoc, doc } from 'firebase/firestore'
import { db, auth } from '../firebase'
import { useState } from 'react'
import {useEffect} from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

const API_URL = import.meta.env.VITE_API_URL

 type ChannelDetails ={
    title:string,
    thumbnail:string
    channelId:string
  }


   type CategoryChannels ={
    category:string,
    channels:ChannelDetails[]
  }


function CategoryButton({
  name, 
  handleCategory
}:{
  name:string,  
  handleCategory:(category:string)=>void
}){
  return <button onClick={()=>handleCategory(name)}>{name}</button>

}
 
function Home() {
  const [data, setData] = useState<CategoryChannels[]>([])
  const [categorySelected,setCategorySelected]=useState<boolean>(false)
  const [category,setCategory] =useState<string>('')
  const [InputValue,setInputValue]=useState<string>('')
  
   

  useEffect(() => {
    async function fetchData() {
      const user = auth.currentUser
      if (!user) return

      const snap = await getDoc(doc(db, 'users', user.uid))
      if (snap.exists()) {
        setData(snap.data().channelsByCategory ?? [])
        
      }
    }
    fetchData()
  }, [])


  function handleCategory(category:string){
    setCategorySelected(true)
    setCategory(category)
    console.log("clicked")
  }

  const navigate = useNavigate()

  function handlePageRedirect(channelId:string){

    navigate(`/channel/${channelId}`)

  }

  
  const categories = data.map(item=>item.category)
  console.log(categories)

  const selectedChannelsId = data
          .find(item => item.category === category)
          ?.channels.map(ch =>ch.channelId)??[]

  return (
    <div>
 
      {!categorySelected&&(
        <div className="appHeroSection">
        <h1 >What do you want to work on today?</h1>
        <div className='flexwrap'>
        {data.map(item=>
          <CategoryButton name={item.category} key = {item.category} handleCategory={handleCategory}/>
        )}
        </div>
      </div>
      )}


      {categorySelected&&(
        <div className="lightHeroSection">
        <div >
          <h1>{category} Time!</h1>
        </div>

        
        <div className='displayChannels'>
          {data
          .find(item => item.category === category)
          ?.channels.map(ch => (
            <div key={ch.channelId} onClick={()=>handlePageRedirect(ch.channelId)}>
              <img className='dp' src={ch.thumbnail} />
              <p>{ch.title}</p>
            </div>
          ))
        }
        </div>
        </div>

      )}


    </div>

  )
}

export default Home