import api from "../app/api";

export const Naira = '₦';
export const convertToThousand = (value:any) => {
    value = value ? value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') : 0;
    return `${Naira}${value}`;
};

export const cutString = (str: string, length: number): string =>{
  if (!str) return "";
  return str.length > length ? str.substring(0, length) + "..." : str;
}

export const capitalizeFirstLetter = (str: string) => (str ? str.replace(/(^\w|\s\w)/g, (m) => m.toUpperCase()) : '');


export const loadStates = async () => {
    try {
        const cached = localStorage.getItem("states");

        if (cached) {
            return JSON.parse(cached);
        }

       
        const response = await api.get(`states/get-states`);
        const data = JSON.stringify(response?.data?.payload);
       console.log({seeData:data})
         localStorage.setItem("states", data);
    } catch (error) {
        console.log(error)
    }
};