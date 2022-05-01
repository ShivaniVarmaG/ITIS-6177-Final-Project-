
'use strict';

const async = require('async');
const sleep = require('util').promisify(setTimeout);
const ComputerVisionClient = require('@azure/cognitiveservices-computervision').ComputerVisionClient;
const ApiKeyCredentials = require('@azure/ms-rest-js').ApiKeyCredentials;
const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const { check, validationResult } = require('express-validator');
var urlencodedParser = bodyParser.urlencoded({ extended: false });



const STATUS_SUCCEEDED = "succeeded";
const STATUS_FAILED = "failed"
async function readTextFromURL(client, url) {
  let result = await client.read(url);
  let operation = result.operationLocation.split('/').slice(-1)[0];
  while (result.status !== STATUS_SUCCEEDED) { await sleep(1000); result = await client.getReadResult(operation); }
  return result.analyzeResult.readResults; 
}

const computerVisionClient = new ComputerVisionClient(
    new ApiKeyCredentials({ inHeader: { 'Ocp-Apim-Subscription-Key': key } }), endpoint);

    function computerVision() {
        async.series([
          async function () {},
          function () {
            return new Promise((resolve) => {
              resolve();
            })
          }
        ], (err) => {
          throw (err);
        });
      }
      
      computerVision();



/**
* @swagger
* /api/v1/readText:
*   post:
*     description: This api can be used to read engilsh text in a given image. Just pass the image URL of an online image of a printed or handwritten and you will receive an output with the corresponding details. For Example try passing this image url https://www.elegantthemes.com/blog/wp-content/uploads/2020/08/hello-world.png
*     parameters:
 *       - name: imageUrl
 *         in: formData
 *         type: string
 *         required: true     
*     responses:
*       '200':
*         description: Everything is alright
*       '400':
*         description: Client side error
*       '500':
*         description: Server side error
*/
router.post('/readText',[check('imageUrl').isURL().withMessage('Entered value must be an URL')],urlencodedParser, async function(req, res){
  const errors = validationResult(req)
  
    if (req.body) {
        if (req.body.imageUrl) {
          if (!errors.isEmpty()) {
            res.send(errors.errors[0].msg)
          }
          const imageUrl = req.body.imageUrl;
          let printedText
          try{
          printedText = (await readTextFromURL(computerVisionClient, imageUrl));
          const now = toText(printedText[0].lines)
            if(now.length == 0 )
            res.send("There is no text to read.")
            else{
          res.status(200).json(now);
            }
          }
          catch (err){
            res.status(err.statusCode).send("Invalid Image URL");
            throw err;
          } 
        }
        else{
          res.send("Bad request !!");
      } 
    }
    else{
        res.send("Bad request");
    }  
  
  
});

function toText(out){
  let result = [];
  if(out.length != 0)
  for (let i = 0 ; i<out.length ; i++){
    result[i] = out[i].text;
  }
  return result;
}






/**
* @swagger
* /api/v1/detectObject:
*   post:
*     description: This api can be used for object detection. We can use the following example https://imagesvc.meredithcorp.io/v3/mm/image?url=https%3A%2F%2Fstatic.onecms.io%2Fwp-content%2Fuploads%2Fsites%2F35%2F2021%2F12%2F14%2Fdaily-fruit-portions-GettyImages-1127822163-2000.jpg
*     parameters:
 *       - name: imageUrl
 *         in: formData
 *         type: string
 *         required: true     
*     responses:
*       '200':
*         description: Everything is alright
*       '400':
*         description: Client side error
*       '500':
*         description: Server side error
*/
router.post('/detectObject',[check('imageUrl').isURL().withMessage('Entered value must be an URL')],urlencodedParser, async function(req, res){
  const errors = validationResult(req)
  
  if (req.body) {
      if (req.body.imageUrl) {
        if (!errors.isEmpty()) {
          res.send(errors.errors[0].msg)
        }
        const imageUrl = req.body.imageUrl;
        let objects;
        try{
        objects = (await computerVisionClient.analyzeImage(imageUrl, { visualFeatures: ['Objects'] })).objects;
        const out = toListOfObjects(objects);
            if(out.length == 0)
            res.send("There are no objects in the image.")
            else
        res.status(200).json(out);
        }
        catch (err){
          res.status(err.statusCode).send("Invalid Image URL");
          throw err;
        } 
      }
      else{
        res.send("Bad request !!");
    } 
  }
  else{
      res.send("Bad request");
  } 

});

function toListOfObjects(items){
  let result = [];
  if(items.length != 0)
  for (let i = 0 ; i<items.length ; i++){
    result[i] = items[i].object;
  }
  return result;

}



module.exports = router;