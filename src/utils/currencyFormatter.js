/**
 * Utility for handling multicurrency formatting in the Animalia system.
 */

export const CURRENCY_MAPPING = {
    efectivo: 'Bs',
    transferencia: 'Bs',
    punto_venta: 'Bs',
    pago_movil: 'Bs',
    deposito: '$',
    debito: 'Bs',
    divisas: '$',
    yape: 'Bs',
    plin: 'Bs',
    zelle: '$',
    usdt: '$',
};

/**
 * Returns the currency symbol associated with a payment method.
 * @param {string} paymentMethod 
 * @returns {string}
 */
export const getCurrencySymbol = (paymentMethod) => {
    if (!paymentMethod) return 'Bs';
    return CURRENCY_MAPPING[paymentMethod.toLowerCase()] || 'Bs';
};

/**
 * Formats a number as a currency string based on the payment method.
 * @param {number|string} amount 
 * @param {string} paymentMethod 
 * @returns {string}
 */
export const formatCurrency = (amount, paymentMethod) => {
    const symbol = getCurrencySymbol(paymentMethod);
    const numericAmount = parseFloat(amount) || 0;

    // Venezuelan currency formatting (1.000,00) vs International (1,000.00)
    // For simplicity and clarity in the prompt's examples:
    // Bs. 1.500,00 or 50.00 $

    const formattedNumber = numericAmount.toLocaleString('es-VE', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

    if (symbol === '$') {
        return `${formattedNumber} $`;
    } else {
        return `${formattedNumber} Bs`;
    }
};
