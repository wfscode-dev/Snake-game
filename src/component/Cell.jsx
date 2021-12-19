import React from 'react';

const Cell = ({type}) => {
    return (
        <div className={`cell ${type}` }/>
    );
};

export default Cell;