import getPrismaInstance from "../utils/PrismaClient.js";
import {renameSync} from "fs"

export const addMessage = async (req, res, next) => {
    try {
        console.log("Received request at /add-message:", req.body);
        const prisma = getPrismaInstance();
        const {message, from, to} = req.body;
        const getUser = onlineUsers.get(to);
        if(message && from && to) {
            const newMessage = await prisma.messages.create({
                data: {
                    message, 
                    sender: {connect: {id: parseInt(from)}},
                    reciever: {connect: {id: parseInt(to)}},
                    messageStatus: getUser ? "delivered" : "sent",
                },
                include: {sender: true, reciever: true},
            });
            return res.status(201).send({message: newMessage})
        }
        return res.status(400).send("From, to and Message is required");
    } catch (err) {
        next(err);
    }
}; 


export const getMessages = async (req, res, next) => {
    try {
        const prisma = getPrismaInstance();
        const {from, to} = req.params;
        const messages = await prisma.messages.findMany({
            where: {
                OR:[
                    {
                        senderId: parseInt(from),
                        recieverId: parseInt(to),
                    },
                    {
                        senderId: parseInt(to),
                        recieverId: parseInt(from),
                    },
                ],
            },
        orderBy: {
            id: "asc",
        },
        });

        const unreadMessages = [];
        // console.log(unreadMessages)
        messages.forEach((message, index) => {
            if(message.messageStatus !== "read" && message.senderId === parseInt(to)) {
                messages[index].messageStatus = "read";
                unreadMessages.push(message.id);
            }
        });
        await prisma.messages.updateMany({
            where: {
                id: {in: unreadMessages},
            },
            data: {
                messageStatus: "read",
            },
        });
        res.status(200).json({messages})
    } catch(err) {
        next(err);
    }
}

export const addImageMessage = async (req, res, next) => {
    try {
        if(req.file) {
            const date = Date.now();
            let fileName = "uploads/images" + date + req.file.originalName;
            renameSync(req.file.path, fileName);
            const prisma = getPrismaInstance()
            const {from, to} = req.query;
            if(from && to) {
                const message = await prisma.message.create({
                    data: {
                        message: fileName,
                        sender: {connect: {id: parseInt(from)}},
                        reciever: {connect: {id: parseInt(to)}},
                        type: "image",
                    }
                });
                return res.status(201).json({message})
            }
            return res.status(400).send("From, to is required.");
        }
        return res.status(400).send("Image is required.");
    } catch(err) {
        next(err)
    }
}