import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import "./scss/ImageWithTags.scss";
import { spaceCoordiData } from '../data/spaceCoordiData.js';
import CoordiItemList from './CoordiItemList.jsx';


export default function ImageWithTags() {
    const tab_menu = spaceCoordiData.map((item) => item.tab);
    const [selectedTab, setSelectedTab] = useState("주방");

    const currentObject = spaceCoordiData.filter((item) => item.tab === selectedTab);
    const currentProductList = currentObject[0].products;
    const allIdArr = currentProductList.map((item) => item.id);
    const defaultId = currentProductList[0].id;


    //현재 보이는 태그들 id만 저장
    const [visibleTags, setVisibleTags] = useState([defaultId]);

    useEffect(() => {
        const defaultItem = currentProductList.filter((item) => item.default).map((item) => item.id);
        setVisibleTags(defaultItem);
    }, [selectedTab]);

    const handleTabBtn = (tab) => {
        console.log("tab btn in");
        setSelectedTab(tab);
        console.log(currentProductList);
        //setVisibleTags([currentProductList[0].id]); //tab 변경시 초기화
    }

    const handleData = (data) => {
        console.log(data);
    }

    const handleShopBtn = () => {
        const isAllSelected = visibleTags.length === allIdArr.length;

        if (isAllSelected) {
            setVisibleTags([]);
        } else {
            setVisibleTags(allIdArr);
        }
    }

    const handleDot = (itemId) => {

        setVisibleTags((prev) => {
            if (prev.includes(itemId)) {
                //이미 보이는 상태면 숨기기
                return prev.filter((id) => id !== itemId);
            } else {
                //안 보이면 추가
                return [...prev, itemId];
            }

        })

    }
    const isAllSelected = visibleTags.length === allIdArr.length;

    return (
        <div>
            <div className='shoppable-area-wrap'>
                <div className="tab-menu">
                    <ul className='tab-menu-list'>
                        {
                            tab_menu.map((tab, id) =>
                                <li key={id}
                                    className={`tab-menu-name ${selectedTab === tab ? "tab-active" : ""}`}
                                    onClick={() => handleTabBtn(tab)}>{tab}</li>
                            )
                        }
                    </ul>

                </div>
                <Link>
                    <span><img src={spaceCoordiData.filter(item => item.tab === selectedTab)[0].space_image_url} alt="." /></span>
                    <div className="dot-and-box-wrap">
                        <ul>
                            {
                                currentProductList.map((item, id) => {
                                    const isVisible = visibleTags.includes(item.id);

                                    return (
                                        <li key={id}
                                            style={{
                                                position: "absolute",
                                                left: `${item.position.x / 1440 * 100}%`,
                                                top: `${item.position.y / 799 * 100}%`
                                            }}>
                                            <div className="dot-area"
                                                onClick={() => handleDot(item.id)}>
                                                {/* dot {item.position.x} {item.position.y} */}
                                            </div>
                                            <div className={isVisible ? "price-tag-active" : "price-tag-hidden"}  >
                                                {/* price tag area */}
                                                <div className="price-tag-inner"
                                                    style={{
                                                        position: "absolute",
                                                        transform: `${item.tag_position_code}`
                                                    }}>
                                                    <div className="img-info">
                                                        <img src={item.src} alt="." />
                                                    </div>
                                                    <div className="txt-info">
                                                        <p className='item-name'>{item.name}</p>
                                                        <p className='item-subname'>{item.subName}</p>
                                                        <p className='item-price'>{item.price}</p>
                                                    </div>
                                                    <div className="button-area">

                                                        {/* <p>::</p> */}

                                                        <Link

                                                            to={`product/${item.id}`}><p className='tag_arrow_btn'><img src="./images/spaceCoordi/pricetag_icon/arrow.png" alt="." /></p></Link>


                                                    </div>
                                                </div>

                                            </div>

                                        </li>

                                    )
                                }

                                )
                            }
                        </ul>
                        <div className="shop-btn-area"
                            onClick={handleShopBtn}>
                            <img
                                src="./images/spaceCoordi/shop-btn.png"
                                alt="."
                                className={isAllSelected ? "shop-btn-active" : ""} />
                        </div>
                    </div>
                </Link >

            </div >
            <CoordiItemList tab={selectedTab} data={allIdArr} />
        </div>

    );
}
