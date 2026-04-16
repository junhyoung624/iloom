import React, { useState } from 'react';
import { useProductStore } from '../store/useProductStore';
import "./scss/wishlist.scss";

export default function WishList() {
    const { wishlist } = useProductStore();
    //체크된 항목 저장할 변수 (결제하기에 넘겨줄 변수)
    const [checkedItems, setCheckedItems] = useState([]);
    //체크박스 체크 시 실행할 메서드
    //매개값 : 체크된 항목
    const handleChecked = (item) => {
        console.log(item);
    }

    //버튼 호버 이벤트
    const [isHovered, setIsHovered] = useState(false);

    const handleMouseOver = () => {
        setIsHovered(true);
    }

    const handleMouseOut = () => {
        setIsHovered(false);
    }

    return (
        <div className='wish-list-wrap'>
            <div className="inner">
                <div className="page-title">
                    <p>위시리스트</p>
                </div>
                <div className="wish-content">
                    <div className="wish-list-title">
                        <div className="wish-left">
                            <input type="checkbox" className='wish-check-box' />
                        </div>
                        <div className="wish-middle">

                        </div>
                        <div className="wish-right">

                        </div>
                    </div>
                    <ul className="wish-list">
                        {wishlist.map((wish, id) => (
                            <li key={id} className='wish-item'>
                                <div className="check-area">
                                    <input type="checkbox" className='wish-check-box' />
                                </div>
                                <div className="wish-img-info">
                                    <img src={wish.productImages[0]} alt="." />
                                </div>
                                <div className="wish-name-info">
                                    <p>{wish.series}</p>
                                    <h3>{wish.name}</h3>
                                </div>
                                <div className="wish-price-info">
                                    <p>{wish.price} 원</p>
                                </div>
                                <div className="wish-button">
                                    <div className="detail-btn">상세보기</div>
                                    <div className="delete-btn">삭제</div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>

            </div>
        </div>
    );
}
