var multer  = require('multer');
var displayImageModel= require('../models/display-image');
module.exports={
    displayImage:function(req,res){
        displayImageModel.displayImage(function(data){
            res.render('display-image',{imagePath:data})
        })

    }

}