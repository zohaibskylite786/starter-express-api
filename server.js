const HTTP_PORT = process.env.PORT || 8080;

const express = require('express');
const path = require('path');
const app = express();
const multer = require('multer')
const fs = require('fs')
const handleBars = require('express-handlebars')

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './public/images/uploaded')
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname))
  }
})

const upload = multer({ storage: storage })



const data = require(path.join(__dirname, 'blog-service.js'));

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }))

app.engine('.hbs', handleBars.engine({
  extname: '.hbs', helpers: {
    navLink: function (url, options) {
      return '<li' +
        ((url == app.locals.activeRoute) ? ' class="active" ' : '') +
        '><a href="' + url + '">' + options.fn(this) + '</a></li>';
    }
    ,
    equal: function (lvalue, rvalue, options) {
      if (arguments.length < 3)
        throw new Error("Handlebars Helper equal needs 2 parameters");
      if (lvalue != rvalue) {
        return options.inverse(this);
      } else {
        return options.fn(this);
      }
    }
  }
}));
app.set('view engine', '.hbs');

app.use(function (req, res, next) {
  let route = req.baseUrl + req.path;
  app.locals.activeRoute = (route == "/") ? "/" : route.replace(/\/$/, "");
  next();
});

// app.post('/students/add', function(req, res){
//   console.log(req);
// });



app.get('/', (req, res, next) => {
  res.render('home');
});

app.get('/about', (req, res, next) => {
  res.render('about');
});

app.get('/students', (req, res, next) => {
  if (req.query.status) {
    return data.getStudentsByStatus(req.query.status)
      .then(data => { res.render("students", { students: data }) })
      .catch(err => {
        res.render("students", { message: err })
      })
  }
  if (req.query.program) {
    return data.getStudentsByProgramCode(req.query.program)
      .then(data => { res.render("students", { students: data }) })
      .catch(err => {
        res.render("students", { message: err })
      })
  }
  if (req.query.credential) {
    return data.getStudentsByExpectedCredential(req.query.credential)
      .then(data => { res.render("students", { students: data }) })
      .catch(err =>{
        res.render("students", { message: err });
      })
  }
  data
    .getAllStudents()
    .then((data) => {
      console.log(data);
      res.render("students", { students: data })
    })
    .catch((err) => {
      console.log('Error retrieving employees: ' + err);
      res.render("students", { message: err })
    });
});

app.get('/student/:sid', (req, res) => {
  data.getStudentById(req.params.sid)
    .then((data) => {
      res.render("student", { student: data })
    })
    .catch(err => {
      res.status(404).send("Student Not found");
    })
})

app.post('/students/add', (req, res) => {
  data.addStudent(req.body).then(
    res.redirect('/students')
  )
    .catch(err => {
      res.status(500).send("Unable to add Student");
    })
})

app.post("/student/update", (req, res) => {
  data.updateStudent(req.body).then(() => {
    res.redirect("/students");
  }).catch(err => {
    res.status(500).send("Unable to Update Student");
  })
});


app.get('/intlstudents', (req, res, next) => {
  data
    .getInternationalStudents()
    .then((data) => {
      res.render("students", { students: data })
    })
    .catch((err) => {
      console.log('Error retrieving managers: ' + err);
      res.render("students", { message: err })
    });
});

app.get('/programs', (req, res, next) => {
  data
    .getPrograms()
    .then((data) => {
      res.render('programs', { programs:data });
    })
    .catch((err) => {
      console.log('Error retrieving departments: ' + err);
      res.render('programs', { message:err });
    });
});

app.get('/programs/add', (req, res, next) => {
    res.render('addProgram');
});

app.post('/programs/add', (req, res, next) => {
  data
    .addProgram(req.body)
    .then(()=>{
       res.redirect('/programs');
    }).catch(err => {
      res.status(500).send("Unable to add program");
    });
});

app.get('/programs/:pcode', (req, res) => {
  data.getProgramByCode(req.params.pcode)
    .then((data) => {
      res.render("program", { program: data })
    })
    .catch(err => {
      res.status(404).send("Program Not Found"); 
    })
})

app.get('/programs/update', (req, res) => {
  data
    .updateProgram(req.body)
    .then((data) => {
      res.redirect('/programs');
    })
    .catch((err) => {
      res.status(500).send("Unable to update");
    });
});

app.get('/programs/:programCode', (req, res, next) => {
  data
    .getProgramByCode(req.params.programCode)
    .then((data) => {
      res.render('programs', { programs:data });
    })
    .catch((err) => {
      console.log('Error retrieving departments: ' + err);
      // res.render('programs', { message:err });
      res.status(404).send("Program not found");
    });
});

app.get('/students/delete/:id', (req, res) => {
  return data.deleteStudenById(req.params.id)
  .then(data => { 
    res.redirect("/students") })
  .catch(err => {
    res.status(404).send("student Not Found"); 
  })
});

app.get('/programs/delete/:id', (req, res) => {
  return data.deleteProgramByCode(req.params.id)
  .then(data => { 
    res.redirect("/programs") })
  .catch(err => {
    res.status(404).send("program not found");
  })
});

app.get('/students/add', (req, res) => {
  data.getPrograms().then((programs)=>{
    res.render('addStudent', {programs:programs});
  }).catch(()=>{
    res.render('addStudent', {message:'no program found'});
  })
})
app.get('/images/add', (req, res) => {
  res.render('AddImage');
})
app.post('/images/add', upload.single('imageFile'), (req, res) => {
  res.redirect('/images')
})

app.get('/images', (req, res) => {
  fs.readdir("./public/images/uploaded", function (err, data) {
    if (err) return console.log(err)
    console.log(data)
    res.render('images', {
      data: data,
      layout: false // do not use the default Layout (main.hbs)
    })
  })
})

app.use((req, res, next) => {
  res.status(404).send('Page Not Found');
});

data
  .initialize()
  .then(() => {
    app.listen(HTTP_PORT);
    console.log('Express http server listening on ' + HTTP_PORT);
  })
  .catch((err) => {
    console.log('Error starting server: ' + err + ' aborting startup');
  });
