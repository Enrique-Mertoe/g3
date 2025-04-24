export const generateUUID = (): string => {
    const randomDigits = () => Math.floor(100 + Math.random() * 900).toString(); // 3-digit number
    return `${randomDigits()}-${randomDigits()}-${randomDigits()}`;
};