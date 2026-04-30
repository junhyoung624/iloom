import Select from 'react-select'

export default function GuestOrderForm({
    guestForm,
    errors,
    fieldStatus,
    regionOptions,
    storeOptions,
    selectedRegionOption,
    selectedStoreOption,
    selectedDeliveryReqOption,
    deliveryReqOptions,
    onGuestChange,
    onValidateLiveField,
    onPopupClick,
    onRegionChange,
    onStoreChange,
    onDeliveryReqChange,
}) {
    return (
        <div className="delivery-info-area">
            <div className="title">비회원 주문정보</div>

            <form className="user-form">
                <div className="unlogged-charge-section unlogged-area-left">
                    <h3 className="section-title">주문자 정보</h3>

                    <div className="info-table unlogged-addr-area">
                        <div className="info-row input-zone">
                            <p className="unlogged-requisite-info">주문자명</p>
                            <input
                                type="text"
                                name="name"
                                onChange={onGuestChange}
                                value={guestForm.name}
                                className="unlogged_input"
                                required
                            />
                            {errors.name && (
                                <p className="error-text error-text-right">{errors.name}</p>
                            )}
                        </div>

                        <div className="info-row input-zone">
                            <p className="unlogged-requisite-info">휴대폰</p>
                            <input
                                type="text"
                                name="phone"
                                onChange={onGuestChange}
                                onBlur={(e) => onValidateLiveField(e.target.name, e.target.value, true)}
                                value={guestForm.phone}
                                className={`unlogged_input ${fieldStatus.phone}`}
                                required
                            />
                            {errors.phone && (
                                <p className="error-text error-text-right">{errors.phone}</p>
                            )}
                        </div>

                        <div className="info-row input-zone">
                            <p className="unlogged-requisite-info">이메일</p>
                            <input
                                type="email"
                                name="email"
                                onChange={onGuestChange}
                                onBlur={(e) => onValidateLiveField(e.target.name, e.target.value, true)}
                                value={guestForm.email}
                                className={`unlogged_input ${fieldStatus.email}`}
                                required
                            />
                            {errors.email && (
                                <p className="error-text error-text-right">{errors.email}</p>
                            )}
                        </div>

                        <div className="info-row input-zone">
                            <p className="choose-store">방문 매장 선택</p>

                            <div className="visit-store-box">
                                <div className="txt-info">
                                    <p className="visit-store-sub">
                                        º 주문 제품 선택에 도움을 받은 매장이 있다면 선택해주세요.
                                    </p>
                                    <p className="visit-store-sub">
                                        º 방문 매장이 없다면 "없음"을 선택해주세요.
                                    </p>
                                    <p className="visit-store-guide">
                                        ※ 해당 질문은 더 나은 고객 서비스를 위한 참고자료로 활용될 예정입니다.
                                    </p>
                                </div>

                                <div className="visit-store-select-wrap">
                                    <Select
                                        className="store-select"
                                        options={regionOptions}
                                        value={selectedRegionOption}
                                        placeholder="지역 선택"
                                        onChange={onRegionChange}
                                    />

                                    {guestForm.visitRegionCode !== '없음' && (
                                        <Select
                                            className="store-select"
                                            options={storeOptions}
                                            value={selectedStoreOption}
                                            placeholder="매장 선택"
                                            isSearchable
                                            onChange={onStoreChange}
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="unlogged-charge-section unlogged-area-right">
                    <h3 className="section-title">배송 정보</h3>

                    <div className="info-table unlogged-addr-area">
                        <div className="info-row">
                            <div className="value address-box">
                                <div className="search-addr input-zone">
                                    <p className="search-addr-wrap">
                                        <span className="unlogged-requisite-info">배송지 조회</span>
                                        <span>
                                            {' '}
                                            (* 울릉도 지역은 온라인 주문이 불가하오니, 대리점에 직접 방문해주세요.)
                                        </span>
                                    </p>

                                    <div className="inner">
                                        <input
                                            type="text"
                                            value={guestForm.zipCode}
                                            placeholder="우편번호"
                                            className="zipcode-input unlogged_input"
                                            readOnly
                                            required
                                        />
                                        <button type="button" onClick={onPopupClick}>
                                            우편번호 찾기
                                        </button>
                                    </div>

                                    {errors.zipCode && (
                                        <p className="error-text">{errors.zipCode}</p>
                                    )}
                                </div>

                                <div className="fixed-addr-area input-zone">
                                    <p className="unlogged-requisite-info">주소</p>
                                    <input
                                        type="text"
                                        value={guestForm.address}
                                        placeholder="주소"
                                        className="addr-input unlogged_input"
                                        readOnly
                                        required
                                    />
                                    {errors.address && (
                                        <p className="error-text">{errors.address}</p>
                                    )}
                                </div>

                                <div className="extra-addr-info input-zone">
                                    <p className="extra-addr-wrap">
                                        <span className="unlogged-requisite-info">상세 주소</span>
                                        <span>(도로명 주소를 제외한 상세 주소만 입력해주세요)</span>
                                    </p>
                                    <input
                                        type="text"
                                        name="extraAddress"
                                        onChange={onGuestChange}
                                        value={guestForm.extraAddress}
                                        className="exta-addr-input unlogged_input"
                                        required
                                    />
                                    {errors.extraAddress && (
                                        <p className="error-text">{errors.extraAddress}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="info-row">
                            <span className="label">배송 요청사항</span>

                            <div className="value request-box">
                                <Select
                                    className="delivery-requirement-select"
                                    classNamePrefix="delivery-req"
                                    options={deliveryReqOptions}
                                    value={selectedDeliveryReqOption}
                                    placeholder="배송 요청사항을 선택해주세요"
                                    styles={{
                                        singleValue: (base, state) => ({
                                            ...base,
                                            color: state.data.value === '' ? '#aaa' : '#333',
                                        }),
                                    }}
                                    onChange={onDeliveryReqChange}
                                />

                                {guestForm.request === '직접입력' && (
                                    <textarea
                                        name="customRequest"
                                        value={guestForm.customRequest}
                                        onChange={onGuestChange}
                                        className="delivery-request-textarea"
                                        placeholder="배송 요청사항을 직접 입력해주세요."
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    )
}
