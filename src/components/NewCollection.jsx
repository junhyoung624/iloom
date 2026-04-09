import React from 'react'
import { Link } from 'react-router-dom'
import "./scss/newcollection.scss"


export default function NewCollection() {
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
                <div>

                </div>
            </div>
        </section>
    )
}
