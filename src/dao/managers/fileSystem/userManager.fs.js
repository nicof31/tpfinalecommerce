import { createHashValue, comparePassword } from "../../../utils/encrypt.js";
import CartsManagerFS from "./cartsManager.fs.js";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import passport from "passport";
import { generateJWT } from "../../../utils/jwt.js";
import Lock from 'async-lock';
import EmailService from "../../../services/email.service.js";


export default class UserManagerFS {
  constructor() {
    this.cartsManagerFS = new CartsManagerFS();
    this.path = "src/files/users.json";
    this.ticketsPath = "src/files/tickets.json";
    this.lock = new Lock();
    this.emailService = new EmailService();
  }

  getCurrentDateTime() {
    return new Date().toISOString();
  }

  allToRegister = async (req) => {
    try {
      const { first_name, last_name, email, password, age, role } = req.body;
      const pswHashed = await createHashValue(password);
      let users = [];
      if (fs.existsSync(this.path)) {
        const data = await fs.promises.readFile(this.path, "utf-8");
        users = JSON.parse(data);
      }
      const existingUser = users.find((user) => user.email === email);
      if (existingUser) {
        throw new Error("El correo electrónico ya está registrado");
      }
      const newUser = {
        _id: uuidv4(),
        email,
        password: pswHashed,
        first_name,
        last_name,
        age,
        role,
        cart: null,
        documents: [], 
        last_connection: this.getCurrentDateTime(),
      };
      users.push(newUser);
      const newUserWithCart = await this.cartsManagerFS.addCartsRegister(
        newUser._id
      );
      newUser.cart = newUserWithCart._id;
      await fs.promises.writeFile(this.path, JSON.stringify(users, null, 2));
      console.log("userManagerFs: Usuario registrado exitosamente:", newUser);
      return newUser;
    } catch (error) {
      console.log(`userManagerFs: no se pudo registrar usuario: '${error}'`);
      throw error;
    }
  };

  recoverUser = async (req) => {
    try {
      const { email, new_password } = req.body;
      let users = [];
      if (fs.existsSync(this.path)) {
        const data = await fs.promises.readFile(this.path, "utf-8");
        users = JSON.parse(data);
      }
      const recoverResult = await this.getUser(email);      
      if (recoverResult.error)  {
        return { error: true, message: `El usuario con el correo electrónico ${email} no existe` };
      }
      const newPasswordHashed = await createHashValue(new_password);
      const passwordsMatch = await comparePassword(recoverResult , new_password); 
      if (passwordsMatch === true) {
        console.log("la contraseña  es == a la anterior")
        return { error: true, message: "La nueva contraseña debe ser diferente a la anterior" };
      }
    // Cambiamos la contraseña y guardamos los cambios en el archivo
    recoverResult.password = newPasswordHashed;
    await fs.promises.writeFile(this.path, JSON.stringify(users, null, 2));
    return { success: true, message: "Contraseña cambiada exitosamente" };
  } catch (error) {
    throw { error: true, message: "Ocurrió un error al cambiar la contraseña" };
  }
  };


  loginUser = async (req, res) => {
    return new Promise(async (resolve, reject) => {
      passport.authenticate("loginFs", async (err, user, info) => {
        if (err) {
          console.error(`userManagerFs: Error en la autenticación: ${err}`);
          reject({
            error: "(401): userManagerFs: Ocurrió un error en la autenticación",
          });
        }
        if (!user) {
          reject({ error: "(401): userManagerFs: Credenciales inválidas" });
        }
        try {
          const verifUser = user;
          console.log(
            "🚀 ~ file: userManager.fs.js:108 ~ UserManagerFS ~ passport.authenticate ~ verifUser:",
            verifUser
          );
          const signUser = {
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            role: user.role,
            id: user._id,
          };
          console.log(
            "🚀 ~ file: userManager.fs.js:114 ~ UserManagerFS ~ passport.authenticate ~ signUser:",
            signUser
          );
          const token = await generateJWT({ ...signUser });
          console.log("🚀 ~ userManagerFs ~ token:", token);
          await this.setLastConnectionFS(user._id);
          resolve(token);
        } catch (error) {
          console.error(`userManagerFs: Error al generar el token: ${error}`);
          reject({ error: "userManagerFs: Error en el servidor" });
        }
      })(req);
    });
  };
  
  loginGitHub = async (req, res) => {
    try {
      return new Promise((resolve, reject) => {
        passport.authenticate("githubfs", { session: false }, (err, token) => {
          if (err) {
            console.error(`userManager: Error en la autenticación: ${err}`);
            return reject(err);
          }
          resolve(token);
        })(req, res);
      });
    } catch (error) {
      console.error(`userManager: Error al generar el token: ${error}`);
      throw error;
    }
  };

  githubCallback = async (req, res) => {
    try {
      return new Promise((resolve, reject) => {
        passport.authenticate("githubfs", { session: false }, (err, token) => {
          if (err) {
            console.error(`userManager: Error en la autenticación: ${err}`);
            return reject(err);
          }
          resolve(token);
        })(req, res);
      });
    } catch (error) {
      console.error(`userManager: Error al generar el token: ${error}`);
      throw error;
    }
  };

  getCurrentUserInfo = async (req) => {
    try {
      console.log("estoy saliendo ok");
      const { iat, exp } = req;
      console.log(
        "🚀 ~ file: UserManager.mongodb.js:166 ~ UserManagerMongo ~ getCurrentUserInfo= ~ req:",
        req
      );
      console.log(
        "🚀 ~ file: UserManager.mongodb.js:166 ~ UserManagerMongo ~ getCurrentUserInfo= ~ req.user:",
        req.user
      );
      const { first_name, last_name, email, role, cart, id } = req.user;
      const user = {
        first_name,
        last_name,
        email,
        role,
        cart,
        id,
        iat,
        exp,
      };
      return user;
    } catch (error) {
      console.error(
        `SessionManager: No se puede obtener la información del usuario actual: ${error}`
      );
      throw error;
    }
  };

  getTicketsByUser = async (userEmail) => {
    try {
      const ticketsData = await fs.promises.readFile(this.ticketsPath, "utf-8");
      const tickets = JSON.parse(ticketsData);

      const userTickets = tickets.filter(
        (ticket) => ticket.purchaser === userEmail
      );
      console.log("Tickets para el usuario:", userTickets);
      return userTickets;
    } catch (error) {
      console.error(`Error al obtener los tickets del usuario: ${error}`);
      throw error;
    }
  };

  getUser = async (email) => {
    try {
      let users = [];
      if (await fs.existsSync(this.path)) {
        const data = await fs.promises.readFile(this.path, "utf-8");
        users = JSON.parse(data);
      }
      const existingUser = users.find((user) => user.email === email);
      if (!existingUser) {
        throw new Error(`User not exists`);
      }
      return existingUser;
    } catch (error) {
      return { error: error.message };
    }
  };

  getAll = async () => {
    try {
      let users = [];
      if (await fs.existsSync(this.path)) {
        const data = await fs.promises.readFile(this.path, "utf-8");
        users = JSON.parse(data);
        users = users.map(user => ({
          _id: user._id,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          role: user.role,
          last_connection: user.last_connection
        }));
      }
      return users;
    } catch (error) {
      return { error: error.message };
    }
  };
  
  changeRole = async (uid) => {
    try {
      let users = [];
      if (await fs.promises.access(this.path, fs.constants.F_OK).then(() => true).catch(() => false)) {
        const data = await fs.promises.readFile(this.path, 'utf-8');
        users = JSON.parse(data);
      }
      const existingUserIndex = users.findIndex((user) => user._id === uid);
      if (existingUserIndex === -1) {
        throw new Error(`User not exists.`);
      }
  
      const user = users[existingUserIndex];
      const requiredDocuments = ['documentIdentificacion', 'documentDomicilio', 'documentEstadodecuenta'];
      const missingDocuments = requiredDocuments.filter(doc => !user.documents || !user.documents.find(d => d.name === doc));
  
      if (missingDocuments.length > 0) {
        throw new Error(`Usuario incompleto: Falta cargar los documentos: ${missingDocuments.join(', ')}`);
      }
  
      users[existingUserIndex].role = (users[existingUserIndex].role === 'USER') ? 'PREMIUM' : 'USER';
      await fs.promises.writeFile(this.path, JSON.stringify(users, null, 2));
      const updatedUser = { ...users[existingUserIndex] };
      delete updatedUser.password;
      return updatedUser;
    } catch (error) {
      throw error;
    }
  }
  

  getUserRole = async (uid) => {
    try {
      let users = [];
      if (await fs.promises.access(this.path, fs.constants.F_OK).then(() => true).catch(() => false)) {
        const data = await fs.promises.readFile(this.path, 'utf-8');
        users = JSON.parse(data);
      }
      const existingUser = users.find((user) => user._id === uid);
      if (!existingUser) {
        throw new Error(`User not exists`);
      }
      const userWithoutPassword = { ...existingUser };
      delete userWithoutPassword.password;
      return userWithoutPassword;
    } catch (error) {
    throw error;
    }
  }

  setLastConnectionFS = async (userId) => {
    try {
      let users = [];
      if (fs.existsSync(this.path)) {
        const data = await fs.promises.readFile(this.path, "utf-8");
        users = JSON.parse(data);
      }
      const currentUserIndex = users.findIndex((user) => user._id === userId);
      if (currentUserIndex !== -1) {
        users[currentUserIndex].last_connection = this.getCurrentDateTime();
        await fs.promises.writeFile(this.path, JSON.stringify(users, null, 2));
      }
    } catch (error) {
      console.error(`Error al actualizar la última conexión: ${error}`);
      throw error;
    }
  };

  uploadDocuments = async (req, res) => {
    try {
      const { uid } = req.params;
      const { files } = req;
      const userEmail = req.user.user.email;
      console.log("🚀 ~ file: userManager.fs.js:293 ~ UserManagerFS ~ uploadDocuments= ~ userEmail :", userEmail )
      let user = await this.getUser(userEmail);
      console.log("🚀 ~ file: userManager.fs.js:295 ~ UserManagerFS ~ uploadDocuments= ~  user:",  user)

      if (!user || !user.documents) {
        throw new Error('Usuario no encontrado o sin documentos.');
      }

      let documents = [];
      files.forEach((file) => {
        documents.push({ name: file.fieldname, reference: file.filename });
      });

      const updatedDocuments = await this.pushDocument(user._id, documents);
      return updatedDocuments;
      } catch (error) {
      console.error(`Error in uploadDocuments: ${error}`);
      return error;
    }
  };

  pushDocument = async (uid, documents) => {
    try {
      let users = [];
      if (fs.existsSync(this.path)) {
        const data = await fs.promises.readFile(this.path, 'utf-8');
        users = JSON.parse(data);
      }

      const userIndex = users.findIndex((user) => user._id === uid);

      if (userIndex !== -1) {
        let documentFind = users[userIndex].documents || [];
        
        documents.forEach((document) => {
          const existingIndex = documentFind.findIndex(
            (doc) => doc.name === document.name
          );
          if (existingIndex !== -1) {
            documentFind[existingIndex].reference = document.reference;
          } else {
            documentFind.push(document);
          }
        });

        users[userIndex].documents = documentFind;

        await fs.promises.writeFile(this.path, JSON.stringify(users, null, 2));
        return users[userIndex].documents;
      } else {
        throw new Error('User not exists.');
      }
    } catch (error) {
      console.error(`Error in pushDocument: ${error}`);
      throw error;
    }
  };

deleteUsersInactive = async (email) => {
  try {
    return await this.lock.acquire('writeLock', async () => {
      const data = await fs.promises.readFile(this.path, 'utf-8');
      const users = JSON.parse(data);
      const userIndex = users.findIndex(user => user.email === email);
      if (userIndex === -1) {
        throw new Error(`No se encontró el usuario con email ${email}`);
      }
      const user = users[userIndex];
      users.splice(userIndex, 1);
      const usersStr = JSON.stringify(users, null, 2);
      await fs.promises.writeFile(this.path, usersStr);
      return { success: true };
    });
  } catch (error) {
    return { success: false, error: error.message };
  }
};

deleteUser = async (uid) => {
  try {
    return await this.lock.acquire('writeLock', async () => {
      const data = await fs.promises.readFile(this.path, 'utf-8');
      const users = JSON.parse(data);
      const userIndex = users.findIndex(user => user._id === uid);
      if (userIndex == -1) {
        throw new Error(`No se encontró el usuario con _id ${uid}`);
      }
      const user = users[userIndex];
      users.splice(userIndex, 1);
      const usersStr = JSON.stringify(users, null, 2);
      await fs.promises.writeFile(this.path, usersStr);
      return { success: true };
    });
  } catch (error) {
    return { success: false, error: error.message };
  }
}

}



