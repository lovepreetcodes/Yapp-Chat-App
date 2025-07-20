import Conversation from "../models/chat.model.js";
import mongoose from "mongoose";
 const addMsgToConversation = async (participants, msg) => {
  try {
    // Find conversation by participants
    let conversation = await Conversation.findOne({ users: { $all: participants } });

    console.log("function called");

    // If conversation doesn't exist, create a new one
    if (!conversation) {
      conversation = await Conversation.create({ users: participants });
    }

    console.log("convo uploading");

    // ✅ Corrected this line — use the document, not the model
    conversation.msgs.push(msg);
    await conversation.save();

    console.log("convo uploaded");
  } catch (err) {
    console.log("Error adding message to conversation: " );
  }
};
 const getMsgsForConversation = async (req, res) => {
  console.log("get function called")
   try {
       const { sender, receiver } = req.query;
       console.log(sender + receiver);
       const participants = [sender, receiver];
       // Find conversation by participants
       const conversation = await Conversation.findOne({ users: { $all: participants } });
       if (!conversation) {
           console.log('Conversation not found');
           return res.status(200).send();
       }
       return res.json(conversation.msgs);





   } catch (error) {
       console.log('Error fetching messages:', error);
       res.status(500).json({ error: 'Server error' });
   }
};


export {
  addMsgToConversation,
  getMsgsForConversation
};