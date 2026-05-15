import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import "./scss/ImageWithTags.scss";
import { spaceCoordiData } from '../data/spaceCoordiData.js';
import CoordiItemList from './CoordiItemList.jsx';
import ButtonTabs from './common/ButtonTabs.jsx';

const DESKTOP_SPACE_SIZE = { width: 1440, height: 799 };
const MOBILE_SPACE_SIZE = { width: 403, height: 503 };

function useMediaQuery(query) {
    const [matches, setMatches] = useState(() => {
        if (typeof window === 'undefined') return false;
        return window.matchMedia(query).matches;
    });

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const media = window.matchMedia(query);
        const handleChange = () => setMatches(media.matches);

        handleChange();
        media.addEventListener('change', handleChange);

        return () => media.removeEventListener('change', handleChange);
    }, [query]);

    return matches;
}

function getMobileTagTransform(position = {}) {
    if (position.x < 90) {
        return 'translateX(1.4rem) translateY(-50%)';
    }

    if (position.x > 315) {
        return 'translateX(-100%) translateX(-0.5rem) translateY(-50%)';
    }

    if (position.y > 360) {
        return 'translateX(-50%) translateY(-100%) translateY(-0.7rem)';
    }

    return 'translateX(-50%) translateY(1.4rem)';
}


export default function ImageWithTags() {
    const tab_menu = spaceCoordiData.map((item) => item.tab);
    const isMobile = useMediaQuery('(max-width: 768px)');
    const [mobileImageError, setMobileImageError] = useState(false);
    const [selectedTab, setSelectedTab] = useState("주방");

    const currentObject = spaceCoordiData.find((item) => item.tab === selectedTab) || spaceCoordiData[0];
    const currentProductList = currentObject.products;
    const allIdArr = currentProductList.map((item) => item.id);
    const defaultId = currentProductList[0].id;
    const imageSrc = isMobile && currentObject.space_mobile_url && !mobileImageError
        ? currentObject.space_mobile_url
        : currentObject.space_image_url;
    const positionBase = isMobile ? MOBILE_SPACE_SIZE : DESKTOP_SPACE_SIZE;

    const [visibleTags, setVisibleTags] = useState([defaultId]);

    useEffect(() => {
        const defaultItem = currentProductList.filter((item) => item.default).map((item) => item.id);
        setVisibleTags(defaultItem);
    }, [selectedTab]);

    useEffect(() => {
        setMobileImageError(false);
    }, [selectedTab, isMobile]);

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

    const handleTagClick = (itemId) => {
        setVisibleTags((prev) =>
            prev.includes(itemId)
                ? prev.filter((id) => id !== itemId)
                : [...prev, itemId]
        );
    }

    const isAllSelected = visibleTags.length === allIdArr.length;

    return (
        <div>
            <div className='shoppable-area-wrap'>
                <ButtonTabs
                    items={tab_menu}
                    activeKey={selectedTab}
                    onChange={setSelectedTab}
                    ariaLabel="space coordination tabs"
                />
                <div className="shoppable-visual">
                    <span className="shoppable-image-frame">
                        <img
                            src={imageSrc}
                            alt="."
                            onError={() => {
                                if (isMobile && imageSrc !== currentObject.space_image_url) {
                                    setMobileImageError(true);
                                }
                            }}
                        />
                    </span>
                    <div className="dot-and-box-wrap">
                        <ul>
                            {currentProductList.map((item, id) => {
                                const isVisible = visibleTags.includes(item.id);
                                const position = isMobile && item.mobile_position
                                    ? item.mobile_position
                                    : item.position;
                                const tagTransform = isMobile
                                    ? (item.tag_mobile_position_code || getMobileTagTransform(position))
                                    : item.tag_position_code;

                                return (
                                    <li key={id}
                                        className="dot-li"
                                        style={{
                                            position: "absolute",
                                            left: `${position.x / positionBase.width * 100}%`,
                                            top: `${position.y / positionBase.height * 100}%`
                                        }}
                                        onClick={() => handleTagClick(item.id)}
                                        onPointerEnter={(e) => {
                                            if (e.pointerType === 'mouse') handleMouseEnter(item.id)
                                        }}
                                        onPointerLeave={(e) => {
                                            if (e.pointerType === 'mouse') handleMouseLeave(item.id)
                                        }}
                                    >
                                        <div className="dot-area" />

                                        <div className={isVisible ? "price-tag-active" : "price-tag-hidden"}>
                                            <div className="price-tag-inner"
                                                style={{
                                                    position: "absolute",
                                                    transform: tagTransform
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
