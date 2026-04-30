import React from 'react';
import { Link } from 'react-router-dom';
import './scss/subPageEmptyState.scss';

export default function SubPageEmptyState({
    className = '',
    imageSrc,
    imageAlt = '',
    title,
    description,
    actionLabel,
    onAction,
    actionTo,
    icon,
}) {
    return (
        <div className={`mypage-empty-state ${className}`.trim()}>
            {imageSrc && (
                <div className="mypage-empty-state__image-wrap">
                    <img
                        src={imageSrc}
                        alt={imageAlt}
                        className="mypage-empty-state__image"
                    />
                </div>
            )}
            {icon && <div className="mypage-empty-state__icon">{icon}</div>}
            <p className="mypage-empty-state__title">{title}</p>
            {description && (
                <p className="mypage-empty-state__description">{description}</p>
            )}
            {actionLabel && actionTo && (
                <Link
                    to={actionTo}
                    className="mypage-empty-state__action mypage-empty-state__action--link"
                >
                    {actionLabel}
                </Link>
            )}
            {actionLabel && onAction && !actionTo && (
                <button
                    type="button"
                    className="mypage-empty-state__action"
                    onClick={onAction}
                >
                    {actionLabel}
                </button>
            )}
        </div>
    );
}
