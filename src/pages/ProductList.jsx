import React from 'react'
import { useParams } from 'react-router-dom'

export default function ProductList() {
    const { category1, category2, category3 } = useParams();
    return (
        <div>ProductList</div>
    )
}
