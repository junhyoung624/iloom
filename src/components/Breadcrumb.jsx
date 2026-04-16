import React from 'react'
import { Link } from 'react-router-dom'

const Breadcrumb = ({mainCate, subCate, thirdCate}) => {
    return (
        <>
            <li>
                <Link to="/"><img src="/images/logo-icon/home-icon.png" alt="" /></Link>
            </li>
            <li><img src="/images/logo-icon/arrow-right.png" alt="" /></li>
            <li>
                <Link to={`/${mainCate}`}> {mainCate}</Link>
            </li>
            {subCate && (
                <>
                    <li><img src="/images/logo-icon/arrow-right.png" alt="" /></li>
                    <li>
                        <Link to={`/${mainCate}/${subCate}`}>{subCate}</Link>
                    </li>
                </>
            )}
            {thirdCate && (
                <>
                    <li><img src="/images/logo-icon/arrow-right.png" alt="" /></li>
                    <li>{thirdCate}</li>
                </>
            )}
        </>
    )
}

export default Breadcrumb