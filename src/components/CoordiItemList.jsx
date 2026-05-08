import { spaceCoordiData } from '../data/spaceCoordiData.js';
import "./scss/coordiItemList.scss";
import { Link } from 'react-router-dom';

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
                                    <span className='coordi-item-img-box'>
                                        <img
                                            className='coordi-item-img coordi-item-img-default'
                                            src={item.src}
                                            alt={item.name}
                                        />
                                        {item.hover_src && (
                                            <img
                                                className='coordi-item-img coordi-item-img-hover'
                                                src={item.hover_src}
                                                alt=""
                                                aria-hidden="true"
                                            />
                                        )}
                                    </span>
                                    <p className='name'>{item.name}</p>
                                    <p className='subName'>{item.subName}</p>
                                    <p className='price'>{item.price}</p>
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
