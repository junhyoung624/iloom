import React, { useState } from 'react';
import Select from 'react-select';
import "../scss/dropdown.scss";

export default function DropDown({ data, selected, value, placeholder }) {

    //const optionList = data.map(item => ({ value: item.value, label: item.label }));
    //console.log("option list : ", optionList);
    const handleChange = (option) => {

        selected(option);
    }
    return (
        <div className="drop-down-wrap">
            <Select
                className="select-wrap"
                options={data}
                value={value}
                placeholder={placeholder}
                onChange={handleChange}
                isSearchable={false} />
        </div>
    );
}
