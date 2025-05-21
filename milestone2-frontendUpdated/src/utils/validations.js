// Credit card validation utilities

// Luhn algorithm for credit card number validation
export const validateCardNumber = (number) => {
  const digits = number.replace(/\D/g, '');
  if (digits.length < 13 || digits.length > 19) return false;

  let sum = 0;
  let isEven = false;

  // Loop through values starting from the rightmost digit
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits[i]);

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
};

// CCV validation
export const validateCCV = (ccv) => {
  const digits = ccv.replace(/\D/g, '');
  return /^[0-9]{3,4}$/.test(digits);
};

// Expiry date validation
export const validateExpiry = (expiry) => {
  if (!expiry) return false;
  
  const [year, month] = expiry.split('-');
  const expiryDate = new Date(year, month - 1);
  const today = new Date();
  
  // Set to last day of month
  expiryDate.setMonth(expiryDate.getMonth() + 1, 0);
  
  // Set today to start of day
  today.setHours(0, 0, 0, 0);
  
  return expiryDate >= today;
};

// Format card number with spaces
export const formatCardNumber = (number) => {
  const digits = number.replace(/\D/g, '');
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
}; 