const group_Model = require("../../models/Group/index")

module.exports = {
    get:{
        fetchUserGroups:async(req,res)=>{
            try {
                let userData = req.user;
                let userTrackData =  await group_Model.find({userId:userData._id})
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
        fetchAllGroups:async(req,res)=>{
            try {               
                let allGroupsData =  await group_Model.find({})
                if(allGroupsData===null){
                    return res.status(201).json({"status":"success","message":`no Data in db`})
                }
                return res.status(201).json({"status":"success","message":allGroupsData})               
            } catch (err) {
                console.log(err.name)
                console.log(err.message)
                res.status(201).json({"status":"failed","message":`err.name : ${err.name}, err.message:${err.message}`})
            }
        },
    },
    post:{
        createGroups:async(req,res)=>{
            try {
                let userData = req.user;                             
                let data = {
                    userId:userData._id,                
                    groupName:req.body.groupName,
                    groupDescription:req.body.groupDescription,                  
                }
                let savedData = await group_Model.create(data)
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