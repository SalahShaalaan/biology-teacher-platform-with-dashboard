const mongoose = require('mongoose');

const uri = "mongodb+srv://salahsalah20191988_db_user:YPru8Kpe4wVsloN5@akram-platform.nl3vlkq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
mongoose.connect(uri)
  .then(() => {
    console.log("Connected successfully!");
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
