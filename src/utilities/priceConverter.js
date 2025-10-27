// Utility function to convert price to float and fix to 2 decimals
export const  formatPrice= (price)=> {
    const parsedPrice = parseFloat(price);
    return isNaN(parsedPrice) ? '0.00' : parsedPrice.toFixed(2); 
  }
  