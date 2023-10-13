import UserModel from "../dao/models/users.model.js"
import SessionService from "../services/session.service.js";
import cartsModel from "../dao/models/carts.model.js";
import { appConfig } from "../config/config.js";
import { EnumErrors, EnumSuccess, ErrorLevels, HttpResponse } from "../middleware/error-rta/error-layer-rta.js"
import EmailService from "../services/email.service.js";
import UserManagerMongo from "../dao/managers/mongodb/UserManager.mongodb.js";
import moment from "moment";

const um = new UserManagerMongo();

const { JWT_COOKIE_NAME } = appConfig;


class SessionController {
    constructor(){
        this.userModel = UserModel;
        this.cartsModel = cartsModel;
        this.sessionService = new SessionService();
        this.httpResponse = new HttpResponse();
        this.emailService = new EmailService();
    }

    allToRegister = async (req, res) => {
      try {
          const addUser = await this.sessionService.allToRegister(req);
          if (addUser.error && addUser.error === "El correo electrónico ya está registrado") {
              const errorMessage = `${EnumErrors.INVALID_PARAMS} - El correo electrónico ya está registrado`;
              req.logger.warning(errorMessage);
              return res.render("user/registererror", {
                  error: `${EnumErrors.INVALID_PARAMS} - El correo electrónico ya está registrado`,
              });
          }          
          return res.redirect("/login");
      } catch (error) {
        const errorCode = EnumErrors.DATABASE_ERROR;
        req.logger[ErrorLevels[errorCode] || "error"](`${errorCode} - Error en el registro de usuario: ${error}`, {
          errorCode,
          errorStack: error.stack,
        });        
          return res.render("user/registererror", { error: `${EnumErrors.DATABASE_ERROR} - Ocurrió un error en el registro de usuario` });
      }
    }

    
    emailRecover = async (req, res) => {
      try {
        const findEmail = await this.sessionService.getUser(req);
        if (findEmail.error === "User not exists") {
          const errorMessage = `${EnumErrors.INVALID_PARAMS} - El correo electrónico proporcionado no existe registrado en la Base de Datos.`;
          req.logger.warning(errorMessage);
          return res.render("user/emailRecoverError", {
              error: `${EnumErrors.INVALID_PARAMS} - El correo electrónico proporcionado no existe registrado en la Base de Datos.`,
          });
        }
    
        await this.emailService.sendPasswordRecoveryEmail(req);
        res.redirect('/login');
      } catch (error) {
        res.status(500).send("Ha ocurrido un error en el servidor.");
      }
    };

    recoverUser = async (req, res) => {
      try {
        const { email } = req.body;
        const recoverResult = await this.sessionService.recoverUser(req);
        if (recoverResult.error) {
          if (recoverResult.message.includes("El usuario con el correo electrónico")) {
            const errorMessage = `${EnumErrors.INVALID_PARAMS} - ${recoverResult.message}`;
            req.logger.warning(errorMessage);
            return res.render("user/recovererror", { error: errorMessage });
          } else if (recoverResult.message === "La nueva contraseña debe ser diferente a la anterior") {
            const errorMessage = `${EnumErrors.INVALID_PARAMS} - ${recoverResult.message}`;
            req.logger.warning(errorMessage);
            return res.render("user/recovererror", { error: errorMessage });
          }
        } 
        return await res.redirect("/login");
      } catch (error) {
        const errorCode = EnumErrors.DATABASE_ERROR;
        req.logger[ErrorLevels[errorCode] || "error"](`${errorCode} - Ocurrió un error en cambio de Password`, {
          errorCode,
          errorStack: error.stack,
        });        
        return res.render("user/recovererror", { error: `${EnumErrors.DATABASE_ERROR} - Ocurrió un error en cambio de Password` });
      }
    };
    

    loginUser = async (req, res) => {
      try {       
        const token = await this.sessionService.loginUser(req);
        return res.cookie(JWT_COOKIE_NAME, token).redirect("/products");
      } catch (error) {
        const errorCode = EnumErrors.UNAUTHORIZED_ERROR;
        req.logger[ErrorLevels[errorCode] || "error"](`${errorCode} - Credenciales inválidas`, {
          errorCode,
          errorStack: error.stack,
        }); 
        return res.render("user/loginerror", { error: `${EnumErrors.UNAUTHORIZED_ERROR} - Credenciales inválidas` });
    }
    }

    loginGitHub = async (req, res) => {
      try {
        const token = await this.sessionService.loginGitHub(req, res); 
        res
        .cookie(JWT_COOKIE_NAME, token, { httpOnly: true })
        .redirect("/products");
      } catch (error) {
        const errorCode = EnumErrors.CONTROLLER_ERROR;
        req.logger[ErrorLevels[errorCode] || "error"](`${errorCode} - Error en el enrutamiento de GitHub callback: ${error}`, {
          errorCode,
          errorStack: error.stack,
        }); 
        res.redirect("/login");
      }
    };

    githubCallback = async (req, res) => {
      try {
        const token = await this.sessionService.githubCallback(req, res);
        res
        .cookie(JWT_COOKIE_NAME, token, { httpOnly: true })
        .redirect("/products");
      } catch (error) {
        req.logger[ErrorLevels[errorCode] || "error"](`${errorCode} - Error en el enrutamiento de GitHub callback: ${error}`, {
          errorCode,
          errorStack: error.stack,
        });
        res.redirect("/login");
      }
    }


    logoutUser = async (req, res) => {
      try {
        res.clearCookie(JWT_COOKIE_NAME).redirect("/login");
      } catch (error) {
        const errorCode = EnumErrors.DATABASE_ERROR;    
        req.logger[ErrorLevels[errorCode] || "error"](`${EnumErrors.CONTROLLER_ERROR} - Error al cerrar sesión: ${error}`, {
          errorCode,
          errorStack: error.stack,
        });
        return this.httpResponse.Error(
          res,
          `${EnumErrors.CONTROLLER_ERROR} - Ocurrió un error al cerrar sesión`,
          { error }
      );
      }
    }
      
    getCurrentUserInfo = async (req, res) => {
      try {
        const userInfo = await this.sessionService.getCurrentUserInfo(req.user);
        res.render("user/current", { user: userInfo });
      } catch (error){
        const errorCode = EnumErrors.CONTROLLER_ERROR;
        req.logger[ErrorLevels[errorCode] || "error"](`${errorCode} - No se puede obtener la información del usuario actual`, {
          errorCode,
          errorStack: error.stack,
        });
        return this.httpResponse.NotFound(
            res,
            `${EnumErrors.DATABASE_ERROR} -  No se puede obtener la información del usuario actual  `, 
            { error: `${error}` }
            );  
        }
    };

    getTicketsByUser = async (req, res) =>{
      const userEmail = req.user.user.email;   
      try {
        const tickets = await this.sessionService.getTicketsByUser(userEmail);
        return this.httpResponse.OK(res, `${EnumSuccess.SUCCESS}`, {tickets});    
      } catch (error){
        const errorCode = EnumErrors.CONTROLLER_ERROR;
        req.logger[ErrorLevels[errorCode] || "error"](`${errorCode} - No se puede obtener la información de los tickets`, {
          errorCode,
          errorStack: error.stack,
        });     
        return this.httpResponse.NotFound(
            res,
            `${EnumErrors.DATABASE_ERROR} -  No se puede obtener la información de los tickets  `, 
            { error: `${error}` }
            );  
        }
    }

    changeRole = async (req, res) => {
      try {
        const { uid } = req.params;
        const resultChange = await this.sessionService.changeRole(uid);
        return this.httpResponse.OK(res, `${EnumSuccess.SUCCESS}`, {resultChange});         
      } catch (error) {
        const errorCode = EnumErrors.INVALID_PARAMS;
        req.logger[ErrorLevels[errorCode] || "error"](
            `${errorCode} - No se pudo procesar el cambio de Role: ${error}`,
            {
            errorCode,
            errorStack: error.stack,
            }
        );             
        return this.httpResponse.NotFound(
            res,
            `${EnumErrors.INVALID_PARAMS} - No se pudo procesar el cambio de Role:`, 
            { error: `${error}` }
            );  
        }
    };

    getUserRole = async (req, res) => {
      try {
        const { uid } = req.params;
        const resultFind = await this.sessionService.getUserRole(uid);
        return this.httpResponse.OK(res, `${EnumSuccess.SUCCESS}`, {resultFind});         
      }catch (error) {
        const errorCode = EnumErrors.INVALID_PARAMS;
        req.logger[ErrorLevels[errorCode] || "error"](
            `${errorCode} - No se pudo obtener los datos del User en la base de datos: ${error}`,
            {
            errorCode,
            errorStack: error.stack,
            }
        );             
        return this.httpResponse.NotFound(
            res,
            `${EnumErrors.INVALID_PARAMS} -No se pudo obtener los datos del User en la base de datos:  `, 
            { error: `${error}` }
            );  
        }
      }

    getAll  = async (req, res) => {
      try {
        const userAll = await this.sessionService.getAll();
        return this.httpResponse.OK(res, `${EnumSuccess.SUCCESS}`, userAll);  
        } catch (error) {
          const errorCode = EnumErrors.DATABASE_ERROR;
          req.logger[ErrorLevels[errorCode] || "error"](
              `${errorCode} - No se pudo obtener los datos de los User en la base de datos: ${error}`,
              {
              errorCode,
              errorStack: error.stack,
              }
          );             
          return this.httpResponse.NotFound(
              res,
              `${EnumErrors.DATABASE_ERROR} -No se pudo obtener los datos de los User en la base de datos:  `, 
              { error: `${error}` }
              );  
          }
        }

    uploadDocuments = async (req, res) => {
      try {
        await this.sessionService.uploadDocuments(req);
        return this.httpResponse.OK(res, EnumSuccess.SUCCESS, { message: "Archivos guardados correctamente" });
      }catch (error) {
        const errorCode = EnumErrors.INVALID_PARAMS;
        req.logger[ErrorLevels[errorCode] || "error"](
            `${errorCode} - No se pudo subir los archivos ${error}`,
            {
            errorCode,
            errorStack: error.stack,
            }
        );             
        return this.httpResponse.NotFound(
            res,
            `${EnumErrors.INVALID_PARAMS} - No se pudo subir los archivos:  `, 
            { error: `${error}` }
            );  
        }
      }

      deleteUsersInactive = async (req, res) => {
        try {
          const users = await this.sessionService.getAll();
          if (!Array.isArray(users) || users.length === 0) {
            const errorCode = EnumErrors.DATABASE_ERROR;
          req.logger[ErrorLevels[errorCode] || "error"](
              `${errorCode} - No se pudo obtener los datos de los User en la base de datos: ${error}`,
              {
              errorCode,
              errorStack: error.stack,
              }
          );             
          return this.httpResponse.NotFound(
              res,
              `${EnumErrors.DATABASE_ERROR} -No se pudo obtener los datos de los User en la base de datos:  `, 
              { error: `${error}` }
              );
          }
          const date = moment();
          const deletionPromises = users.map(async (user) => {
            const diff = 'last_connection' in user ? date.diff(moment(user.last_connection), "minutes") : null;
            if (diff > 10 || diff === null) {
              try {
                const userDeleteResult = await this.sessionService.deleteUsersInactive(user.email);                
                if (userDeleteResult?.success) {
                  try {
                    await this.emailService.sendAccountDeletedEmail(user.email);
                  } catch (emailError) {
                    throw new Error ("Error al enviar el correo de eliminación de cuenta por inactividad al usuario:", emailError);
                  }
                } else {
                  throw new Error(`Error eliminando usuario: ${user.email}`);
                }
              } catch (error) {
                throw error;  
              }
            }
          });
          try {
            await Promise.all(deletionPromises);
            return this.httpResponse.OK(res, EnumSuccess.SUCCESS, { message: "Todos los usuarios inactivos fueron eliminados" });
          } catch (error) {
            return this.httpResponse.Error(
              res,
              `${EnumErrors.INTERNAL_SERVER_ERROR} -No se pudo eliminar los usuarios inactivos: `, 
              { error: `${error}` }
              ); 
          
          
          }
        } catch (error) {
          const errorCode = EnumErrors.DATABASE_ERROR;
          req.logger[ErrorLevels[errorCode] || "error"](
              `${errorCode} - No se pudo eliminar los usuarios inactivos: ${error}`,
              {
              errorCode,
              errorStack: error.stack,
              }
          );             
          return this.httpResponse.NotFound(
              res,
              `${EnumErrors.DATABASE_ERROR} -No se pudo eliminar los usuarios inactivos: `, 
              { error: `${error}` }
              );  
          }
      };

      deleteUser = async (req, res) => {
        try {
            const { uid } = req.params;
            const result = await this.sessionService.deleteUser(uid);
            if (result.success) {
                return this.httpResponse.OK(res, `${EnumSuccess.SUCCESS}`, `Usuario eliminado`);
            } else {
                return this.httpResponse.NotFound(res, `${EnumErrors.NOT_FOUND} - No se encontró el usuario`, {
                    error: `${result.error}`,
                });
            }
        } catch (error) {
            const errorCode = EnumErrors.DATABASE_ERROR;
            req.logger[ErrorLevels[errorCode] || "error"](
                `${errorCode} - No se pudo eliminar el usuario:  ${error}`,
                {
                    errorCode,
                    errorStack: error.stack,
                }
            );
            return this.httpResponse.ServerError(res, `${EnumErrors.SERVER_ERROR} - Error interno del servidor`, {
                error: `${error}`,
            });
        }
    };
    
      
}


export default SessionController

