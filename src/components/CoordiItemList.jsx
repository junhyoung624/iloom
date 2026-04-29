import React from 'react';
import { spaceCoordiData } from '../data/spaceCoordiData.js';
import "./scss/coordiItemList.scss";
import { Link } from 'react-router-dom';
import SubCard from './Card.jsx';

export default function CoordiItemList(props) {


    return (
        <div className='coordi-item-list-wrap'>
            {spaceCoordiData.map((data) => {
                if (data.tab === props.tab) {
                    return (
                        <div className='coordi-item-list' key={data.tab}>
                            {data.products.map((item) => (
                                <Link
                                    key={item.id}
                                    to={`/product/${item.id}`}
                                    className='coordi-item'
                                >
                                    <img src={item.src} alt={item.name} />
                                    <p className='name'>{item.name}</p>
                                    <p className='subName'>{item.subName}</p>
                                    <p className='price'>{item.price}</p>
                                    {/* <SubCard item={item} /> */}
                                </Link>
                            ))}
                        </div>
                    );
                }

                return null;
            })}
        </div>
    );
}