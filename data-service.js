const fs = require('fs');
const { resolve } = require('path');
const path = require('path');

const { Sequelize, Op, DataTypes, Model } = require('sequelize');


var sequelize = new Sequelize('rvrwdrat', 'rvrwdrat', 'u5rI3JhMXwD2RYFCnrudqFUPCLIB7sy7', {
  host: 'peanut.db.elephantsql.com',
  dialect: 'postgres',
  port: 5432,
  dialectOptions: {
      ssl: { rejectUnauthorized: false }
  },
   query: { raw: true }
});

class Student extends Model {}


Student.init({
  studentID:{
    type:DataTypes.INTEGER,
    primaryKey:true,
    autoIncrement:true
  },
  firstName:{
    type:DataTypes.STRING
  },
  lastName:{
    type:DataTypes.STRING
  },
  email:{
    type:DataTypes.STRING
  },
  phone:{
    type:DataTypes.STRING
  },
  addressStreet:{
    type:DataTypes.STRING
  },
  addressCity:{
    type:DataTypes.STRING
  },
  addressState:{
    type:DataTypes.STRING
  },
  addressPostal:{
    type:DataTypes.STRING
  },
  isInternationalStudent:{
    type:DataTypes.BOOLEAN
  },
  expectedCredential:{
    type:DataTypes.STRING
  },
  status:{
    type:DataTypes.STRING
  },
  registrationDate:{
    type:DataTypes.STRING
  },
  program:{
    type:DataTypes.INTEGER
  }
}, {
  // Other model options go here
  sequelize, // We need to pass the connection instance
  modelName: 'Student' // We need to choose the model name
});

class Program extends Model {}


Program.init({
  id:{
    type:DataTypes.INTEGER,
    autoIncrement:true,
    primaryKey:true
  },
  programCode:{
    type:DataTypes.STRING,
    primaryKey:true
  },
  programName:{
    type:DataTypes.STRING
  }
}, {
  // Other model options go here
  sequelize, // We need to pass the connection instance
  modelName: 'Program' // We need to choose the model name
});

Program.hasMany(Student, {foreignKey: 'program'});



var students = [];
var programs = [];

const initialize = () => {
  return new Promise((resolve, reject) => {
    try {
       sequelize.sync({ force: true });
    } catch (ex) {
      reject('unable to sync the database');
    }
    resolve();
  });
};

const  getAllStudents = async () => {
    const students = await Student.findAll();
    return new Promise((resolve, reject) =>{
        if(students.length > 0){
          resolve(students);
        }else{
          reject('No students found!');
        }
    })
};


// getAllStudents()
// .then((res)=>{
//   console.log(res);
// }).catch((res)=>{
//    console.log(res);
// });

// const  getStudentsByStatus = async () => {
//   const students = await Student.findAll();
//   return new Promise((resolve, reject) =>{
//       if(students.length > 0){
//         resolve(students);
//       }else{
//         reject('No students found!');
//       }
//   })
// };

const getInternationalStudents = () => {
  return new Promise((resolve, reject) => {
    const all_students = students.filter((student) => {
      return student.isInternationalStudent === true;
    });
    if (all_students.length > 0) {
      resolve(all_students);
    } else {
      reject('No results found!');
    }
  });
};

const getPrograms = () => {
  return new Promise((resolve, reject) => {
    if (programs.length === 0) {
      reject('No results found');
    } else {
      resolve(
        programs.filter(() => {
          return true;
        })
      );
    }
  });
};


const  getStudentsByStatus = async (status) => {
  const students = await Student.findAll({
    where: {
      status: {
        [Op.eq]: status
      }
    }
  });

  return new Promise((resolve, reject) =>{
      if(students.length > 0){
        resolve(students);
      }else{
        reject(`No students found! ${status}`);
      }
  })
};

// const getStudentsByStatus = (status) => {
//   return new Promise((resolve, reject) => {
//     const filteredByStatus = []
//     for (let index = 0; index < students.length; index++) {
//       if (students[index].status == status) {
//         filteredByStatus.push(students[index])
//       }

//     }
//     if (filteredByStatus.length == 0) reject('No results found (getStudentsByStatus)')
//     resolve(filteredByStatus)
//   })
// }

const getStudentsByProgramCode = (programCode) => {
  return new Promise((resolve, reject) => {
    const filteredByProgram = []
    for (let index = 0; index < students.length; index++) {
      if (students[index].program == programCode) {
        filteredByProgram.push(students[index])
      }

    }
    if (filteredByProgram.length == 0) reject('No results found (getStudentsByProgramCode)')
    resolve(filteredByProgram)
  })
}

const getStudentsByExpectedCredential = (credential) => {
  return new Promise((resolve, reject) => {
    const filteredByCredential = []
    for (let index = 0; index < students.length; index++) {
      if (students[index].expectedCredential == credential) {
        filteredByCredential.push(students[index])
      }

    }
    if (filteredByCredential.length == 0) reject('No results found (getStudentsByExpectedCredential)')
    resolve(filteredByCredential)
  })
}

const getStudentById = (sid) => {
  return new Promise((resolve, reject) => {
    const filteredBySid = students.filter((student) => {
      return student.studentID == sid
    })
    if (filteredBySid.length == 0) reject('No results found (getStudentById)')
    resolve(filteredBySid[0])
  })
}
const addStudent = (StudentData) => {
  return new Promise((resolve, reject) => {
    let isInternational
    if (StudentData.isInternationalStudent == undefined) {
      isInternational = false
    } else {
      isInternational = true
    }
    const studentID = students.length + 1
    const studentObject = {
      "studentID": studentID,
      "firstName": StudentData.firstName,
      "lastName": StudentData.lastName,
      "email": StudentData.email,
      "phone": StudentData.phone,
      "addressStreet": StudentData.addressStreet,
      "addressCity": StudentData.addressCity,
      "addressState": StudentData.addressState,
      "addressPostal": StudentData.addressPostal,
      "gender": StudentData.gender,
      "isInternationalStudent": isInternational,
      "expectedCredential": StudentData.expectedCredential,
      "status": StudentData.status,
      "program": StudentData.program,
      "registrationDate": StudentData.registrationDate
    }
    students.push(studentObject)
    resolve()
  })
}
const updateStudent = (studentData) => {
  return new Promise((resolve, reject) => {
    for (let i = 0; i < students.length; i++) {
      const id = studentData.studentID
      if (students[i].studentID.trim() == id.trim()) {
        students[i].firstName = studentData.firstName
        students[i].lastName = studentData.lastName
        students[i].email = studentData.email
        students[i].phone = studentData.phone
        students[i].addressStreet = studentData.addressStreet
        students[i].addressCity = studentData.addressCity
        students[i].addressState = studentData.addressState
        students[i].addressPostal = studentData.addressPostal
        students[i].isInternationalStudent = studentData.isInternationalStudent
        students[i].expectedCredential = studentData.expectedCredential
        students[i].status = studentData.status
        students[i].program = studentData.program
        students[i].registrationDate = studentData.registrationDate
      }
    }
    resolve()
  })
}

module.exports = {
  initialize,
  getAllStudents,
  getInternationalStudents,
  getPrograms,
  getStudentsByStatus,
  getStudentById,
  getStudentsByExpectedCredential,
  getStudentsByProgramCode,
  addStudent,
  updateStudent
};
