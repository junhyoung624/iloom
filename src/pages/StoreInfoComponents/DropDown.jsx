import React, { useState } from 'react';
import Select from 'react-select';
import "../scss/dropdown.scss";
// import "../scss/storeInfo.scss";

export default function DropDown({ data, selected }) {
    const [selectedOption, setSelectedOption] = useState("");

    const optionList = data.map(item => ({ value: item.name, label: item.name }));
    // console.log("option list : ", optionList);
    const handleChange = (e) => {
        setSelectedOption(e.value);
        console.log(selectedOption);
        selected(selectedOption);
    }
    return (
        <div className="drop-down-wrap">
            <Select
                className="select-wrap"
                options={optionList}
                placeholder={optionList[0].value}
                onChange={handleChange}
                isSearchable={false} />
        </div>
    );
}
