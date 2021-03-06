/*************************************************************************  
* @Execution : default node : cmd> server.js
* 
* 
* @Purpose : To add and remove collaborator in notes
* 
* @description : Add and remove collaborator
* 
* @overview : fundoo application
* @author : Prasanna More <prasannamore.494@gmail.com>
* @version : 1.0
* @since : 27-april-2019
*
******************************************************************************/



const userModel = require('../../model/userModel')
const noteModel = require('../../model/notesModel');
const colModel = require('../../model/collaborate')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const sendMail = require('../../services/nodemailer').sendEmailFunction

/**
  * @description       : add collaborator
  * @purpose           : to add collaborator in notes
  * @param {*} root    : result of previous resolve function
  * @param {*} args    : arguments for resolver funtions
  * @param {*} context : context 
   */
exports.addCollaborator = async (parent, args, context) => {

    try {
        if (context.token) {
            var payload = await jwt.verify(context.token, process.env.APP_SECRET)
            console.log(payload.user_ID)
            var user = await userModel.find({ "_id": payload.user_ID });
            if (!user.length > 0) {
                return {
                    "message": "user not found",
                    "success": false
                }
            }
            var collaboratorUser = await userModel.find({ "_id": args.collaborateID })
            if (!collaboratorUser.length > 0) {
                return {
                    "message": "no such collaborator user",
                    "success": false
                }
            }
            var note = await noteModel.find({ "_id": args.noteID })
            if (!note.length > 0) {
                return {
                    "message": "note not found",
                    "success": false
                }
            }
            var colab = await colModel.find({ collaboratorID: args.collaborateID, NoteID: args.noteID, UserID: payload.user_ID, })
            console.log(colab);
            if (colab.length > 0) {
                return {
                    "message": "note already colabrated",
                    "success": false
                }
            }
            var newColab = new colModel({
                "UserID": payload.user_ID,
                "NoteID": args.noteID,
                "collaboratorID": args.collaborateID
            })
            var save = newColab.save()
            if (save) {
                var url = `you are collaborated with fundoo note by ${user[0].email}`
                sendMail(url, collaboratorUser[0].email)
                return {
                    "message": "user collaborated successfully",
                    "success": true
                }
            }
            else {
                return {
                    "message": "colaboration unsuccessful",
                    "success": false
                }
            }

        }
        return {
            "message": "token not provided",
            "success": false
        }
    } catch (err) {
        console.log("!Error")
        return { "message": err }
    }
}


/**
  * @description       : remove collaborator
  * @purpose           : to remove collaborator from notes
  * @param {*} root    : result of previous resolve function
  * @param {*} args    : arguments for resolver funtions
  * @param {*} context : context 
   */
exports.removeCollaborator = async (parent, args, context) => {

    try {
        if (context.token) {
            var payload = await jwt.verify(context.token, process.env.APP_SECRET)
            console.log(payload.user_ID)
            var user = await userModel.find({ "_id": payload.user_ID });
            if (!user.length > 0) {
                return {
                    "message": "user not found",
                    "success": false
                }
            }
            var collaboratorUser = await userModel.find({ "_id": args.collaborateID })
            if (!collaboratorUser.length > 0) {
                return {
                    "message": "no such collaborator user",
                    "success": false
                }
            }
            var note = await noteModel.find({ "_id": args.noteID })
            if (!note.length > 0) {
                return {
                    "message": "note not found",
                    "success": false
                }
            }
            var colab = await colModel.findOneAndDelete({ collaboratorID: args.collaborateID, NoteID: args.noteID, UserID: payload.user_ID, })
            console.log(colab);
            if (colab) {
                var url = `you are removed from collaborator with fundoo note by ${user[0].email}`
                sendMail(url, collaboratorUser[0].email)
                return {
                    "message": "colabrator removed from note",
                    "success": true
                }

            }
            else {
                return {
                    "message": "colaboration remove unsuccessful",
                    "success": false
                }
            }

        }
        return {
            "message": "token not provided",
            "success": false
        }
    } catch (err) {
        console.log(err)
        return { "message": "!Error" }
    }
}



