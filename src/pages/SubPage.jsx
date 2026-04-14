import React, { useState } from 'react'
import { useProductStore } from '../store/useProductStore'
import { Link, useParams } from 'react-router-dom';
import "./scss/subPage.scss"
import MdPick from '../components/MdPick';

const SubPage = () => {
    const { items, menus } = useProductStore();

    const params = useParams();
    const mainCate = params.originalCategory || originalCategory;
    const subCate = params.category2
    const thirdCate = params.category3

    console.log("dd", mainCate, subCate, thirdCate);

    let cateItems = items.filter((item) => {
        // 메인메뉴
        if (mainCate && item.originalCategory !== mainCate) return false;
        if (subCate && item.category2 !== subCate) return false;
        if (thirdCate && item.category3 !== thirdCate) return false;
        return true;
    })

    const mdPick = !subCate && !thirdCate ? cateItems.filter(md => md.mdPick === true) : []

    const categoryName = thirdCate || subCate || mainCate
    const currentMenu = menus.find(menu => menu.name === mainCate)

    const currentSubMenu = currentMenu?.subMenu.find(sub => sub.name === subCate);
    const thirdTab = currentSubMenu?.thirdMenu || [];
    const tab = currentMenu?.subMenu || [];


    return (
        <div className='sub-page-wrap'>
            <div className="sub-page">
                <div className="inner">
                    <h1>{categoryName}</h1>

                    {!subCate && (
                        <ul className="sub-tab">
                            {tab.map((t, id) => (
                                <li><Link to={`/${mainCate}/${t.name}`}>{t.name}</Link></li>
                            ))}
                        </ul>
                    )}

                    {subCate && (
                        <ul className="third-tab">
                            {thirdTab.map((t) => (
                                <li key={t.name}>
                                    <Link to={`/${mainCate}/${subCate}/${t.name}`}>{t.name}</Link>
                                </li>
                            ))}
                        </ul>
                    )}

                    <div className="md-pick-wrap">
                        <h2>MD's Pick!</h2>
                        <ul className="md-pick">

                            {mdPick.map((md, id) => (
                                <li>
                                    <Link>

                                        <div className="img-box">
                                            <img src={md.productImages[1]} alt="상품이미지" />
                                        </div>
                                        <div className="text-box">
                                            <h1 className='sub-series-name'>{md.series}</h1>
                                            <p className='product-name'>{md.name}</p>
                                            <p className='price'>{md.price} 원</p>
                                        </div>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="sub-line"></div>

                    <div className="sub-product-list-wrap">

                        <ul className="sub-product-list">
                            {cateItems.map((item, id) => (
                                <li key={id}>
                                    <Link>
                                        <div className="product-img-box">
                                            <img src={item.productImages[0]} alt="상품이미지" />
                                        </div>
                                        <div className="product-text-box">
                                            <h1 className='sub-series-name'>{item.series}</h1>
                                            <p className='product-name'>{item.name}</p>
                                            <p className='price'>{item.price} 원</p>
                                        </div>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SubPage