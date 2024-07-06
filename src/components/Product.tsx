import axios from 'axios';
import { useQuery } from 'react-query';

interface Product {
    product_id: number;
    product_name: string;
    unit_price: number;
}

function getProducts() {
    return axios.get<Product[]>('http://localhost:8080/sql?sql=select * from products order by product_name')
                .then(response => response.data);
}

export function Product() {
    const { data: products, isLoading, isError } = useQuery<Product[], Error>(["products"], getProducts);

    if (isLoading) {
        return <div>Cargando...</div>;
    }

    if (isError) {
        return <div>Error al cargar productos</div>;
    }

    return (
        <table className="table">
            <thead>
                <tr>
                    <th>Id</th>
                    <th>Nombre</th>
                    <th>Precio</th>
                </tr>
            </thead>
            <tbody>
                {products?.map(product => (
                    <tr key={product.product_id}>
                        <td>{product.product_id}</td>
                        <td>{product.product_name}</td>
                        <td className='text-end'>{product.unit_price}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}