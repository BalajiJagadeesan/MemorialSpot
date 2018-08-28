/**
 * This contains the helper methods to resolve profile images
 */
import {images} from '../config/init'
const resolveImage = (type) => {
    switch (type) {
        case "TREE":
            return images.tree;
        case "BENCH":
            return images.bench;
        case "GARDEN":
            return images.garden;
        case "OTHER":
            return images.other;
    }
};

/**
 * Function to request cloudinary images based on size
 * @param url - Cloudinary URL / Image URL
 * @param size Width of the image
 * @returns URI object to be used in Image Component
 */
const transformImage=(url,size)=>{
    //If url is cloudinary API ,transform image
    if(url.indexOf('https://res.cloudinary.com/') === 0) {
        let src = url.split("/");
        src.splice(src.length - 2, 0, `c_scale,w_${size}`); // add transform to URL
        return {uri: src.join('/')}
    }else{
        //For mock data image
        return {uri: url}
    }
};

export {resolveImage,transformImage}
