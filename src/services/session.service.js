import { SESSION_REPOSITORY } from "../repository/respositoryManager.js"
import validateSchema from "../middleware/validate-dto.middleware.js";
import { CURRENT_DTO, USERALL_DTO } from "../dto/dtoManager.js";


class SessionService {
    constructor(){
        this.sessionRepository = SESSION_REPOSITORY
    }

    allToRegister= async (req) => {
        try {
            const newUser = await this.sessionRepository.allToRegister(req);        
            return newUser;
        } catch (error) {
            throw error;    
        }
    }

    recoverUser = async (req) => {
        try {
            const newPswHashed = await this.sessionRepository.recoverUser(req);
            return newPswHashed;            
        } catch (error) {
            throw error;    
        }
    }

    loginUser = async (req) => {
            try {
            const signUser = await this.sessionRepository.loginUser(req);
            return signUser
            } catch (error) {
            throw error; 
            }
    }

    loginGitHub = async (req, res) => {
        try {       
        const token =  await this.sessionRepository.loginGitHub(req, res);
        return token;
        } catch (error) {
        throw error;
        }
    }

    githubCallback = async (req, res) => {
        try {       
        const token =  await this.sessionRepository.githubCallback(req, res);
        return token;
        } catch (error) {
        throw error;
        }
    }

    getCurrentUserInfo  = async (req) => {
        try {
        const userInfo = await this.sessionRepository.getCurrentUserInfo(req);
        await validateSchema(userInfo, CURRENT_DTO);
        return userInfo;        
        } catch (error) {
        throw error;
        }
    }

    getTicketsByUser = async (userEmail) => {
        try {
        const tickets = await this.sessionRepository.getTicketsByUser(userEmail);
        return tickets;
        } catch (error) {
        throw error;
        }
    }

    getUser = async (req) => {
        try {
        const userEmail = await this.sessionRepository.getUser(req);
        return userEmail ;
        } catch (error) {
        throw error;
        }
    }

    getAll = async () => {
        try {
        const users = await this.sessionRepository.getAll();
        const validatedUsers = users.map((user) => {
        const { error, value } = USERALL_DTO.validate(user, { abortEarly: false });
        if (error) {
            throw new Error(`Error de validación: ${error.message}`);
            }
            return value; 
        });
        return validatedUsers;
        } catch (error) {
            throw error;
        }
    }
    
    changeRole = async (uid) => {
        try {
        const resultChange = await this.sessionRepository.changeRole(uid);
        return resultChange ;
        } catch (error) {
        throw error;
        }
    }

    getUserRole = async (uid) => {
        try {
        const resultFind = await this.sessionRepository.getUserRole(uid);
        return resultFind ;
        } catch (error) {
        throw error;
        }
    }

    uploadDocuments = async (req) => {
        try {
        const resultUpl= await this.sessionRepository.uploadDocuments(req);
        return resultUpl ;
        } catch (error) {
        throw error;
        }
    }

    deleteUsersInactive = async (email) => {
        try {
        const inactiveUser = await this.sessionRepository.deleteUsersInactive(email);
        return inactiveUser ;
        } catch (error) {
        throw error;
        }
    }

    deleteUser = async (uid) => {
        try {
        const deleteUser = await this.sessionRepository.deleteUser(uid);
        return deleteUser;
        } catch (error) {
        throw error;
        }
    }
    
}


export default SessionService;