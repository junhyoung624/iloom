import React, { useState } from 'react';

export default function KeywordSearch() {

    console.log(window.location.pathname);

    const [input, setInput] = useState("");

    const handleChange = (e) => {
        setInput(e.target.value);
    }

    return (
        <div className="store-keyword-search">
            <form action="" className="store-search-form">
                <div className="keyword-search">
                    <input type="text" className="keyword" placeholder="Search" onChange={handleChange} value={input} />
                    {/* <button type="submit" className="k_search_btn"><img src="../../images/loco-icon/search_black.png" alt="." /></button> */}
                    <button type="submit" className="k_search_btn">search</button>
                </div>
            </form>
        </div>
    );
}
