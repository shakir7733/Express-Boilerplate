const isEmpty = require('../validations/isEmpty')

const getPages = ({pageNumber,pageSize})=>{
    let no;
    let size;
    let offset;

    if (!isEmpty(pageNumber) && !isEmpty(pageSize)) {
        no = pageNumber;
        size = pageSize;
        offset = parseInt(no) * parseInt(size);
    } else {
        no = 0;
        size = 5;
        offset = 0;
    }

    return {no,size,offset}
}


module.exports = getPages