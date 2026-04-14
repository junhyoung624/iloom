import React from 'react'
import { Link } from 'react-router-dom'
import "./scss/newcollection.scss"
import { productData } from '../data/productData'


export default function NewCollection() {
    const newItems = productData.filter((item) => item.new === true)
        .slice(0, 10);
    return (
        <section className='new-collection'>
            <div className="inner">
                <div className='thumbnail'>
                    <img src="./images/new-collection/image-01.png" alt="thumbnail" />
                    <div className="text-box">
                        <h1>NEW COLLECTION</h1>
                        <p>일룸의 새로운 가구로, 더 편안하고 실용적인 공간을 경험해보세요</p>
                        <Link className='btn'>지금 만나보기</Link>
                    </div>
                </div>
                <div className="item-wrap">

                    {newItems.map((item) => (

                        <div className="item-card" key={item.id}>
                            <Link>
                                <img src={`/images/${item.productImages[0]}`} alt={item.name} />
                                <div className="series">{item.series}</div>
                                <h1>{item.name}</h1>
                                <h2>{item.category3}</h2>
                                <span>{item.price}원</span>
                            </Link>
                        </div>
                    ))}

                </div>
            </div>
        </section>
    )
}
