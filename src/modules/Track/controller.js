const track_Model = require("../../models/Track/index")
const {trackColor1,trackColor2} = require("../../utils/constants") 
module.exports = {
    get:{
        fetchUserTrack:async(req,res)=>{
            try {
                let userData = req.user;
                let userTrackData =  await track_Model.find({userId:userData._id})
                if(userTrackData===null){
                    return res.status(201).json({"status":"success","message":`no Data in db`})
                }
                return res.status(201).json({"status":"success","message":userTrackData})               
            } catch (err) {
                console.log(err.name)
                console.log(err.message)
                res.status(201).json({"status":"failed","message":`err.name : ${err.name}, err.message:${err.message}`})
            }
        }
    },
    post:{
        createTrack:async(req,res)=>{
            try {
                let userData = req.user;
                const getRandomInt=(max)=>{
                    return Math.floor(Math.random() * max);
                  }                
                let data = {
                    userId:userData._id,
                    trackName:req.body.trackName,
                    groupName:req.body.groupName,
                    selectedTheme:req.body.selectedTheme,
                    trackColor1:trackColor1[getRandomInt(3)],
                    trackColor2:trackColor2[getRandomInt(3)]
                }
                let savedData = await track_Model.create(data)
                return  res.status(201).json({"status":"success","message":`successfully saved the data in db`})              
            } catch (err) {
                console.log(err.name)
                console.log(err.message)
                res.status(201).json({"status":"failed","message":`err.name : ${err.name}, err.message:${err.message}`})
            }
        }
    },
    put:{},
    delete:{}
}