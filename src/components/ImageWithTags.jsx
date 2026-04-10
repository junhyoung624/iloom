import React from 'react';
import { Link } from 'react-router-dom';
import "./scss/ImageWithTags.scss";

export default function ImageWithTags() {
    return (
        <div className='shoppable-area-wrap'>
            <Link>
                <span><img src="" alt="" /></span>
            </Link>
            {/* 제품 개수만큼 map 돌려서 li생성 */}
            {/* <div className="dot-and-box-wrap">
                <ul area-hidden={false}>
                    <li>
                        <a className='dot-area'>dot</a>
                        <div className="price-tag"></div>
                    </li>
                </ul>
            </div> */}
        </div>
    );
}
