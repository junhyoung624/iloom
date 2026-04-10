import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import "./scss/ImageWithTags.scss";
import { spaceCoordiData } from '../data/spaceCoordiData.js';

export default function ImageWithTags() {
    const tab_menu = spaceCoordiData.map((item) => item.tab);
    const [selectedTab, setSelectedTab] = useState("tab3");
    const currentObject = spaceCoordiData.filter((item) => item.tab === selectedTab);
    const currentProductList = currentObject[0].products;

    console.log(tab_menu);
    return (
        <div className='shoppable-area-wrap'>
            <div className="tab-menu">
                <ul className='tab-menu-list'>
                    {
                        tab_menu.map((tab, id) =>
                            <li key={id}
                                onClick={() => setSelectedTab(tab)}>{tab}</li>
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
                                <li key={id}>
                                    <div className="dot-area"
                                        style={{ position: "absolute", left: `${item.position.x / 1440 * 100}%`, top: `${item.position.y / 799 * 100}%` }}>dot {item.position.x} {item.position.y}</div>
                                </li>
                            )
                        }
                    </ul>
                </div>
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
