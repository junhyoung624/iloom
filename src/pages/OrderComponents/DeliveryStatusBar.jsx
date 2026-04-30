import React from 'react';
import { deliverySteps } from '../../data/deliverySteps';
import "../scss/deliveryStatusBar.scss";

const getStepIndex = (status) => {
    const index = deliverySteps.findIndex((step) => step.key === status);
    return index === -1 ? 0 : index;
};

const DeliveryStatusBar = ({ status = "before" }) => {
    const currentStep = getStepIndex(status);
    return (
        <div className="delivery-status-bar">
            {deliverySteps.map((step, index) => {
                const isActive = index <= currentStep;
                const isCurrent = index === currentStep;

                return (
                    <div className="delivery-step-wrap" key={step.key}>
                        <div className="delivery-step-top">
                            <div className={`step-circle ${isActive ? "active" : ""}`}>
                                {isActive ? "✓" : index + 1}
                            </div>

                            {index !== deliverySteps.length - 1 && (
                                <div className={`step-line ${index < currentStep ? "active" : ""}`} />
                            )}
                        </div>

                        <div className="step-text">
                            <p className={`step-label ${isCurrent ? "current" : ""}`}>
                                {step.label}
                            </p>
                            <p className="step-desc">{step.desc}</p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

export default DeliveryStatusBar;
