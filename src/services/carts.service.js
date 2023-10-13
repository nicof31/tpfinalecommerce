import { CART_REPOSITORY } from "../repository/respositoryManager.js"

class CartService {
    constructor(){    
        this.cartRepository = CART_REPOSITORY;
    }

    getIdCarts = async (req) => {
      try {
        const cartId = req.params.cid;
        const cart = await this.cartRepository.getIdCarts(cartId)
        return cart;
        }
      catch (error) {
        throw error;
      }
  }

    getAllCarts = async (req) => { 
        try {
            let cartsFilter = await this.cartRepository.getAllCarts(req);
            return cartsFilter;
        } catch (error) {
            throw error;
        }
    }

  addToCart =  async(req) => {
    try {
        const addCartQuan = await this.cartRepository.addToCart(req);
        return addCartQuan;
    } catch (error) {
        throw error;
    }
  }

  updateCarts = async(req) => {
    try {
      const updCartNew = await this.cartRepository.updateCarts(req);
      return updCartNew;
    } catch (error) {
      throw error;
    }
  }

  updateCartsComplet = async (req) => { 
    try {
        const updCartNewComp = await this.cartRepository.updateCartsComplet(req);
        return updCartNewComp;
    } catch (error) {
        throw error;
    }
  }

  deleteProductCarts  = async (req) => { 
    try {
        const cartDelete = await this.cartRepository.deleteProductCarts(req);
        return cartDelete;
    } catch (error) {
        throw error;
    }
  }

  deleteOneProdCarts = async (req) => { 
    try {
        const cartOnePrDelete = await this.cartRepository.deleteOneProdCarts(req);
        return cartOnePrDelete ;
    } catch (error) {
        throw error;
    }
  }

  purchaseCart = async (req) => {
    try {
    const realizarCompra = await this.cartRepository.purchaseCart(req);
    return realizarCompra;        
    } catch (error) {
    throw error;
    }
}

}

export default CartService;
