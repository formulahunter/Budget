function currencyString(centsX100, sign) {
    let str = `$${((Math.abs(centsX100) / 10000).toFixed(2))}`;
    if(sign && centsX100 < 0) {
        str = `${sign[0]}${str}${sign[1] ? sign[1] : ''}`;
    }
    return str;
}

export {currencyString};
