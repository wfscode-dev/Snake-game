import React from 'react';
import classes from './StartButton.module.css'

const StartButton = ({children, ...props}) => {
    return (
        <button {...props} className={classes.myBtn}>
            {children}
        </button>
    );
};

export default StartButton;