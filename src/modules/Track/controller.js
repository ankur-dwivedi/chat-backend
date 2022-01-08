const track_Model = require("../../models/Track/index")
const {trackColorFill,trackColorBorder} = require("../../utils/constants") 
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
        },
        fetchTrackByGroups:async(req,res)=>{
            try {
                let userData = req.user;
                let groupId = req.body.groupId
                let GroupTrackData =  await track_Model.find({groupId})
                if(GroupTrackData===null){
                    return res.status(201).json({"status":"success","message":`no Data in db`})
                }
                return res.status(201).json({"status":"success","message":GroupTrackData})               
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
                let randomNumber = getRandomInt(3);                 
                let data = {
                    userId:userData._id,
                    trackName:req.body.trackName,
                    groupName:req.body.groupName,
                    selectedTheme:req.body.selectedTheme,
                    trackColorFill:trackColorFill[randomNumber],
                    trackColorBorder:trackColorBorder[randomNumber]
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