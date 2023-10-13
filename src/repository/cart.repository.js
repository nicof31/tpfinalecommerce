
export default class CartRepository {
    constructor(dao) {
      this.dao = dao;
    }

    getIdCarts = async (cartId) => {
        try {
        const cart = await this.dao.getIdCarts(cartId)  
        return cart;
        }
        catch (error) {
        throw error;
        }
    }

    getAllCarts = async (req) => { 
        try {
            const cartsFilter = await this.dao.getAllCarts(req);
            return cartsFilter;
        } catch (error) {
            throw error;
        }
    }

    addToCart = async (req) => { 
        try {
            const addCartQuan = await this.dao.addToCart(req);
            return addCartQuan;
        } catch (error) {
            throw error;
        }
    }

    updateCarts = async (req) => { 
        try {
            const updCartNew = await this.dao.updateCarts(req);
            return updCartNew;
        } catch (error) {
            throw error;
        }
    }

    updateCartsComplet = async (req) => { 
        try {
            const updCartNewComp = await this.dao.updateCartsComplet(req);
            return updCartNewComp;
        } catch (error) {
            throw error;
        }
    }

    deleteProductCarts  = async (req) => { 
        try {
            const cartDelete = await this.dao.deleteProductCarts(req);
            return cartDelete;
        } catch (error) {
            throw error;
        }
    }

    deleteOneProdCarts = async (req) => { 
        try {
            const cartOnePrDelete = await this.dao.deleteOneProdCarts(req);
            return cartOnePrDelete ;
        } catch (error) {
            throw error;
        }
    }

   purchaseCart = async (req) => {
    try {
    const realizarCompra =  await this.dao.purchaseCart(req);
    return realizarCompra
    } catch (error) {
    throw error;
    }
}
}