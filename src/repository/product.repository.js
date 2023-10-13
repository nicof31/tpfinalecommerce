
export default class ProductRepository {
    constructor(dao) {
      this.dao = dao;
    }

    getIdProducts = async (id) => {
      try {
        const busquedaIdProd = await this.dao.productById(id);
        return busquedaIdProd;
      } catch (error) {
        throw error;
      }
    }

    getCombProducts = async (req) => {
      try {
        const busquedaCombProducts  = await this.dao.productCombId(req);
        return busquedaCombProducts ;
      } catch (error) {
        throw error;
      }
    }

    addToProduct = async (req) => {
      try {
        const newProduct = await this.dao.addProduct(req);     
        return newProduct;    
      } catch (error) {
        throw error;
      }
    }

    updateProductsComplet = async (req) => {
      try {
        const newUpdateCom = await this.dao.updateProductsComplet(req);     
        return newUpdateCom;    
      } catch (error) {
        throw error;
      }
    }

    updateProductsPatch = async (req) => {
      try {
        const newObjUpdatePar = await this.dao.updateProductsPatch(req);     
        return newObjUpdatePar;    
      } catch (error) {
        throw error;
      }
    }

    deleteProduct = async (req) => {
      try {
        const idProdDelet = req.params.pid;
        const productIdDelet = await this.dao.deleteProduct(idProdDelet);     
        return productIdDelet;    
      } catch (error) {
        throw error;
      }
    } 

    getProductsView  = async (req) => {
      try {
        const busquedaCombProducts  = await this.dao.getProductsView (req);
        return busquedaCombProducts ;
      } catch (error) {
        throw error;
      }
    }

}