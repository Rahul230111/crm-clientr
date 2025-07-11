import React from 'react';
import { Spin } from 'antd';
import mySpinnerImage from '../assets/megacrane.gif'; // Update with your actual image path

const CustomSpinner = ({ tip = "Loading..." }) => {
  const customIcon = (
    <img
      src={mySpinnerImage}
      alt="Loading..."
      style={{ width: 100, height: 100 }}
    />
  );

  return (
    <Spin
      indicator={customIcon}
      tip={tip}
      size="large"
      style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}
    />
  );
};

export default CustomSpinner;
