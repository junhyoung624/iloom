import React from 'react'

export default function EmptyState({ title, desc, buttonText, to }) {
    return (
        <div className="empty-state">
            <p className="empty-state__title">{title}</p>
            <p className="empty-state__desc">{desc}</p>
            <Link to={to} className="empty-state__btn">{buttonText}</Link>
        </div>
    )
}
