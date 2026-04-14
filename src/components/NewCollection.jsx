import React from 'react'
import { Link } from 'react-router-dom'
import "./scss/newcollection.scss"
import { productData } from '../data/productData'


export default function NewCollection() {
    const newItems = productData.filter((item) => item.new === true)
        .slice(0, 10);
    return (
        <section className='new-collection'>
            <div className='thumbnail'>
                <img src="./images/new-collection/image-01.png" alt="thumbnail" />
                <div className="text-box">
                    <h1>NEW COLLECTION</h1>
                    <p>일룸의 새로운 가구로, 더 편안하고 실용적인 공간을 경험해보세요</p>
                    <Link className='btn'>지금 만나보기</Link>
                </div>
            </div>
            <div className="inner">

                <div className="item-card-wrap">

                    {newItems.map((item, index) => (
                        <Link
                            to={`/product/${item.id}`}
                            className="item-card"
                            key={`${item.id}-${index}`}
                        >
                            <div>
                                <img src={item.productImages[1]} alt={item.name} />
                                <div className="series-name">{item.series}</div>

                                <h1>{item.name}</h1>
                                <span>{item.price}원</span>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section >
    )
}
