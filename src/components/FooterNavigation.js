import React from 'react';

const FooterNavigation = ({ onPrevious, onNext, disablePrevious, disableNext }) => {
  return (
    <div className="footer-navigation">
      <button onClick={onPrevious} disabled={disablePrevious}>
        Previous
      </button>
      <button onClick={onNext} disabled={disableNext}>
        Next
      </button>
    </div>
  );
};

export default FooterNavigation;