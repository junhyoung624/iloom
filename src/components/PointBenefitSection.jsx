export default function PointBenefitSection({ finalPrice, earnPoint }) {
    return (
        <div className="charge-section">
            <h3 className="section-title">
                iloom머니 혜택
                <span className="point-max-badge">
                    최대 {Math.floor(finalPrice * 0.015).toLocaleString()}P
                </span>
            </h3>

            <div className="point-section">
                <div className="point-row">
                    <span className="point-row-label">구매적립 </span>

                    <div className="point-row-right">
                        <span className="point-earn">총 {earnPoint.toLocaleString()}P</span>

                        <div className="point-sub-row">
                            <span>기본적립</span>
                            <span>{earnPoint.toLocaleString()}P</span>
                        </div>
                    </div>
                </div>

                <div className="point-row">
                    <span className="point-row-label">리뷰적립 </span>

                    <div className="point-row-right">
                        <span className="point-earn">
                            최대 {Math.floor(finalPrice * 0.005).toLocaleString()}P
                        </span>

                        <div className="point-sub-row">
                            <span>사진·동영상 리뷰 작성 시</span>
                            <span className="point-green">
                                +{Math.floor(finalPrice * 0.005).toLocaleString()}P
                            </span>
                        </div>
                    </div>
                </div>

                <p className="point-notice">* 동일 상품/한달 리뷰 적립은 각 1회로 제한</p>
            </div>
        </div>
    )
}
