import axios from 'axios';
import { useState } from 'react';

const UseRequestHook =  ({url, method, body, onSuccess}) => {
  const [errors, setErrors] = useState(null);

  const doRequest = async (props = {}) => {

    try {
      setErrors([]);
      console.log('props in useRequestHook', props)
      const response = await axios[method](url, { ...body, ...props });

      if (onSuccess) {
        onSuccess(response.data);
      }
      return response.data;

    } catch (err) {
      console.log('err in useRequestHook = ', err)
      setErrors(
        <div className="alert alert-danger">
          <h4>Ooops...</h4>
          <ul className="my-0">
            {err.response.data.errors.map( err => <li key={err.message}>{err.message}</li>)}
          </ul>
        </div>
      )
    }
  }

  return {doRequest, errors};
}

export default UseRequestHook;