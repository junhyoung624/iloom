import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import "./scss/ImageWithTags.scss";
import { spaceCoordiData } from '../data/spaceCoordiData.js';

export default function ImageWithTags() {
    const tab_menu = spaceCoordiData.map((item) => item.tab);
    const [selectedTab, setSelectedTab] = useState("tab3");
    const currentObject = spaceCoordiData.filter((item) => item.tab === selectedTab);
    const currentProductList = currentObject[0].products;

    const [shopBtn, setShopBtn] = useState(false);

    const handleTabBtn = (tab) => {
        console.log("tab btn in");
        setSelectedTab(tab);
        setShopBtn(false);
    }

    const handleShopBtn = () => {
        console.log("btn in");

        setShopBtn(!shopBtn);
        console.log(shopBtn);
    }

    console.log(tab_menu);
    return (
        <div className='shoppable-area-wrap'>
            <div className="tab-menu">
                <ul className='tab-menu-list'>
                    {
                        tab_menu.map((tab, id) =>
                            <li key={id}
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
                            currentProductList.map((item, id) =>
                                <li key={id}
                                    style={{ position: "absolute", left: `${item.position.x / 1440 * 100}%`, top: `${item.position.y / 799 * 100}%` }}>
                                    <div className="dot-area">
                                        {/* dot {item.position.x} {item.position.y} */}
                                    </div>
                                    <div className={shopBtn ? "price-tag-active" : "price-tag-hidden"} >
                                        {/* price tag area */}
                                        <div className="tag-inner"
                                            style={{ position: "absolute", transform: `${item.tag_position_code}` }}>
                                            <div className="img-info">
                                                <img src={item.src} alt="." />
                                            </div>
                                            <div className="txt-info">
                                                <p className='item-name'>{item.name}</p>
                                                <p className='item-subname'>{item.subName}</p>
                                                <p className='item-price'>{item.price}</p>
                                            </div>
                                            <div className="button-area">
                                                <p>::</p>
                                            </div>
                                        </div>

                                    </div>

                                </li>

                            )
                        }
                    </ul>
                    <div className="shop-btn-area"
                        onClick={handleShopBtn}>
                        <img src="./images/spaceCoordi/shop-btn.png" alt="." />
                    </div>
                </div>
            </Link >

            {/* 제품 개수만큼 map 돌려서 li생성 */}


            {/* <div className="dot-and-box-wrap">
                <ul area-hidden={false}>
                    <li>
                        <a className='dot-area'>dot</a>
                        <div className="price-tag"></div>
                    </li>
                </ul>
            </div> */}
        </div >
    );
}
