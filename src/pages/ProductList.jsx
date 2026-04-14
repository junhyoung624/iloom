import React from 'react'
import { useParams } from 'react-router-dom'

export default function ProductList() {
    const { category1, category2, category3 } = useParams();
    console.log("c1", category1)
    console.log("c2", category2)
    console.log("c3", category3)
    return (
        <div>ProductList</div>
    )
}
