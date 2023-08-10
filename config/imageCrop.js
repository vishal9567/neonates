const sharp=require('sharp')
const fs=require('fs');

module.exports={
    crop:(req)=>{
        console.log("call comes");
        for(let i=0;i<req.files.length;i++){
            const inputFilePath=req.files[i].path;
            
            sharp(inputFilePath)
            .resize(150, 150, {
                kernel: sharp.kernel.nearest,
                fit: 'fill',
                position: 'right top',
                
              })
            .toBuffer((err, processedImageBuffer)=>{
                if(err){
                    console.log("Error while croping the image",err);
                }
                else{
                    fs.writeFile(inputFilePath,processedImageBuffer,(writeErr)=>{
                        if(writeErr){
                            console.log("Error while saving the processed image:", writeErr);
                        }
                        else{
                            console.log("Image cropped and saved successfully to ", inputFilePath);
                            return;
                        }
                    })
                }
            })
        }
    }
}