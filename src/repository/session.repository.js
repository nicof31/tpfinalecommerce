
export default class SessionRepository {
    constructor(dao) {
      this.dao = dao;
    }

    allToRegister = async (req) => {
        try {
        const newUser =  await this.dao.allToRegister(req);
        return newUser
        } catch (error) {
        throw error;
        }
    }

    recoverUser = async (req) => {
        try {
        const newPswHashed =  await this.dao.recoverUser(req);
        return newPswHashed
        } catch (error) {
        throw error;
        }
    }

    loginUser = async (req) => {
        try {
        const newPswHashed =  await this.dao.loginUser(req);
        return newPswHashed
        } catch (error) {
        throw error;
        }
    }

    loginGitHub = async (req, res) => {
        try {
        const token =  await this.dao.loginGitHub(req, res);
        return token
        } catch (error) {
        throw error;
        }
    }

    githubCallback = async (req, res) => {
        try {       
        const token =  await this.dao.githubCallback(req, res);
        return token;
        } catch (error) {
        throw error;
        }
    }

    getCurrentUserInfo  = async (req) => {
        try {
        const userInfo = await this.dao.getCurrentUserInfo(req);
        return userInfo;        
        } catch (error) {
        throw error;
        }
    }

    getTicketsByUser = async (userEmail) => {
        try {
        const tickets = await this.dao.getTicketsByUser(userEmail);
        return tickets;
        } catch (error) {
        throw error;
        }
    }

    getUser = async (req) => {
        try {
        const email = req.body.email
        const userEmail = await this.dao.getUser(email);
        return userEmail ;
        } catch (error) {
        throw error;
        }
    }

    getAll  = async () => {
        try {
        const userAll = await this.dao.getAll();
        return userAll ;
        } catch (error) {
        throw error;
        }
    }


    changeRole = async (uid) => {
        try {
        const resultChange = await this.dao.changeRole(uid);
        return resultChange ;
        } catch (error) {
        throw error;
        }
    }

    getUserRole = async (uid) => {
        try {
        const resultFind = await this.dao.getUserRole(uid);
        return resultFind ;
        } catch (error) {
        throw error;
        }
    }

    uploadDocuments = async (req) => {
        try {
        const resultUpl= await this.dao.uploadDocuments(req);
        return resultUpl ;
        } catch (error) {
        throw error;
        }
    }

    deleteUsersInactive = async (email) => {
        try {
        const inactiveUser = await this.dao.deleteUsersInactive(email);
        return inactiveUser;
        } catch (error) {
        throw error;
        }
    }

    deleteUser = async (uid) => {
        try {
        const deleteUser  = await this.dao.deleteUser(uid);
        return deleteUser;
        } catch (error) {
        throw error;
        }
    }

}