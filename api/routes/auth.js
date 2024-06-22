const User = require("../models/User.js");
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');


//! register
router.post("/register", async (req, res) => {
    try {
      const { username, email, password } = req.body;
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      const newUser = new User({
        username,
        email,
        password: hashedPassword
      });
      await newUser.save();
      res.status(200).json("A new user created successfully.");
    } catch (error) {

        if (error.code === 11000) {
          // Duplicate key error
          res.status(400).json({ message: "Bu e-posta adresi zaten kullanılıyor" });
        } else {
            res.status(500).json({ message: "Bir hata oluştu" });
        }
    }
  });


//login
router.post("/login",async(req,res)=>{
    try {
        const user = await User.findOne({email:req.body.email});

        if (user) {
            
            const validPassword = await bcrypt.compare(
                req.body.password,
                user.password
            );

            if (!validPassword) {
                res.status(403).json("Invalid Password");
            }
            else{

                // Token oluşturulur ve kullanıcıya gönderilir
                const userModel={
                    userId:user._id,
                    username:user.username,
                }
                 const token = jwt.sign(userModel, `${process.env.SECRET_KEY}`);

                 userModel.token=token
             
                 res.status(200).json(userModel);
            }
        }
        else{
            res.status(404).send({error:"User not found"});
        }

    } catch (error) {
        console.log(error);
    }
})


//! change password
router.post("/change-password", async (req, res) => {
    try {
       
      const { email, oldPassword, newPassword } = req.body;
  
      // Kullanıcıyı e-posta adresine göre bul
      const user = await User.findOne({ email });
   
      if (!user) {
        return res.status(404).json({ message: "Kullanıcı bulunamadı." });
      }
  
      // Kullanıcının eski şifresini doğrula
      const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
      if (!isPasswordValid) {
        return res.status(400).json({ message: "Eski şifre yanlış." });
      }
  
   
      // Yeni şifreyi hash'le
      const salt = await bcrypt.genSalt(10);
      const hashedNewPassword = await bcrypt.hash(newPassword, salt);
  
      // Yeni şifreyi güncelle
      user.password = hashedNewPassword;
   
      await User.findOneAndUpdate({_id:req.body._id},user);
  
      res.status(200).json({ message: "Şifre başarıyla güncellendi." });
    } catch (error) {
      res.status(400).json({ message: "Şifre güncelleme işlemi başarısız oldu.", error });
    }
  });
  

//reset password
router.post("/reset-password", async (req, res) => {

  try {
       
    const { email, newPassword } = req.body;

    // Kullanıcıyı e-posta adresine göre bul
    const user = await User.findOne({ email });
 
    if (!user) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı." });
    }

    // // Kullanıcının eski şifresini doğrula
    // const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
    // if (!isPasswordValid) {
    //   return res.status(400).json({ message: "Eski şifre yanlış." });
    // }

 
    // Yeni şifreyi hash'le
    const salt = await bcrypt.genSalt(10);
    const hashedNewPassword = await bcrypt.hash(newPassword, salt);

    // Yeni şifreyi güncelle
    user.password = hashedNewPassword;
 
    await User.findOneAndUpdate({_id:req.body._id},user);

    res.status(200).json({ message: "Yeni şifre başarıyla oluşturuldu." });
  } catch (error) {
    res.status(400).json({ message: "Şifre oluşturma işlemi başarısız oldu.", error });
  }


});


module.exports=router;