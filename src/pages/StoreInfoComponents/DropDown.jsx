import React from 'react';


export default function DropDown({ data }) {
    return (
        <div>
            <select name="selectedArea1">
                {
                    data.map((item) => (
                        <option value={item.name}>{item.name}</option>
                    ))
                }
            </select>
        </div>
    );
}
