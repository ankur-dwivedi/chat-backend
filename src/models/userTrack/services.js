const level_model = require('../level/index');
const userTrackInfo_model = require('../userTrack/index');
const userLevelInfo_model = require('../userLevel/index');

exports.updateTrackStatus = async (learnerId,trackId)=>{
    try {
        let fetchAllTrackLevels = await level_model.find({trackId}).lean();
        let learnerLevelStatus = [];
        let completedLevels=[];
        let activeLevels=[];
        let status=undefined;
        let score=undefined;
        //logic to find each level status
        for(let i=0;i<fetchAllTrackLevels.length;i++){
            let levelStatus = await userLevelInfo_model.findOne({learnerId,levelId:fetchAllTrackLevels[i]._id}).lean();
            levelStatus===null?"":learnerLevelStatus.push(levelStatus);
            levelStatus===null?"":levelStatus.attemptStatus==='completed'?completedLevels.push(levelStatus):''
            levelStatus===null?"":levelStatus.attemptStatus==='active'?activeLevels.push(levelStatus):''      
        }
        //logic to assign track status and score
        if(completedLevels.length===0){
            score = activeLevels.length;
            status = 'inProgress';
        }else{
            let completedScore = (completedLevels.length/fetchAllTrackLevels.length)*100;
            let activeScore = activeLevels.length;
            score = completedScore + activeScore;
            status = score === 100?'completed':'inProgress';
        }
        // logic to first check whether the user track data already is present if not then create one
        let learnerTrackStatus = await userTrackInfo_model.findOne({creatorUserId:learnerId,trackId}).lean()
        if(learnerTrackStatus===null){
            let userTrackInfo={
                creatorUserId:learnerId,
                trackId:trackId,
                trackProgress:score,
                trackState:status,
            }
            let createUserTrackData = await userTrackInfo_model.create(userTrackInfo);
        }else{
            learnerTrackStatus.trackProgress=score;
            learnerTrackStatus.trackState=status;
            let updateUserTrackData = await userTrackInfo_model.findOne({creatorUserId:learnerId,trackId}).update(learnerTrackStatus);
        }
    } catch (err) {
        console.log(err.name)
        console.log(err.message)
    }
}