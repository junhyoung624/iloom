import React from 'react';
import "./scss/spaceCoordi.scss";
import ImageWithTags from './ImageWithTags';

export default function SpaceCoordi() {
    return (
        <section className="space-coordi-wrap">
            <div className="inner">
                <div className="title-box">
                    <h1>더 멋진 공간을 위한 일룸의 제안</h1>
                    <h3>공간에 관한 고민, 일룸의 다양한 제안과 함께 해결해보세요 .</h3>
                </div>
                {/* image component - ImageWithTags*/}
                <ImageWithTags />

                {/* product list component */}
            </div>

        </section>
    );
}
