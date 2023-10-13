
export default class MessagesRepository {
    constructor(dao) {
    this.dao = dao;
    }

    sendMessages = async (req) => {
        try {
            const sendNewMessages  = await this.dao.sendMessages(req);
            return sendNewMessages ;
        } catch(error) {
            throw error; 
        };
    }

    getMessages = async (userEmail) => {
        try {
            const getMessages  = await this.dao.getMessages(userEmail);
            return getMessages ;
            } catch(error) {
            throw error; 
        };
    }


}