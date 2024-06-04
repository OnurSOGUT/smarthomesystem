const TedarikciTalep = require("../models/TedarikciTalep.js");
const express = require("express");
const router = express.Router();
const verifyToken = require('../Util/authMiddleware.js');





//render için aktif talepler
router.post("/getAll",async(req,res)=>{
    try {
        const talepleri = await TedarikciTalep.find({ price: { $eq: 0 },tedarikciId:req.body.demsayTedarikciId,demsayAktarim:false,iptalTalep:false });
        // res.send(categories);
        res.status(200).json(talepleri);
    } catch (error) {
        console.log(error);
    }
})

//render için iptal talepler
router.post("/getAllCancelled",async(req,res)=>{
    try {
        const talepleri = await TedarikciTalep.find({ price: { $eq: 0 },tedarikciId:req.body.demsayTedarikciId,iptalTalep:true });
        // res.send(categories);
        res.status(200).json(talepleri);
    } catch (error) {
        console.log(error);
    }
})

//render için tamamlanan talepler
router.post("/getAllCompleted",async(req,res)=>{
    try {
        const talepleri = await TedarikciTalep.find({ price: { $gt: 0, $ne: null },tedarikciId:req.body.demsayTedarikciId,iptalTalep:false });
        // res.send(categories);
        res.status(200).json(talepleri);
    } catch (error) {
        console.log(error);
    }
})

//demsay için fiyatlandırılmış ancak henüz aktarılmamış
router.get("/getAllPrice",async(req,res)=>{
    try {
        // const talepler = await TedarikciTalep.find({ price: { $gt: 0, $ne: null } });
        const talepler = await TedarikciTalep.find({ price: { $gt: 0, $ne: null },demsayAktarim:false,iptalTalep:false });

        // console.log("datalar",talepler);
        
        for (const talep of talepler) {
            if (typeof talep.price === 'string') {
                talep.price = parseInt(talep.price);
                await talep.save();
            }
        }

        res.status(200).json(talepler);
    } catch (error) {
        console.log(error);
    }
})

//Tekli talep ancak şuan boşta
router.post("/updateTedarikciTalep",verifyToken,async(req,res)=>{
    try {
        req.body.iptalTalep=false;
        await TedarikciTalep.findOneAndUpdate({_id:req.body._id},req.body);
        // res.send(categories);
        res.status(200).json("Talep güncellendi");
    } catch (error) {
        console.log(error);
    }
})

//Tekli talep sadece fiyat
// router.post("/updateTedarikciTalepPrice",verifyToken,async(req,res)=>{
//     try {
//         req.body.iptalTalep=false;
//         await TedarikciTalep.findOneAndUpdate({_id:req.body._id},req.body);
//         // res.send(categories);
//         res.status(200).json("Talep güncellendi");
//     } catch (error) {
//         console.log(error);
//     }
// })

//Toplu fiyat güncelleme
router.post("/updateSendAllPriceMany",verifyToken, async (req, res) => {
            try {
                  

                  const dataToUpdate  = req.body; 

                    const modifiedCountPromises = dataToUpdate.map(async item => {
                        // Her bir öğe için güncelleme yapın
                        const update = {
                          $set: {
                            iptalTalep: false,
                            price: item.price,
                            moq: item.moq,
                            spq: item.spq,
                            price: item.price,
                            currency: item.currency,
                            leadtime: item.leadtime,
                            datecode: item.datecode,
                            note: item.note,
                          }
                        };

                      
                        const updatedItem = await TedarikciTalep.updateMany({ demsayId: item.demsayId }, update);
                      
                        return updatedItem;
                      });

                      const modifiedCountResults = await Promise.all(modifiedCountPromises);

          
                        let totalModifiedCount = 0;

                        modifiedCountResults.forEach(result => {
                   
                        totalModifiedCount += result.modifiedCount;
                        });

                        if (totalModifiedCount > 0) {
                            res.status(200).json(`${totalModifiedCount} talep güncellendi`);
                        } else {
                            res.status(200).json("Hiçbir talep güncellenmedi");
                        }




            } catch (error) {
                console.log(error);
                res.status(500).json("Talepler güncellenirken bir hata oluştu");
            }
});

//Talepleri iptal etmek için
router.post("/cancelTedarikciTalep",verifyToken,async(req,res)=>{
    try {
        await TedarikciTalep.findOneAndUpdate({_id:req.body._id},req.body);
        // res.send(categories);
        res.status(200).json("Talep iptal edildi");
    } catch (error) {
        console.log(error);
    }
})


//Demsay'a aktarılan fiyatların , render tarafından aktarımları true olarak işaretleniyor

router.post("/updateTedarikciTalepMany", async (req, res) => {
    try {
        const dataToUpdate  = req.body; // Güncellenecek kayıtların Id'lerini içeren bir dizi bekleniyor


        // console.log(dataToUpdate);
        // console.log(req.body);
        // Güncelleme verisi, demsayAktarim alanını true yapmak için
        const update = { $set: { demsayAktarim: true } };

            // Veriyi kullanarak güncelleme işlemini gerçekleştirin
            const modifiedCount = await Promise.all(dataToUpdate.map(async item => {
                // Her bir öğe için güncelleme yapın
                const updatedItem = await TedarikciTalep.updateMany({ demsayId: item.Id }, update);
                
                return updatedItem;
            }));

            // console.log(modifiedCount.length);
            // console.log(modifiedCount);
            // const totalModifiedCount = modifiedCount.reduce((acc, count) => acc + count, 0);

            if (modifiedCount.length > 0) {
                res.status(200).json(`${modifiedCount.length} talep güncellendi`);
            } else {
                res.status(200).json("Hiçbir talep güncellenmedi");
            }

    } catch (error) {
        console.log(error);
        res.status(500).json("Talepler güncellenirken bir hata oluştu");
    }
});



// router.delete("/deleteCategory",async(req,res)=>{
//     try {
//         await Category.findOneAndDelete({_id:req.body.categoryId});
//         // res.send(categories);
//         res.status(200).json("category silindi");
//     } catch (error) {
//         console.log(error);
//     }
// })

//Tekli talep ancak şuan boşta
router.post("/addTalep",async (req,res)=>{
    try {
         const newTalep=new TedarikciTalep(req.body);
         await newTalep.save();

        res.status(200).json("Talep Eklendi")
    } catch (error) {
        res.status(400).json(error);
    }
})

//Demsay açılmış yeni talepleri çoklu olarak ekleniyor.
router.post("/addTalepMany",async (req,res)=>{
    try {
        const newTalepler = req.body.map(talep => new TedarikciTalep(talep));
        await TedarikciTalep.insertMany(newTalepler);
        res.status(200).json("Talep Eklendi")
    } catch (error) {
        res.status(400).json(error);
    }
})

//render için aktif talepler
router.post("/getAllNoOfferYet",async(req,res)=>{
    try {

        // const talepleri = await TedarikciTalep.find({ price: { $eq: 0 },tedarikciId:req.body.demsayTedarikciId,demsayAktarim:false,iptalTalep:false });
        const talepleri = await TedarikciTalep.find({price: { $eq: 0 },tedarikciId:req.body.demsayTedarikciId,demsayAktarim:false,iptalTalep:true });
        // res.send(categories);
        res.status(200).json(talepleri);
    } catch (error) {
        console.log(error);
    }
})

module.exports=router;