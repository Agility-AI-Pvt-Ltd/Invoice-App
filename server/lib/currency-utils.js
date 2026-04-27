import axios from 'axios';

const EXCHANGE_API = "https://open.er-api.com/v6/latest/";

export const getExchangeRates = async (base = 'INR') => {
    try {
        const response = await axios.get(`${EXCHANGE_API}${base}`);
        return response.data.rates;
    } catch (error) {
        console.error('Error fetching exchange rates:', error);
        return null;
    }
};
