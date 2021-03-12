//import useRequest from '../../hooks/use-request';
//import Link from 'next/link';



const OrdersPage = ({currentUser, orders}) => {


  const orderList = orders.map(order => {
    return (
      <tr key={order.id}>
        <td>{order.id}</td>
        <td>{order.ticket.title}</td>
        <td>{order.ticket.price}</td>
      </tr>
    )
  })


  if (!currentUser) return (<h1>You are NOT signed in</h1>);

  return (
    <div>
      <h1>Orders</h1>
      <table className="table">
        <thead>
          <tr>
            <td>Order id</td>
            <td>Title</td>
            <td>Price</td>
          </tr>
        </thead>
        <tbody>
          {orderList}
        </tbody>
      </table>
    </div>
  )

};



OrdersPage.getInitialProps = async ( context, client, currentUser ) => {
  const { data } = await client.get('/api/orders');
  
  console.log(data)
  return { orders: data };

};

export default OrdersPage;