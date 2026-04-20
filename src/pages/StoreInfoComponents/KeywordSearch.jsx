import React, { useState } from 'react';

export default function KeywordSearch({ keyword, setKeyword }) {

    console.log(window.location.pathname);

    const [input, setInput] = useState("");

    const handleChange = (e) => {
        setInput(e.target.value);
        setKeyword(e.target.value)
    }

    return (
        <div className="store-keyword-search">
            <form
                className="store-search-form"
                onSubmit={(e) => e.preventDefault()}>
                <div className="keyword-search">
                    <input
                        type="text"
                        className="keyword"
                        placeholder="Search"
                        onChange={handleChange} value={keyword} />
                    {/* <button type="submit" className="k_search_btn"><img src="../../images/loco-icon/search_black.png" alt="." /></button> */}
                    <button type="submit" className="k_search_btn">
                        <img src="./images/logo-icon/search-black.png" alt="." />
                    </button>
                </div>
            </form>
        </div>
    );
}
