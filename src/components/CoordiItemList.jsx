import React from 'react';
import { spaceCoordiData } from '../data/spaceCoordiData.js';
import "./scss/coordiItemList.scss";
import { Link } from 'react-router-dom';


export default function CoordiItemList(props) {

    console.log("get data : ", props.data);
    console.log("current tab : ", props.tab);
    return (
        <div className='coordi-item-list-wrap'>
            {/* coordi-item-list-area */}

            {
                spaceCoordiData.map((data, id) => {
                    if (data.tab === props.tab) {
                        return (
                            <div className='coordi-item-list'>
                                {
                                    data.products.map((item, id) =>
                                        <Link key={id}
                                            to={`product/${item.id}`}
                                            className='coordi-item'>
                                            <img src={item.src} alt="." />
                                            <p className='name'>{item.name}</p>
                                            <p className='subName'>{item.subName}</p>
                                            <p className='price'>{item.price}</p>
                                        </Link>
                                    )
                                }

                            </div>
                        )

                    }
                })
            }




        </div>
    );
}
