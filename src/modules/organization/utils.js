const userKeys={
    username:"",
    email:"",
    name:"",
    role:"",
    employeeId:"",
    phoneNumber:123457,
    employeeData:[],
    password:"",
  groups:[],
  organization:"",
}
exports.createUserObject=(org,userData)=>{
    userData['employeeData']=[]
    userData['organization']=org
    Object.keys(userData).map(value=>{
        if(!(value in userKeys)){
            userData['employeeData'].push({
                name:value,
                value:userData[value]
            })
            delete userData[value];
        }
    })
    return userData
}



