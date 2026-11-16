import { getDoc, setDoc, doc } from 'firebase/firestore'
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


  function CategorySettings({
    category,
    selectedChannels,
    onSelect,
    onRemove,
    onRemoveCategory

  }:{
    category:string,
    selectedChannels:ChannelDetails[],
    onSelect:(channel:ChannelDetails, category:string)=>void,
    onRemove:(channelId:string, category:string)=>void
    onRemoveCategory:(category:string)=>void
  }){

    const [inputValue,setInputValue] =useState<string>('')
    const [searchData, setSearchData] = useState<ChannelDetails[]>([])


    useEffect(()=>{
    const timer =setTimeout(async()=>{ 
      console.log('Timer fired for', inputValue)
      const response = await axios.get(`${API_URL}/api/channels?q=${inputValue}`)
      
      inputValue&&setSearchData(response.data)

    },2000) 

    return()=>{
      console.log('cleanup ran, cancelling timer for:', inputValue) 
      clearTimeout(timer)
    }

  },[inputValue])

 

  return (

    <div className="settingsCategory">
      <div className="settingsCategoryHeader">
        <h2>{category}</h2 >
        <button onClick={()=>onRemoveCategory(category)}>Remove</button>
      </div>

      <div className="searchBar">
          <input type="text" 
            placeholder="Search channels" 
            value={inputValue}
            onChange={(e)=>setInputValue(e.target.value)}/>
        </div>

        {inputValue!=''&&<div className='searchResults'>
          {inputValue!=''&&searchData.map(item=>
          <div className='youtuberSearchResultItem' key={item.channelId} onClick={()=>onSelect(item,category)}>
            <img className='dp' src={item.thumbnail}/>
            <p>{item.title}</p>
            
          </div>                                    
          )}
        </div>}

      <div className="settingsCategoryBody">
        <div className="settingsChannels">
          {selectedChannels.map(ch => (
            <div className="selectedChannelDisplay" key={ch.channelId}>
              <img className= 'dp' src={ch.thumbnail} />
              <p>{ch.title}</p>
              <button className='removeButton' onClick={()=>onRemove(ch.channelId, category)}>X</button>
            </div>
          ))}
        </div>

        
      </div>
    </div>)

  }


function Settings() {

const [data, setData] = useState<CategoryChannels[]>([])
const [maxChannelsError, setMaxChannelsError]=useState<boolean>(false)
const [maxCategoriesError, setMaxCategoriesError]=useState<boolean>(false)
const allCategories =['Workout','Cooking','Tech', 'Finance', 'Education','Music', 'Wellness','Productivity','Career', 'DIY', 'Language', 'Science']
const [noChannelsError, setnoChannelsError]=useState<boolean>(false)
const [noCategoriesError, setnoCategoriesError]=useState<boolean>(false)


const navigate = useNavigate()



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

  function onSelect(channel:ChannelDetails, category:string){
    const current = data.find(item => item.category === category)
    if (!current) return
    if (current.channels.length >= 5){
      setMaxChannelsError(true)
      return 

    } 
    if (current.channels.some(ch => ch.channelId === channel.channelId)) return

    setnoChannelsError(false)

    setData(data.map(item =>
      item.category === category
        ? { ...item, channels: [...item.channels, channel] }
        : item
    ))

  }


    function onRemove(channelId:string, category:string){
      setMaxChannelsError(false)
      setData(data.map(item=>
        item.category===category
        ?{...item, channels: item.channels.filter(ch=>ch.channelId!==channelId)}
        :item
      ))

    }

       function onRemoveCategory(category:string){
        setMaxCategoriesError(false)
      setData(data.filter(item=>
        item.category!==category
        
      ))

    }

    function addCategory(category:string){
      if(data.length>=5) {
        setMaxCategoriesError(true)
        return
      }
      setnoCategoriesError(false)
      setData([...data,{category,channels:[]}])
    }

    async function onSave(){

      if(data.length===0){
        setnoCategoriesError(true)
        return
      }
      for(let d of data){
        if(d.channels.length===0){
          setnoChannelsError(true)
          return
        }
      }

      const user = auth.currentUser;
  if (!user) return; 

  try {
    await setDoc(doc(db, 'users', user.uid), {
      channelsByCategory: data
    }, { merge: true }); 
    
    
    console.log("Saved successfully");
    navigate('/home')

  } catch (error) {
    console.error("Error saving data: ", error);
  } 

    }



  return (
    <div className="lightHeroSection">
  <h1>Settings</h1>
  <h2>Add more categories</h2> 

  <div className="grid3by3">

    {allCategories.
    filter
    (item=>(!data.some(ch=>ch.category===item)))
    .map(item=><button key={item} onClick={()=>addCategory(item)}>{item}</button>)
    }

        </div>
      {(maxCategoriesError)&&<p className='redText'>You've selected the maximum of 5 categories.</p>}
        

  {data.map(item=>(
    <div key = {item.category}>
    <CategorySettings  category={item.category} selectedChannels={item.channels} onSelect={onSelect}  onRemove={onRemove} onRemoveCategory={onRemoveCategory}/>
    {(maxChannelsError)&&<p className='redText'>You've selected the maximum of 5 channels.</p>}
  </div>
  ))}

{(noChannelsError)&&<p className='redText'>You need to choose atleast one channel for each category.</p>}
{(noCategoriesError)&&<p className='redText'>You need to choose atleast one category.</p>}
  

  <button className='redButton' onClick={()=>onSave()}>Save</button>



  
</div>)
}
export default Settings