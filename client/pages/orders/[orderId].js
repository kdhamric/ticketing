import Router from 'next/router';
import { useEffect, useState } from 'react';
import StripeCheckout from 'react-stripe-checkout';
import useRequest from '../../hooks/use-request';

const OrderShow = ({order, currentUser}) => {

  const [ timeLeft, setTimeLeft ] = useState(0)
  const { doRequest, errors } = useRequest({
    url: '/api/payments',
    method: 'post',
    body: {
      orderId: order.id,
    },
    onSuccess: () => Router.push('/orders'),
  })


  useEffect(() => {
    const findTimeLeft = () => {
      const msLeft = new Date(order.expiresAt) - new Date()
      setTimeLeft(Math.round(msLeft/1000));
    }
    
    findTimeLeft();
    const timerId = setInterval(findTimeLeft, 1000);

    return () => {
      clearInterval(timerId);
    }
  }, []);

  if (timeLeft < 0) {
    return(
      <div>Order expired!</div>
    )
  }


  //pk_test_51IGsSSE9UpXBIwMkaMHCVQUSA95qiVAlvnhdrt4aMUtH208NvFxhu86Kj8o08g5duJYDi5jApOzdvu8WpBkXRhFa00etexUC8F

  //timeLeft = ((new Date(order.expiresAt).getTime() - new Date().getTime()) / 1000).toFixed(0);

  return (
    <div>
      <h1>order show {order.id}</h1>
      <div>Time left to pay: {timeLeft} seconds</div>
      <StripeCheckout 
        token={({id}) => doRequest({ token: id })}
        stripeKey = "pk_test_51IGsSSE9UpXBIwMkaMHCVQUSA95qiVAlvnhdrt4aMUtH208NvFxhu86Kj8o08g5duJYDi5jApOzdvu8WpBkXRhFa00etexUC8F"
        amount={order.ticket.price*100}
        email={currentUser.email}
      />
      {errors}
    </div>
  )
}


OrderShow.getInitialProps = async (context, client) => {
  const { orderId } = context.query;
  console.log ('orderId is ', orderId)
  const { data } = await client.get(`/api/orders/${orderId}`);

  return { order: data };
}


export default OrderShow;