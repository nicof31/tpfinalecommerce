import { generateProduct } from "../utils/testFackerGenerateProducts.js";

class MockingService { 
    constructor(){
    }

    addProductMock = async () => {
        try {
            let products = [];
            for (let index = 0; index < 100; index++) {
            const product = await generateProduct();
            //asigno el en N° de index al _id de product
            product._id = index + 1; 
            products.push(product);
            }
            return products
        } catch (error) {
        throw error;
        }
    };
    
}


export default MockingService;
