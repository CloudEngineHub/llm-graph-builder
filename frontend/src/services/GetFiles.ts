import axios from 'axios';
import { url } from '../utils/Utils';

export const getSourceNodes = async (userCredentials: any) => {
  const encodedstr = btoa(userCredentials.password);
  try {
    const response = await axios.get(
      `${url()}/sources_list?uri=${userCredentials.uri}&database=${userCredentials.database}&userName=${
        userCredentials.userName
      }&password=${encodedstr}`
    );
    if (response.status != 200) {
      throw new Error('Some error occurred');
    }
    console.log(response);
    return response;
  } catch (error) {
    return error;
  }
};