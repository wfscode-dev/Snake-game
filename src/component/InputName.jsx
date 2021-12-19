import React from 'react';
import classes from './InputName.module.css'

const InputName = (props) => {
    return (
        <input className={classes.inputName} {...props}/>
    );
};

export default InputName;