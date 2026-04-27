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

    const [visibleTags, setVisibleTags] = useState([defaultId]);

    useEffect(() => {
        const defaultItem = currentProductList.filter((item) => item.default).map((item) => item.id);
        setVisibleTags(defaultItem);
    }, [selectedTab]);

    const handleTabBtn = (tab) => {
        setSelectedTab(tab);
    }

    const handleShopBtn = () => {
        const isAllSelected = visibleTags.length === allIdArr.length;
        if (isAllSelected) {
            setVisibleTags([]);
        } else {
            setVisibleTags(allIdArr);
        }
    }

    const handleMouseEnter = (itemId) => {
        setVisibleTags((prev) =>
            prev.includes(itemId) ? prev : [...prev, itemId]
        );
    }

    const handleMouseLeave = (itemId) => {
        setVisibleTags((prev) => prev.filter((id) => id !== itemId));
    }

    const isAllSelected = visibleTags.length === allIdArr.length;

    return (
        <div>
            <div className='shoppable-area-wrap'>
                <div className="tab-menu">
                    <ul className='tab-menu-list'>
                        {tab_menu.map((tab, id) =>
                            <li key={id}
                                className={`tab-menu-name ${selectedTab === tab ? "tab-active" : ""}`}
                                onClick={() => handleTabBtn(tab)}>{tab}</li>
                        )}
                    </ul>
                </div>
                <div>
                    <span>
                        <img src={spaceCoordiData.filter(item => item.tab === selectedTab)[0].space_image_url} alt="." />
                    </span>
                    <div className="dot-and-box-wrap">
                        <ul>
                            {currentProductList.map((item, id) => {
                                const isVisible = visibleTags.includes(item.id);

                                return (
                                    <li key={id}
                                        className="dot-li"
                                        style={{
                                            position: "absolute",
                                            left: `${item.position.x / 1440 * 100}%`,
                                            top: `${item.position.y / 799 * 100}%`
                                        }}
                                        onMouseEnter={() => handleMouseEnter(item.id)}
                                        onMouseLeave={() => handleMouseLeave(item.id)}
                                    >
                                        <div className="dot-area" />

                                        <div className={isVisible ? "price-tag-active" : "price-tag-hidden"}>
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
                                                    <Link to={`product/${item.id}`}>
                                                        <p className='tag_arrow_btn'>
                                                            <img src="./images/spaceCoordi/pricetag_icon/arrow.png" alt="." />
                                                        </p>
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                        <div className="shop-btn-area" onClick={handleShopBtn}>
                            <img
                                src="./images/spaceCoordi/shop-btn.png"
                                alt="."
                                className={isAllSelected ? "shop-btn-active" : ""} />
                        </div>
                    </div>
                </div>
            </div>
            <CoordiItemList tab={selectedTab} data={allIdArr} />
        </div>
    );
}