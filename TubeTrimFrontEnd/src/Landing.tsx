import './App.css'
import { useState } from 'react'
import {useEffect} from 'react'
import axios from 'axios'
import { signInWithPopup } from 'firebase/auth'
import { db, auth, provider } from './firebase' 
import { useNavigate } from 'react-router-dom'
import { doc, setDoc, getDoc } from 'firebase/firestore'



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



  function PrintChannelPicker({ 
    category,
    selection,
    onSelect, 
    onRemove 
  }: { 
    category: string, 
    selection:ChannelDetails[],
    onSelect:(channel:ChannelDetails) =>void
    onRemove:(channelId:string) =>void
  
  })
  {

    const [inputValue,setInputValue] =useState<string>('')
    const [data,setData] =useState<string[]>([])
       
      


    useEffect(()=>{
    const timer =setTimeout(async()=>{ 
      console.log('Timer fired for', inputValue)
      const response = await axios.get(`${API_URL}/api/channels?q=${inputValue}`)
      
      inputValue&&setData(response.data)

    },2000) 

    return()=>{
      console.log('cleanup ran, cancelling timer for:', inputValue) 
      clearTimeout(timer)
    }

  },[inputValue])



    
    return ( 
    <div>
        <p>{category}</p>
        <div className='searchBar'>
          <input 
          type='text'
          value={inputValue}
          onChange={(e)=>setInputValue(e.target.value)}
            />
          {inputValue!=''&&<div className='searchResults'>
          {inputValue!=''&&data.map(item=>
          <div className='youtuberSearchResultItem' key={item.channelId} onClick={()=>onSelect(item)}>
            <img className='dp' src={item.thumbnail}/>
            <p>{item.title}</p>
          </div>
          )}
        </div>}
        </div>
        {selection.length>0&&<div className='bgBeige'>
        {selection.map(item=>
        <div className='selectedChannelDisplay' key={item.channelId} >
            <img className='dp' src={item.thumbnail}/>
            <p>{item.title}</p>
            <button className='removeButton' onClick={()=>onRemove(item.channelId)}>X</button>
          </div>)}
          </div>}

         
        
        
    </div>
    )

  
  }


function Landing() {

  const [categories, setCategories] = useState<string[]>([]);
  const allCategories =['Workout','Cooking','Tech', 'Finance', 'Education','Music', 'Wellness','Productivity','Career', 'DIY', 'Language', 'Science']
  const [nextButtonClicked, setNextButtonClicked] = useState<boolean>(false)
  const [noCategoriesError,setnoCategoriesError]=useState<boolean>(false)
  const [noSelectionError,setnoSelectionError]=useState<boolean>(false)
  const [categoryStep, setCategoryStep]=useState<number>(0)


 
 

 
  const [channelsByCategory, setChannelsByCategory] = useState<CategoryChannels[]>([])
 
 const currentCategory = categories[categoryStep]
  const currentSelection =
    channelsByCategory.find(c => c.category === currentCategory)?.channels ?? []
const navigate = useNavigate()

async function handleGoogleSignIn() {
  try {
    const result = await signInWithPopup(auth, provider)
    const user = result.user

    await setDoc(doc(db, 'users', user.uid), {
      
      channelsByCategory,
    })

    navigate('/home')
  } catch (error) {
    console.error('Sign-in error:', error)
  }
}


  function addCategory(category:string){
    setnoCategoriesError(false)
    if(categories.includes(category))
    {
      setCategories(categories.filter(item=>item!=category))
    }
    else{
      if(categories.length>=5) return
 
      setCategories([...categories,category])
      console.log(categories)
    }
  }
 
  function handleNext(){
    if(categories.length===0){
      setnoCategoriesError(true)
      return 
    }
    else{
      setNextButtonClicked(true)
      setChannelsByCategory(categories.map(category=>
      ({
        category:category,
        channels:[]
      })
      ))
    }
  }




 
  function handleNextCategory(){
   
    if(currentSelection.length===0){
      setnoSelectionError(true)
      return
    }
    setCategoryStep(categoryStep+1)
    
  }


    function handleSelectChannel(channel:ChannelDetails){

        if(currentSelection.length>=5) return
        setnoSelectionError(false)

        if (currentSelection.some(ch => ch.channelId === channel.channelId)) return
      setChannelsByCategory(channelsByCategory.map(item=>
        item.category===currentCategory?{...item, channels:[...item.channels,channel]}:item))
        console.log(channelsByCategory)

  }

  function handleRemoveChannel(channelId){
    setChannelsByCategory(channelsByCategory.map(item=>
    item.category===currentCategory?{...item, channels:[...item.channels.filter(ch=>ch.channelId!=channelId)]}:item))

    console.log(channelsByCategory)
  }


 


  return (
    <div>
      <div className="appHeroSection">

        <h1><span>You need Youtube.</span> You just don't need the Spiral.</h1>
        <p>TubeTrim is for people who've decided to touch grass more. Who know that watching 50 videos on how to do something isn't the same as actually doing it.</p>
        <p>TubeTrim helps you watch what matters. Nothing more.</p>

      </div>


<div className="appCategoriesSection">
      {!nextButtonClicked&&(
        
        <div className="appCategoriesSectionContent">
        <h2>What do you need Youtube for?</h2>
        <p>Pick topics you care about</p>
        <div className="grid3by3">

        {allCategories.map(item=>(
        <button
        key={item}
          className={(categories.includes(item))? "onboardingButton selected":"onboardingButton"} 
          onClick={() => addCategory(item)}>
          {item}
        </button>
        ))}
        </div>
        <button className='redButton' onClick={()=>handleNext()}>Next</button>
        {categories.length>=5&&(<p className='redText'>You've selected the maximum of 5 categories.</p>)}
        {noCategoriesError&&(<p className='redText'>You need to select atleast one category.</p>)}
        </div> 

        
      )}


      {nextButtonClicked&&(    
        <div className="appCategoriesSectionContent">
          <h2>Choose your favorite youtubers in each category</h2>

          <PrintChannelPicker key={categoryStep} category={currentCategory} selection={currentSelection} onSelect={handleSelectChannel} onRemove={handleRemoveChannel}/>
          
        {(categoryStep<categories.length-1)?
        <button className='redButton' onClick={()=>handleNextCategory()}>Next</button>
      :
      <button className='redButton' onClick={()=>handleGoogleSignIn()}>Sign In</button>}
        {currentSelection.length>=5&&(<p className='redText'>You've selected the maximum of 5 categories.</p>)}
        {noSelectionError&&(<p className='redText'>You need to select atleast one channel.</p>)}
        
          

        </div>

          
      )}
</div>
    </div>
  )

}

export default Landing
 







