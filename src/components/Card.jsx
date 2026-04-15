import React from 'react'
import "./scss/Card.scss"

const Card = ({item}) => {
    return (
        <>
            <div className="card-img-box">
                <img src={item.productImages[1]} alt="상품이미지" />
            </div>
            <div className="card-text-box">
                <h1 className='series-name'>{item.series}</h1>
                <p className='product-name'>{item.name}</p>
                <p className='price'>{item.price} 원</p>
            </div>
        </>
    )
}

export default Card