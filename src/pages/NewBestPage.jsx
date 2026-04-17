import React, { useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { useProductStore } from '../store/useProductStore';
import SubCard from '../components/SubCard';
import _default from 'react-select';

const NewBestPage = () => {
    const bannerImgList = [
        { page: "new", imgUrl: "./images/new-best-images/new-banner.png" },
        { page: "BestSeller", imgUrl: "./images/new-best-images/best-banner.jpg" },
    ]

    const location = useLocation();
    const { items, sortType, sortOrder, onSetSort } = useProductStore();

    const NewProduct = location.pathname === "/new";
    const BestSeller = location.pathname === "/BestSeller";

    const tabMenu = ["전체", ...new Set(items.map(item => item.originalCategory))];
    const [selectTab, setSelectTab] = useState("전체");

    let productList = items.filter(item => {
        if (NewProduct) return item.new === true;
        if (BestSeller) return item.BestSeller === true;
    }).filter(tab => {
        if (selectTab === "전체") return true;
        return tab.originalCategory === selectTab;
    })

    useEffect(() => {
        setSelectTab("전체")
    },[NewProduct, BestSeller])

    const pageName = location.pathname === "/new" ? "New Arrival" : "BestSeller"
    const bannerText = location.pathname === "/new" ? "NEW ARRIVAL" : "BEST SELLER"

    if (sortType) {
        productList = [...productList].sort((a, b) => {
            switch (sortType) {
                case "price":
                    const aPrice = Number(String(a.price).replace(/,/g, ""));
                    const bPrice = Number(String(b.price).replace(/,/g, ""));
                    return sortOrder === "asc" ? aPrice - bPrice : bPrice - aPrice;
                case "ranking":
                    return b.ranking - a.ranking
                case "new":
                    return Number(b.new) - Number(a.new)
                case "name":
                    return a.name.localeCompare(b.name)
                default:
                    return 0;
            }
        })
    }

    useEffect(() => {
        onSetSort("price", "desc");
    },[location.pathname])

    const bannerImg = bannerImgList.find(ban => location.pathname === `/${ban.page}`)

    return (
        <div className='sub-page-wrap'>
            <p className='banner-img'><img src={bannerImg?.imgUrl} alt="img" /></p>
            <h2 className='banner-text'>{bannerText}</h2>
            <div className="sub-page">
                <ul className="breadcrumb-list">
                    <li>
                        <Link to="/"><img src="/images/logo-icon/home-icon.png" alt="" /></Link>
                    </li>
                    <li><img src="/images/logo-icon/arrow-right.png" alt="" /></li>
                    <li>
                        <Link to={`/${NewProduct ? "new" : "BestSeller"}`}> {pageName}</Link>
                    </li>
                </ul>
                <div className="inner">
                    <h1>{pageName}</h1>

                    <ul className="menu-tab">
                        {tabMenu.map((tab, id) => (
                            <li
                                key={id}
                                className={selectTab === tab ? "active" : ""}
                                onClick={() => setSelectTab(tab)}>
                                <Link>
                                    {tab}
                                </Link>
                            </li>
                        ))}
                    </ul>
                    {/* <div className="sub-line"></div> */}
                    <div className="sub-product-list-wrap">
                        <div className="sort-wrap">
                            <button className={sortType === "price" ? "active" : ""} onClick={() => onSetSort("price", "desc")}>가격순</button>
                            <button className={sortType === "ranking" ? "active" : ""} onClick={() => onSetSort("ranking", "asc")}>인기순</button>
                            <button className={sortType === "new" ? "active" : ""} onClick={() => onSetSort("new", "asc")}>신상품순</button>
                            <button className={sortType === "name" ? "active" : ""} onClick={() => onSetSort("name", "asc")}>상품명순</button>
                        </div>
                        <ul className="sub-product-list">
                            {productList.map((item, id) => (
                                <li key={id}>
                                    <Link to={`/product/${item.id}`}>
                                        <SubCard item={item} />
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

export default NewBestPage